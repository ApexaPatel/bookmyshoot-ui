import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

function BookingCard({ row }) {
  const title = row.event_title || row.invoice?.event_details?.title || 'Booking';
  const inv = row.invoice?.invoice_number;
  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-muted-foreground">{formatEventDate(row.event_date)}</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{row.status || '—'}</span>
      </div>
      <p className="mt-2 text-muted-foreground">
        Final: ₹{Number(row.final_price || 0).toLocaleString()}
        {row.discount_applied ? ` • Discount applied` : ''}
      </p>
      {inv ? <p className="text-xs text-muted-foreground">Invoice: {inv}</p> : null}
    </div>
  );
}

export default function MyBookings() {
  const { token, user, loading: authLoading } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'customer') {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/bookings/user', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Failed to load bookings');
        setUpcoming(data.upcoming || []);
        setPast(data.past || []);
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token, user?.role]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-10 md:px-10">
        <h1 className="text-2xl font-semibold text-white">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming and past shoots from confirmed quotations.</p>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Events on or after today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
                ) : (
                  upcoming.map((row) => <BookingCard key={row.id} row={row} />)
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Past</CardTitle>
                <CardDescription>Earlier events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {past.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No past bookings.</p>
                ) : (
                  past.map((row) => <BookingCard key={row.id} row={row} />)
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
