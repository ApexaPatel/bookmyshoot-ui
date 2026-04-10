import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

const TABS = ['dashboard', 'users', 'photographers', 'payments'];

function fmtCurrency(v) {
  return `₹${Number(v || 0).toLocaleString()}`;
}

export default function AdminPanel() {
  const token = useAuthStore((s) => s.token);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [graph, setGraph] = useState([]);
  const [eventStats, setEventStats] = useState([]);
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [photographers, setPhotographers] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentTab, setPaymentTab] = useState('subscriptions');
  const [paymentRows, setPaymentRows] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', description: '' });

  const [userFilters, setUserFilters] = useState({ search: '', role: '', page: 1, limit: 10 });
  const [photographerFilters, setPhotographerFilters] = useState({ search: '', plan: '', page: 1, limit: 10 });

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const apiGet = useCallback(async (path) => {
    const res = await fetch(path, { headers: authHeaders });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }, [authHeaders]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        if (tab === 'dashboard') {
          const [s, g, e] = await Promise.all([
            apiGet('/api/admin/dashboard/summary'),
            apiGet('/api/admin/dashboard/graph'),
            apiGet('/api/admin/dashboard/event-stats'),
          ]);
          if (!cancelled) {
            setSummary(s);
            setGraph(Array.isArray(g) ? g : []);
            setEventStats(Array.isArray(e) ? e : []);
          }
        } else if (tab === 'users') {
          const q = new URLSearchParams({
            page: String(userFilters.page),
            limit: String(userFilters.limit),
            sort: 'newest',
          });
          if (userFilters.search) q.set('search', userFilters.search);
          if (userFilters.role) q.set('role', userFilters.role);
          const data = await apiGet(`/api/admin/users?${q.toString()}`);
          if (!cancelled) setUsers(data);
        } else if (tab === 'photographers') {
          const q = new URLSearchParams({
            page: String(photographerFilters.page),
            limit: String(photographerFilters.limit),
            sort: 'newest',
          });
          if (photographerFilters.search) q.set('search', photographerFilters.search);
          if (photographerFilters.plan) q.set('plan', photographerFilters.plan);
          const data = await apiGet(`/api/admin/photographers?${q.toString()}`);
          if (!cancelled) setPhotographers(data);
        } else if (tab === 'payments') {
          const [s, list] = await Promise.all([
            apiGet('/api/admin/payments/summary'),
            apiGet(`/api/admin/payments/${paymentTab}?page=1&limit=20`),
          ]);
          if (!cancelled) {
            setPaymentsSummary(s);
            setPaymentRows(Array.isArray(list.items) ? list.items : []);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load admin data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, token, userFilters, photographerFilters, paymentTab, authHeaders]);

  async function updateRole(userId, role) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to update role');
      setUserFilters((f) => ({ ...f }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function softDeleteUser(path, id) {
    if (!window.confirm('Soft delete this record?')) return;
    try {
      const res = await fetch(`/api/admin/${path}/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Delete failed');
      if (path === 'users') setUserFilters((f) => ({ ...f }));
      if (path === 'photographers') setPhotographerFilters((f) => ({ ...f }));
      if (paymentTab === 'expenses') setPaymentTab('expenses');
    } catch (e) {
      setError(e.message);
    }
  }

  async function addExpense(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expenseForm.title,
          amount: Number(expenseForm.amount),
          description: expenseForm.description || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to add expense');
      setExpenseForm({ title: '', amount: '', description: '' });
      setPaymentTab('expenses');
      setTab('payments');
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-8 md:px-10">
        <div className="grid gap-6 md:grid-cols-[220px,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TABS.map((t) => (
                <Button key={t} variant={tab === t ? 'default' : 'outline'} className="w-full justify-start capitalize" onClick={() => setTab(t)}>
                  {t}
                </Button>
              ))}
            </CardContent>
          </Card>

          <section className="space-y-4">
            {loading ? <p className="text-muted-foreground">Loading...</p> : null}
            {error ? <p className="text-destructive">{error}</p> : null}

            {tab === 'dashboard' && summary ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric title="New Photographers (Month)" value={summary.new_photographers} />
                  <Metric title="New Customers (Month)" value={summary.new_customers} />
                  <Metric title="Subscriptions (Month)" value={summary.subscriptions_count} />
                  <Metric title="Shoots Booked (Month)" value={summary.total_shoots_booked} />
                </div>
                <Card>
                  <CardHeader><CardTitle>Last 30 Days Activity</CardTitle></CardHeader>
                  <CardContent className="grid gap-2">
                    {graph.slice(-10).map((g) => (
                      <div key={g.date} className="grid grid-cols-[90px,1fr] items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{g.date.slice(5)}</span>
                        <div className="flex gap-2">
                          <Bar label="R" value={g.registrations} color="bg-primary" />
                          <Bar label="S" value={g.shoots} color="bg-secondary" />
                          <Bar label="P" value={g.subscriptions} color="bg-accent" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Event Type Distribution</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {eventStats.map((e) => (
                      <div key={e.event_type} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{e.event_type}</span>
                        <span className="font-medium">{e.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : null}

            {tab === 'users' ? (
              <Card>
                <CardHeader><CardTitle>Users</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input placeholder="Search name/email" value={userFilters.search} onChange={(e) => setUserFilters((f) => ({ ...f, page: 1, search: e.target.value }))} />
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={userFilters.role} onChange={(e) => setUserFilters((f) => ({ ...f, page: 1, role: e.target.value }))}>
                      <option value="">All roles</option>
                      <option value="customer">customer</option>
                      <option value="photographer">photographer</option>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </div>
                  <TableUsers rows={users.items || []} onRoleChange={updateRole} onDelete={(id) => softDeleteUser('users', id)} />
                  <Pager page={users.page} total={users.total} limit={users.limit} onPrev={() => setUserFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} onNext={() => setUserFilters((f) => ({ ...f, page: f.page + 1 }))} />
                </CardContent>
              </Card>
            ) : null}

            {tab === 'photographers' ? (
              <Card>
                <CardHeader><CardTitle>Photographers</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input placeholder="Search name/email" value={photographerFilters.search} onChange={(e) => setPhotographerFilters((f) => ({ ...f, page: 1, search: e.target.value }))} />
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={photographerFilters.plan} onChange={(e) => setPhotographerFilters((f) => ({ ...f, page: 1, plan: e.target.value }))}>
                      <option value="">All plans</option>
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="premium">premium</option>
                    </select>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr><th className="py-2 text-left">Name</th><th className="py-2 text-left">Email</th><th className="py-2 text-left">Plan</th><th className="py-2 text-left">Action</th></tr>
                    </thead>
                    <tbody>
                      {(photographers.items || []).map((p) => (
                        <tr key={p.id} className="border-t border-border">
                          <td className="py-2">{p.full_name}</td>
                          <td className="py-2">{p.email}</td>
                          <td className="py-2 capitalize">{p.photographer_plan || 'free'}</td>
                          <td className="py-2"><Button size="sm" variant="outline" onClick={() => softDeleteUser('photographers', p.id)}>Soft Delete</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pager page={photographers.page} total={photographers.total} limit={photographers.limit} onPrev={() => setPhotographerFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} onNext={() => setPhotographerFilters((f) => ({ ...f, page: f.page + 1 }))} />
                </CardContent>
              </Card>
            ) : null}

            {tab === 'payments' ? (
              <div className="space-y-4">
                {paymentsSummary ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric title="Current Balance" value={fmtCurrency(paymentsSummary.current_balance)} />
                    <Metric title="Revenue (Month)" value={fmtCurrency(paymentsSummary.total_revenue_month)} />
                    <Metric title="Expenses (Month)" value={fmtCurrency(paymentsSummary.total_expenses_month)} />
                    <Metric title="Photoshoot Revenue" value={fmtCurrency(paymentsSummary.photoshoot_revenue_month)} />
                  </div>
                ) : null}
                <Card>
                  <CardHeader><CardTitle>Payments Ledger</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['subscriptions', 'photoshoots', 'expenses'].map((t) => (
                        <Button key={t} variant={paymentTab === t ? 'default' : 'outline'} onClick={() => setPaymentTab(t)}>
                          {t}
                        </Button>
                      ))}
                    </div>
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground">
                        <tr><th className="py-2 text-left">ID</th><th className="py-2 text-left">Amount</th><th className="py-2 text-left">Date</th><th className="py-2 text-left">Action</th></tr>
                      </thead>
                      <tbody>
                        {paymentRows.map((r) => (
                          <tr key={r.id} className="border-t border-border">
                            <td className="py-2 font-mono text-xs">{r.id}</td>
                            <td className="py-2">{fmtCurrency(r.amount || r.total_amount || 0)}</td>
                            <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                            <td className="py-2">
                              {paymentTab === 'expenses' ? (
                                <Button size="sm" variant="outline" onClick={() => softDeleteUser('expenses', r.id)}>Delete</Button>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Add Expense</CardTitle></CardHeader>
                  <CardContent>
                    <form className="grid gap-2 md:grid-cols-4" onSubmit={addExpense}>
                      <Input placeholder="Title" value={expenseForm.title} onChange={(e) => setExpenseForm((f) => ({ ...f, title: e.target.value }))} required />
                      <Input type="number" step="0.01" min="0" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} required />
                      <Input placeholder="Description (optional)" value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
                      <Button type="submit">Add Expense</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-2xl font-semibold">{value}</p></CardContent>
    </Card>
  );
}

function Bar({ label, value, color }) {
  const width = Math.max(4, Math.min(100, Number(value || 0) * 12));
  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-4 text-xs text-muted-foreground">{label}</span>
      <div className="h-2 w-full rounded bg-muted">
        <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="w-6 text-right text-xs">{value}</span>
    </div>
  );
}

function TableUsers({ rows, onRoleChange, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground">
        <tr><th className="py-2 text-left">Name</th><th className="py-2 text-left">Email</th><th className="py-2 text-left">Role</th><th className="py-2 text-left">Created</th><th className="py-2 text-left">Action</th></tr>
      </thead>
      <tbody>
        {rows.map((u) => (
          <tr key={u.id} className="border-t border-border">
            <td className="py-2">{u.full_name}</td>
            <td className="py-2">{u.email}</td>
            <td className="py-2">
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value)}>
                <option value="customer">customer</option>
                <option value="photographer">photographer</option>
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="super_admin">super_admin</option>
              </select>
            </td>
            <td className="py-2">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
            <td className="py-2"><Button size="sm" variant="outline" onClick={() => onDelete(u.id)}>Soft Delete</Button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Pager({ page, total, limit, onPrev, onNext }) {
  const hasNext = page * limit < total;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Page {page} • Total {total}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 1}>Prev</Button>
        <Button size="sm" variant="outline" onClick={onNext} disabled={!hasNext}>Next</Button>
      </div>
    </div>
  );
}
