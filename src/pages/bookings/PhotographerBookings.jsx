import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function PhotographerBookings() {
  const { token } = useAuth();
  const [monthOnly, setMonthOnly] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const q = monthOnly ? '?month_only=true' : '?month_only=false';
    const res = await fetch(`/api/bookings/photographer${q}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Failed to load bookings');
    setItems(data.items || []);
  }, [token, monthOnly]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load()
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token, load]);

  const canPhotographerCancel = (row) => {
    if (!row?.event_date) return false;
    const days = (new Date(row.event_date) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 7 && row.status !== 'cancelled';
  };

  const canMarkCompleted = (row) => {
    if (!row || !row.id) return false;
    const status = String(row.status || '').toLowerCase();
    if (status === 'completed' || status === 'cancelled') return false;
    if (!row.event_date) return false;
    const startDate = new Date(row.event_date);
    if (Number.isNaN(startDate.getTime())) return false;
    const now = new Date();
    return now >= startDate;
  };

  const completeBooking = async (bookingId) => {
    if (!token) return;
    if (!window.confirm('Mark this booking as completed?')) return;
    setActionLoadingId(bookingId);
    setError('');
    try {
      const res = await fetch('/api/booking/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to mark booking as completed');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to mark booking as completed');
    } finally {
      setActionLoadingId('');
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!token) return;
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoadingId(bookingId);
    setError('');
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to cancel booking');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Confirmed shoots from accepted quotations.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant={monthOnly ? 'default' : 'outline'} size="sm" onClick={() => setMonthOnly(true)}>
              This month
            </Button>
            <Button type="button" variant={!monthOnly ? 'default' : 'outline'} size="sm" onClick={() => setMonthOnly(false)}>
              All
            </Button>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>List</CardTitle>
            <CardDescription>{monthOnly ? 'Bookings starting this calendar month' : 'All your bookings'}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings in this view.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((row) => (
                  <li key={row.id} className="rounded-lg border border-border p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {row.event_title || row.invoice?.event_details?.title || 'Booking'}
                        </p>
                        <p className="text-muted-foreground">{formatEventDate(row.event_date)}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{row.status || '—'}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">₹{Number(row.final_price || 0).toLocaleString()}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={!canMarkCompleted(row) || actionLoadingId === row.id}
                        onClick={() => completeBooking(row.id)}
                        title={!canMarkCompleted(row) ? 'You can mark completed only after event start date.' : ''}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canPhotographerCancel(row) || actionLoadingId === row.id}
                        onClick={() => cancelBooking(row.id)}
                        title={!canPhotographerCancel(row) ? 'Only admin can cancel within 7 days of event.' : ''}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                    {!canMarkCompleted(row) ? (
                      <p className="mt-1 text-xs text-muted-foreground">Can be marked completed only after start date.</p>
                    ) : null}
                    <div>
                      {!canPhotographerCancel(row) ? (
                        <p className="mt-1 text-xs text-muted-foreground">Only admin can cancel within 7 days.</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
