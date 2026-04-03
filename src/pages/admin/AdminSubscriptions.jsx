import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminSubscriptions() {
  const token = useAuthStore((s) => s.token);
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [mRes, lRes] = await Promise.all([
          fetch('/api/admin/subscriptions/metrics', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/subscriptions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const mData = await mRes.json().catch(() => ({}));
        const lData = await lRes.json().catch(() => ({}));
        if (!mRes.ok) throw new Error(mData.detail || 'Failed to load metrics');
        if (!lRes.ok) throw new Error(lData.detail || 'Failed to load subscriptions');
        if (!cancelled) {
          setMetrics(mData);
          setRows(Array.isArray(lData) ? lData : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-amber-400/90">
          Admin — demo billing data only
        </div>
        <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Simulated payments from the demo checkout. Revenue totals are for presentation only.
        </p>

        {loading ? <p className="mt-8 text-zinc-500">Loading…</p> : null}
        {error ? <p className="mt-8 text-red-400">{error}</p> : null}

        {!loading && !error && metrics ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Total records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-white">{metrics.total_subscriptions}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Active (success + not expired)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-emerald-400">{metrics.active_subscriptions}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-zinc-800 bg-zinc-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Demo revenue (INR)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-indigo-300">₹{metrics.revenue_demo_total_inr}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {!loading && !error ? (
          <Card className="mt-10 rounded-2xl border-zinc-800 bg-zinc-900/80 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg text-white">All subscription events</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Payment ID</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        No subscription records yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-b border-zinc-800/80 hover:bg-zinc-800/30">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{r.user_name}</div>
                          <div className="text-xs text-zinc-500">{r.user_email}</div>
                        </td>
                        <td className="px-4 py-3 capitalize text-zinc-300">{r.plan}</td>
                        <td className="px-4 py-3 text-zinc-300">₹{r.amount}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              r.status === 'success'
                                ? 'text-emerald-400'
                                : r.status === 'failed'
                                  ? 'text-amber-400'
                                  : 'text-zinc-400'
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.payment_id}</td>
                        <td className="px-4 py-3 text-zinc-500">{formatDate(r.start_date)}</td>
                        <td className="px-4 py-3 text-zinc-500">{formatDate(r.expiry_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
