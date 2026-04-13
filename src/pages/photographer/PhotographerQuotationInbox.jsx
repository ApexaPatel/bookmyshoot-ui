import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

function formatEventDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  } catch {
    return String(value);
  }
}

export default function PhotographerQuotationInbox() {
  const { token } = useAuth();
  const [myQuotes, setMyQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  const loadMyQuotes = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/quotation/mine', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load quotations');
    setMyQuotes(data.items || []);
  }, [token]);

  const loadMessages = async (quotationId) => {
    if (!quotationId || !token) return;
    const res = await fetch(`/api/quotation/${quotationId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load messages');
    setMessages(data.items || []);
  };

  useEffect(() => {
    if (!token) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    loadMyQuotes()
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoadingList(false));
  }, [token, loadMyQuotes]);

  const respondQuotation = async () => {
    if (!selectedQuote || !token) return;
    const res = await fetch('/api/quotation/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        quotation_id: selectedQuote.id,
        amount: Number(quoteAmount),
        message: quoteMessage || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to respond');
    setQuoteAmount('');
    setQuoteMessage('');
    await loadMyQuotes();
    await loadMessages(selectedQuote.id);
  };

  const reviseOrAccept = async (action) => {
    if (!selectedQuote || !token) return;
    const res = await fetch('/api/quotation/revise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        quotation_id: selectedQuote.id,
        action,
        counter_amount: action === 'accept' ? undefined : Number(counterAmount),
        message: counterMessage || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to update negotiation');
    setCounterAmount('');
    setCounterMessage('');
    await loadMyQuotes();
    await loadMessages(selectedQuote.id);
  };

  const ev = selectedQuote?.event_details || {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Quotation requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review incoming quote requests from customers, send your price, and handle counter-offers.
          </p>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px),1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Requests assigned to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingList ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (myQuotes || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No quotation requests yet.</p>
              ) : (
                (myQuotes || []).map((q) => (
                  <button
                    type="button"
                    key={q.id}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedQuote?.id === q.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                    }`}
                    onClick={() => {
                      setSelectedQuote(q);
                      setError('');
                      loadMessages(q.id).catch((err) => setError(err.message));
                    }}
                  >
                    <p className="font-medium">{q.event_details?.title || 'Quotation'}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {q.status}
                      {q.latest_amount != null ? ` • ₹${Number(q.latest_amount).toLocaleString()}` : ''}
                    </p>
                  </button>
                ))
              )}
              <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => loadMyQuotes().catch((err) => setError(err.message))}>
                Refresh
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {selectedQuote ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Event details</CardTitle>
                    <CardDescription>What the customer asked for</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Title</span>
                      <p className="font-medium">{ev.title || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type</span>
                      <p className="font-medium capitalize">{(ev.event_type || '—').replaceAll('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <p className="font-medium">{ev.location || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date</span>
                      <p className="font-medium">{formatEventDate(ev.event_date)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{ev.duration_hours != null ? `${ev.duration_hours} h` : '—'}</p>
                    </div>
                    {ev.budget != null ? (
                      <div>
                        <span className="text-muted-foreground">Budget</span>
                        <p className="font-medium">₹{Number(ev.budget).toLocaleString()}</p>
                      </div>
                    ) : null}
                    {ev.description ? (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Description</span>
                        <p className="mt-1 text-foreground">{ev.description}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Negotiation</CardTitle>
                    <CardDescription>Message thread and your responses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                      {(messages || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No messages yet. Submit your first quote below.</p>
                      ) : (
                        (messages || []).map((m) => (
                          <div key={m.id} className="rounded-md bg-muted/40 p-2 text-sm">
                            <p className="font-medium capitalize">{m.sender}</p>
                            <p>{m.message || '—'}</p>
                            {m.amount != null ? (
                              <p className="text-xs text-muted-foreground">Amount: ₹{Number(m.amount).toLocaleString()}</p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>

                    {['booked', 'expired'].includes(selectedQuote.status) ? (
                      <p className="text-sm text-muted-foreground">This quotation is closed ({selectedQuote.status}).</p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-3">
                        <Input
                          placeholder="Amount"
                          type="number"
                          min="1"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                        />
                        <Input
                          placeholder="Message"
                          value={quoteMessage}
                          onChange={(e) => setQuoteMessage(e.target.value)}
                          className="md:col-span-2"
                        />
                        <Button onClick={() => respondQuotation().catch((err) => setError(err.message))} className="md:col-span-3">
                          Submit quote
                        </Button>
                        <Input
                          placeholder="Revise amount"
                          type="number"
                          min="1"
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                        />
                        <Input
                          placeholder="Revision message"
                          value={counterMessage}
                          onChange={(e) => setCounterMessage(e.target.value)}
                          className="md:col-span-2"
                        />
                        <Button
                          variant="outline"
                          onClick={() => reviseOrAccept('revise').catch((err) => setError(err.message))}
                          className="md:col-span-2"
                        >
                          Send revision
                        </Button>
                        <Button onClick={() => reviseOrAccept('accept').catch((err) => setError(err.message))}>Accept counter</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Select a request from the inbox to view details and respond.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
