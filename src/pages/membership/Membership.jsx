import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Gift, IndianRupee, Loader2, XCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Membership() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutStep, setCheckoutStep] = useState('form'); // form | processing | success | failed
  const [paymentRef, setPaymentRef] = useState('');

  const activeMembership = Boolean(user?.isMember && user?.membershipExpiry && new Date(user.membershipExpiry) > new Date());
  const totalDays = 365;
  const remainingDays = useMemo(() => {
    if (!activeMembership || !user?.membershipExpiry) return 0;
    const diffMs = new Date(user.membershipExpiry).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [activeMembership, user?.membershipExpiry]);
  const usagePercent = Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100));
  const isAdminRole = ['super_admin', 'admin', 'staff'].includes(user?.role);

  if (isAdminRole) {
    return <Navigate to="/admin" replace />;
  }

  const activateMembership = async () => {
    if (!token) return;
    const res = await fetch('/api/membership/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_reference: `dummy-${paymentMethod}`,
        simulate_success: !simulateFailure,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to purchase membership');
    if (data?.success) {
      await refreshUser();
    }
    return data;
  };

  const onPayNow = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setCheckoutStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 2200));
    if (simulateFailure) {
      setLoading(false);
      setCheckoutStep('failed');
      return;
    }
    try {
      const data = await activateMembership();
      setPaymentRef(data?.payment_id || '');
      if (data?.success) {
        setCheckoutStep('success');
        setMessage('Membership Activated Successfully!');
      } else {
        setCheckoutStep('failed');
        setError(data?.message || 'Payment could not be completed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to purchase membership');
      setCheckoutStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = () => {
    setCheckoutOpen(true);
    setCheckoutStep('form');
    setSimulateFailure(false);
    setPaymentMethod('card');
    setPaymentRef('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>
                Unlock auction booking and get 10% discount on every booking with annual membership.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Membership Fee</p>
                    <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-primary">
                      <IndianRupee className="h-6 w-6" />
                      999 <span className="text-lg font-medium text-foreground">/ year</span>
                    </p>
                  </div>
                  {activeMembership ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Active Membership
                    </span>
                  ) : null}
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span>10% discount on every booking</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>Access to auction booking</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>365 days validity</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Status</p>
                  <p className={`mt-1 font-medium ${activeMembership ? 'text-emerald-500' : ''}`}>
                    {activeMembership ? 'Active' : 'Not Active'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Start</p>
                  <p className="mt-1 font-medium">{formatDate(user?.membershipStart)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Expiry</p>
                  <p className="mt-1 font-medium">{formatDate(user?.membershipExpiry)}</p>
                </div>
                <div className="md:col-span-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Membership progress</span>
                    <span>{activeMembership ? `${remainingDays} days remaining` : 'Not active'}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${activeMembership ? usagePercent : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button onClick={openCheckout} disabled={loading} className="w-full md:w-auto">
                {activeMembership ? 'Renew Membership 🔄' : 'Upgrade Experience 🚀'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          {checkoutStep === 'form' ? (
            <>
              <DialogHeader>
                <DialogTitle>Membership Checkout</DialogTitle>
                <DialogDescription>Dummy payment flow for demo. Razorpay can replace this layer later.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="font-medium">Plan: Membership</p>
                  <p className="text-sm text-muted-foreground">Price: ₹999/year</p>
                  <p className="text-sm text-muted-foreground">User: {user?.email || '—'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['card', 'upi', 'netbanking'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-md border px-3 py-2 text-sm capitalize ${
                          paymentMethod === method ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  Simulate Failure
                </label>
                <Input value="Dummy checkout — no real payment processed" readOnly />
              </div>
              <DialogFooter>
                <Button onClick={onPayNow} disabled={loading}>Pay Now</Button>
              </DialogFooter>
            </>
          ) : null}

          {checkoutStep === 'processing' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Processing payment...</p>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your membership.</p>
            </div>
          ) : null}

          {checkoutStep === 'failed' ? (
            <>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-xl font-semibold">Payment Failed</p>
                <p className="text-sm text-muted-foreground">Payment could not be completed. Please try again.</p>
                {paymentRef ? <p className="text-xs text-muted-foreground">Reference: {paymentRef}</p> : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCheckoutStep('form')}>Try Again</Button>
              </DialogFooter>
            </>
          ) : null}

          {checkoutStep === 'success' ? (
            <>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="text-xl font-semibold">Membership Activated Successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Validity: {formatDate(user?.membershipStart || new Date())} - {formatDate(user?.membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}
                </p>
                {paymentRef ? <p className="text-xs text-muted-foreground">Transaction ID: {paymentRef}</p> : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => navigate('/profile')}>Go to Dashboard</Button>
                <Button onClick={() => navigate('/auction')}>Explore Auctions</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
