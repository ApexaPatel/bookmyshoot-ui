import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPhotographerPlanRules } from '@/lib/photographerPlans';

const DEFAULT_FORM = {
  title: '',
  event_type: 'wedding',
  location: '',
  event_date: '',
  description: '',
  budget: '',
  required_features: '',
  bidding_deadline: '',
};

function money(v) {
  return `₹${Number(v || 0).toLocaleString()}`;
}

export default function AuctionMarketplace() {
  const { user, token } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [auctions, setAuctions] = useState([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [bids, setBids] = useState([]);
  const [bidInputs, setBidInputs] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhotographer = user?.role === 'photographer';
  const photographerPlanCode = (user?.photographerPlan || 'free').toLowerCase();
  const photographerPlan = getPhotographerPlanRules(photographerPlanCode);
  const hasActiveMembership = Boolean(
    user?.isMember && user?.membershipExpiry && new Date(user.membershipExpiry) > new Date()
  );
  const canBid = isPhotographer && ['pro', 'premium'].includes(photographerPlanCode);
  const isFreePhotographer = isPhotographer && photographerPlanCode === 'free';
  const canCreateAuction = user?.role === 'customer' && hasActiveMembership;
  const isCustomerWithoutMembership = user?.role === 'customer' && !hasActiveMembership;
  const [paywallOpen, setPaywallOpen] = useState(false);

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchAuctions = async () => {
    if (!token) return;
    const url = canCreateAuction ? '/api/auction/list?mine=true' : '/api/auction/list';
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (isFreePhotographer && res.status === 403) {
        setAuctions([]);
        return;
      }
      throw new Error(data.detail || 'Failed to load auctions');
    }
    setAuctions(data.auctions || []);
  };

  const fetchBids = async (eventId) => {
    if (!eventId || !token) return;
    const res = await fetch(`/api/auction/${eventId}/bids`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load bids');
    setBids(data.bids || []);
  };

  useEffect(() => {
    fetchAuctions().catch((e) => setError(e.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role, user?.photographerPlan]);

  const submitAuction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        title: form.title,
        event_type: form.event_type,
        location: form.location,
        event_date: new Date(form.event_date).toISOString(),
        description: form.description || null,
        budget: form.budget ? Number(form.budget) : null,
        required_features: form.required_features
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean),
        bidding_deadline: new Date(form.bidding_deadline).toISOString(),
      };
      const res = await fetch('/api/auction/create', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to create auction');
      setMessage('Auction created successfully.');
      setForm(DEFAULT_FORM);
      await fetchAuctions();
    } catch (err) {
      setError(err.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (auctionId) => {
    const bid = bidInputs[auctionId];
    if (!bid?.amount) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          event_id: auctionId,
          bid_amount: Number(bid.amount),
          message: bid.message || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to place bid');
      setMessage(data.message || 'Bid submitted');
      await fetchAuctions();
    } catch (err) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const selectBid = async (auctionId, bidId) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auction/select', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ event_id: auctionId, bid_id: bidId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to select bid');
      setMessage(`Booking finalized. Final price: ${money(data.final_price)}`);
      await fetchAuctions();
      await fetchBids(auctionId);
    } catch (err) {
      setError(err.message || 'Failed to select bid');
    } finally {
      setLoading(false);
    }
  };

  const cancelAuction = async (auctionId) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auction/cancel', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ event_id: auctionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to cancel auction');
      setMessage(data.message || 'Auction cancelled');
      await fetchAuctions();
      if (selectedAuctionId === auctionId) {
        setSelectedAuctionId('');
        setBids([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auction Booking Marketplace</CardTitle>
              <CardDescription>
                {canCreateAuction
                  ? 'Create auction events and compare bids from photographers.'
                  : canBid
                    ? 'Browse open auctions and submit competitive bids.'
                    : isCustomerWithoutMembership
                      ? 'Unlock membership to create auction events and access bidding workflows.'
                    : isFreePhotographer
                      ? 'Free plan cannot access auctions. Upgrade to Pro to view events and place bids.'
                      : 'Only Pro/Premium photographers can place bids.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPhotographer ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {photographerPlan.name} Plan
                  </span>
                  {photographerPlanCode === 'premium' ? (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">
                      Priority Auction Ranking
                    </span>
                  ) : null}
                </div>
              ) : null}
              {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </CardContent>
          </Card>

          {isCustomerWithoutMembership ? (
            <Card>
              <CardHeader>
                <CardTitle>Unlock Auction Feature</CardTitle>
                <CardDescription>
                  Get access to competitive bidding and save more on bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>10% discount on every booking</li>
                  <li>Auction access with competitive bids</li>
                  <li>Priority booking experience</li>
                </ul>
                <Button asChild>
                  <Link to="/membership">Buy Membership</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {isFreePhotographer ? (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro to Unlock Auctions</CardTitle>
                <CardDescription>
                  Free plan photographers cannot view auction events or participate in bidding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>View open auction events</li>
                  <li>Participate in competitive bidding</li>
                  <li>Get higher marketplace visibility</li>
                </ul>
                <Button asChild>
                  <Link to="/billing">Upgrade Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {canCreateAuction ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Auction Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid gap-3 md:grid-cols-2" onSubmit={submitAuction}>
                  <Input placeholder="Event title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                  <Input placeholder="Event type (wedding, corporate...)" value={form.event_type} onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))} required />
                  <Input placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
                  <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))} required />
                  <Input placeholder="Budget (optional)" type="number" min="0" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} />
                  <Input type="datetime-local" value={form.bidding_deadline} onChange={(e) => setForm((p) => ({ ...p, bidding_deadline: e.target.value }))} required />
                  <Input className="md:col-span-2" placeholder="Required features (comma separated: drone, album)" value={form.required_features} onChange={(e) => setForm((p) => ({ ...p, required_features: e.target.value }))} />
                  <Input className="md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={loading}>Create Auction</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : user?.role === 'customer' ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Auction Event</CardTitle>
                <CardDescription>Membership required to create auction events.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setPaywallOpen(true)}>Buy Membership</Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{canCreateAuction ? 'My Auctions' : 'Open Auctions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auctions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No auctions found.</p>
              ) : (
                auctions.map((auction) => (
                  <div key={auction.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{auction.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {auction.event_type} • {auction.location} • Deadline {new Date(auction.bidding_deadline).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{auction.status}</span>
                    </div>
                    {auction.description ? <p className="mt-2 text-sm text-muted-foreground">{auction.description}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canCreateAuction ? (
                        <>
                          <Button size="sm" variant="outline" onClick={async () => { setSelectedAuctionId(auction.id); await fetchBids(auction.id); }}>
                            View Bids
                          </Button>
                          {auction.status === 'open' ? (
                            <Button size="sm" variant="outline" onClick={() => cancelAuction(auction.id)} disabled={loading}>
                              Cancel
                            </Button>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Bid amount"
                            className="w-[140px]"
                            value={bidInputs[auction.id]?.amount || ''}
                            onChange={(e) =>
                              setBidInputs((prev) => ({
                                ...prev,
                                [auction.id]: { ...(prev[auction.id] || {}), amount: e.target.value },
                              }))
                            }
                            disabled={!canBid}
                          />
                          <Input
                            placeholder="Message"
                            className="w-[240px]"
                            value={bidInputs[auction.id]?.message || ''}
                            onChange={(e) =>
                              setBidInputs((prev) => ({
                                ...prev,
                                [auction.id]: { ...(prev[auction.id] || {}), message: e.target.value },
                              }))
                            }
                            disabled={!canBid}
                          />
                          <Button size="sm" onClick={() => placeBid(auction.id)} disabled={!canBid || loading}>
                            Place Bid
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {canCreateAuction && selectedAuctionId ? (
            <Card>
              <CardHeader>
                <CardTitle>Bids Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bids yet for this auction.</p>
                ) : (
                  bids.map((bid) => (
                    <div key={bid.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{bid.photographer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Rating {Number(bid.rating || 0).toFixed(1)} • {(bid.photographer_plan || 'free').toUpperCase()}
                          </p>
                          {bid.priority_ranked ? (
                            <p className="mt-1 text-xs text-amber-500">Priority ranked bidder</p>
                          ) : null}
                        </div>
                        <p className="font-semibold">{money(bid.bid_amount)}</p>
                      </div>
                      {bid.message ? <p className="mt-2 text-sm text-muted-foreground">{bid.message}</p> : null}
                      <div className="mt-3">
                        <Button size="sm" onClick={() => selectBid(selectedAuctionId, bid.id)} disabled={loading}>
                          Select Photographer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      <Footer />

      <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Auction Feature</DialogTitle>
            <DialogDescription>
              Membership required to create auction events and access full bidding flows.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>10% discount on every booking</li>
            <li>Access to auction booking</li>
            <li>365 days validity</li>
          </ul>
          <DialogFooter>
            <Button asChild>
              <Link to="/membership">Buy Membership</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
