import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const EVENT_TYPES = ['wedding', 'pre_wedding', 'birthday', 'corporate', 'inauguration', 'promotion', 'influencer', 'other'];
const FEATURES = ['cinematography', 'drone', 'album'];

function money(value) {
  return `₹${Number(value || 0).toLocaleString()}`;
}

export default function QuoteSuggestions() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    event_title: '',
    event_type: 'wedding',
    location: '',
    event_date: '',
    duration: 8,
    description: '',
    budget_min: '',
    budget_max: '',
    features: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [myQuotes, setMyQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const toggleFeature = (feature) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        event_type: form.event_type,
        location: form.location.trim(),
        duration: Number(form.duration),
        features: form.features,
      };
      if (form.budget_min) payload.budget_min = Number(form.budget_min);
      if (form.budget_max) payload.budget_max = Number(form.budget_max);
      const res = await fetch('/api/get-quotation-and-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch quote');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  const loadMyQuotes = async () => {
    if (!token) return;
    const res = await fetch('/api/quotation/mine', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load quotations');
    setMyQuotes(data.items || []);
  };

  const loadMessages = async (quotationId) => {
    if (!quotationId || !token) return;
    const res = await fetch(`/api/quotation/${quotationId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load messages');
    setMessages(data.items || []);
  };

  const requestQuotation = async (photographerId) => {
    if (!token) return;
    const payload = {
      photographer_id: photographerId,
      event_title: form.event_title || `${form.event_type} shoot`,
      event_type: form.event_type,
      location: form.location,
      event_date: new Date(form.event_date).toISOString(),
      duration_hours: Number(form.duration),
      description: form.description || null,
      budget: form.budget_max ? Number(form.budget_max) : null,
    };
    const res = await fetch('/api/quotation/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to request quotation');
    await loadMyQuotes();
  };

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

  const confirmBooking = async () => {
    if (!selectedQuote || !token) return;
    const res = await fetch('/api/booking/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quotation_id: selectedQuote.id, pay_stage: 'during_booking' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to confirm booking');
    const payRes = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ booking_id: data.booking_id, simulate_success: true }),
    });
    const payData = await payRes.json().catch(() => ({}));
    if (!payRes.ok) throw new Error(payData.detail || 'Failed to initiate payment');
    await loadMyQuotes();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Budget Quotation</CardTitle>
              <CardDescription>Get AI-assisted photographer suggestions based on event details and budget.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    value={form.event_title}
                    onChange={(e) => setForm((p) => ({ ...p, event_title: e.target.value }))}
                    placeholder="Wedding at Grand Palace"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.event_type}
                    onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))}
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City / Area"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Input
                    type="datetime-local"
                    value={form.event_date}
                    onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Expected ceremony + family portraits"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Budget Min</Label>
                    <Input type="number" min="0" value={form.budget_min} onChange={(e) => setForm((p) => ({ ...p, budget_min: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Max</Label>
                    <Input type="number" min="0" value={form.budget_max} onChange={(e) => setForm((p) => ({ ...p, budget_max: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional requirements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURES.map((feature) => (
                      <label key={feature} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <input type="checkbox" checked={form.features.includes(feature)} onChange={() => toggleFeature(feature)} />
                        <span className="capitalize">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Getting quote...' : 'Get Quote'}
                </Button>
                {token ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => loadMyQuotes().catch((err) => setError(err.message))}
                  >
                    Load My Quotations
                  </Button>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Quotation</CardTitle>
                    <CardDescription>AI-assisted estimate based on similar shoots and pricing rules.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-3xl font-semibold">{money(result.estimated_price)}</p>
                    <p className="text-sm text-muted-foreground">
                      Range: {money(result.price_range?.[0])} - {money(result.price_range?.[1])} • Confidence: {result.confidence}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Photographers</CardTitle>
                    <CardDescription>Best-fit ranked by budget, relevance, ratings, and experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(result.suggested_photographers || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recommendations found for this input.</p>
                    ) : (
                      result.suggested_photographers.map((p) => (
                        <div key={p.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-sm text-muted-foreground">Rating {p.rating} • Match {p.match_score}%</p>
                            </div>
                            <p className="font-semibold">{money(p.estimated_price)}</p>
                          </div>
                          {p.tags?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {p.tags.map((tag) => (
                                <span key={`${p.id}-${tag}`} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {token && user?.role === 'customer' ? (
                            <div className="mt-3">
                              <Button size="sm" onClick={() => requestQuotation(p.id).catch((err) => setError(err.message))}>
                                Request Quotation
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Fill in event details and click "Get Quote" to see pricing and recommendations.
                </CardContent>
              </Card>
            )}

            {token ? (
              <Card>
                <CardHeader>
                  <CardTitle>Quotation Negotiation</CardTitle>
                  <CardDescription>Track requests, negotiate, and finalize bookings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(myQuotes || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No quotations yet. Use the form to request one.</p>
                  ) : (
                    (myQuotes || []).map((q) => (
                      <button
                        type="button"
                        key={q.id}
                        className={`w-full rounded-lg border p-3 text-left ${selectedQuote?.id === q.id ? 'border-primary' : 'border-border'}`}
                        onClick={() => {
                          setSelectedQuote(q);
                          loadMessages(q.id).catch((err) => setError(err.message));
                        }}
                      >
                        <p className="font-medium">{q.event_details?.title || 'Quotation'}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {q.status} {q.latest_amount ? `• ₹${q.latest_amount}` : ''}
                        </p>
                      </button>
                    ))
                  )}
                  {selectedQuote ? (
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      <p className="text-sm font-medium">Discussion</p>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {(messages || []).map((m) => (
                          <div key={m.id} className="rounded-md bg-muted/40 p-2 text-sm">
                            <p className="font-medium capitalize">{m.sender}</p>
                            <p>{m.message || '—'}</p>
                            {m.amount ? <p className="text-xs text-muted-foreground">Amount: ₹{m.amount}</p> : null}
                          </div>
                        ))}
                      </div>

                      {user?.role === 'photographer' ? (
                        <div className="grid gap-2 md:grid-cols-3">
                          <Input placeholder="Amount" type="number" min="1" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
                          <Input placeholder="Message" value={quoteMessage} onChange={(e) => setQuoteMessage(e.target.value)} className="md:col-span-2" />
                          <Button onClick={() => respondQuotation().catch((err) => setError(err.message))} className="md:col-span-3">Submit Quote</Button>
                          <Input placeholder="Revise amount" type="number" min="1" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} />
                          <Input placeholder="Revision message" value={counterMessage} onChange={(e) => setCounterMessage(e.target.value)} className="md:col-span-2" />
                          <Button variant="outline" onClick={() => reviseOrAccept('revise').catch((err) => setError(err.message))} className="md:col-span-2">Send Revision</Button>
                          <Button onClick={() => reviseOrAccept('accept').catch((err) => setError(err.message))}>Accept Counter</Button>
                        </div>
                      ) : null}

                      {user?.role === 'customer' ? (
                        <div className="grid gap-2 md:grid-cols-3">
                          <Input placeholder="Counter amount" type="number" min="1" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} />
                          <Input placeholder="Counter message" value={counterMessage} onChange={(e) => setCounterMessage(e.target.value)} className="md:col-span-2" />
                          <Button variant="outline" onClick={() => reviseOrAccept('counter').catch((err) => setError(err.message))} className="md:col-span-2">Send Counter</Button>
                          <Button onClick={() => reviseOrAccept('accept').catch((err) => setError(err.message))}>Accept Quote</Button>
                          <Button onClick={() => confirmBooking().catch((err) => setError(err.message))} className="md:col-span-3">Confirm Booking & Pay</Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
