import { useState } from 'react';
import { CreditCard, Landmark, Smartphone, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PHOTOGRAPHER_PLAN_RULES } from '@/lib/photographerPlans';

const METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
];

function detailMessage(data) {
  const d = data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return null;
}

export default function DemoCheckoutModal({
  open,
  onOpenChange,
  planCode,
  userName,
  userEmail,
  token,
  onPaidSuccess,
}) {
  const [method, setMethod] = useState('card');
  const [simulateSuccess, setSimulateSuccess] = useState(true);
  const [phase, setPhase] = useState('form');
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');

  const plan = PHOTOGRAPHER_PLAN_RULES[planCode] || PHOTOGRAPHER_PLAN_RULES.pro;

  const reset = () => {
    setPhase('form');
    setPaymentId('');
    setError('');
    setMethod('card');
    setSimulateSuccess(true);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handlePay = async () => {
    setError('');
    setPhase('processing');
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const res = await fetch('/api/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planCode,
          simulate_success: simulateSuccess,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(detailMessage(data) || 'Payment request failed');
      }
      setPaymentId(data.payment_id || '');
      if (data.success) {
        setPhase('success');
        onPaidSuccess?.(data);
      } else {
        setPhase('failure');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong');
      setPhase('form');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-checkout-title"
    >
      <Card className="relative w-full max-w-md rounded-2xl border-zinc-700 bg-zinc-900 text-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <CardHeader className="space-y-2 pr-12">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400/90">
            Demo checkout — not a real payment
          </p>
          <CardTitle id="demo-checkout-title" className="text-2xl text-white">
            {phase === 'success'
              ? 'Payment successful'
              : phase === 'failure'
                ? 'Payment declined'
                : 'Complete upgrade'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {phase === 'form' ? (
            <>
              <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4">
                <p className="text-sm text-zinc-400">Plan</p>
                <p className="text-lg font-semibold text-white">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold text-indigo-300">
                  ₹{plan.priceInr}
                  <span className="text-sm font-normal text-zinc-500"> /month</span>
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-500">Billed to</p>
                <p className="font-medium text-white">{userName || '—'}</p>
                <p className="text-zinc-400">{userEmail || '—'}</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-300">Payment method (simulated)</p>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-colors ${
                        method === id
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-zinc-700 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={simulateSuccess}
                  onChange={(e) => setSimulateSuccess(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-300">Simulate successful payment</span>
              </label>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button
                type="button"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={handlePay}
              >
                Pay now
              </Button>
            </>
          ) : null}

          {phase === 'processing' ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-400" aria-hidden />
              <p className="text-center text-sm text-zinc-400">Processing demo payment…</p>
            </div>
          ) : null}

          {phase === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-400" aria-hidden />
              <p className="text-sm text-zinc-300">Your plan has been upgraded for this demo app.</p>
              {paymentId ? (
                <p className="font-mono text-xs text-zinc-500">
                  Transaction ID: <span className="text-zinc-300">{paymentId}</span>
                </p>
              ) : null}
              <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : null}

          {phase === 'failure' ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle className="h-14 w-14 text-amber-400" aria-hidden />
              <p className="text-sm text-zinc-300">This was a simulated failure. Your plan was not changed.</p>
              {paymentId ? (
                <p className="font-mono text-xs text-zinc-500">
                  Reference: <span className="text-zinc-300">{paymentId}</span>
                </p>
              ) : null}
              <Button type="button" variant="outline" className="border-zinc-600" onClick={reset}>
                Try again
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
