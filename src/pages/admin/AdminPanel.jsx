import { useCallback, useEffect, useMemo, useState } from 'react';
import { Camera, LayoutDashboard, Menu, Trash2, Users, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchInput from '@/components/admin/SearchInput';
import FilterDropdown from '@/components/admin/FilterDropdown';
import AdminTable from '@/components/admin/AdminTable';
import RoleBadge from '@/components/admin/RoleBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'photographers', label: 'Photographers', icon: Camera },
  { key: 'payments', label: 'Payments', icon: Wallet },
];

function fmtCurrency(v) {
  return `₹${Number(v || 0).toLocaleString()}`;
}

function formatLongDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function titleCase(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getPaymentRowName(row, currentTab) {
  if (currentTab === 'subscriptions') {
    return row.plan ? titleCase(String(row.plan)) : '—';
  }
  if (currentTab === 'expenses') {
    return row.title || row.description || '—';
  }
  return row.user_name || row.full_name || row.user_email || row.customer_id || row.photographer_id || '—';
}

export default function AdminPanel() {
  const token = useAuthStore((s) => s.token);
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  }, [tab, token, userFilters, photographerFilters, paymentTab, apiGet]);

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
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage platform users, photographers, analytics, and payments</p>
          </div>
          <Button variant="outline" className="md:hidden" onClick={() => setSidebarOpen((v) => !v)}>
            <Menu className="mr-2 h-4 w-4" /> Menu
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-[260px,1fr]">
          <Card className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => {
                      setTab(t.key);
                      setSidebarOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-r-lg border-l-4 px-3 py-2.5 text-sm transition ${
                      active
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
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
                  <CardContent className="h-[320px]">
                    {graph.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No activity data available.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graph}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v) => String(v).slice(5)} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="photographers" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="subscriptions" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="shoots" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Event Type Distribution</CardTitle></CardHeader>
                  <CardContent className="h-[320px]">
                    {eventStats.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No event stats available.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={eventStats.map((e) => ({ ...e, event_type: String(e.event_type || '').replaceAll('_', ' ') }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="event_type" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => [value, 'Count']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}

            {tab === 'users' ? (
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Users</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage platform users and roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <SearchInput
                        placeholder="Search users by name or email"
                        value={userFilters.search}
                        onChange={(e) => setUserFilters((f) => ({ ...f, page: 1, search: e.target.value }))}
                      />
                      <FilterDropdown
                        value={userFilters.role}
                        onValueChange={(value) => setUserFilters((f) => ({ ...f, page: 1, role: value }))}
                        placeholder="All roles"
                        options={[
                          { label: 'customer', value: 'customer' },
                          { label: 'photographer', value: 'photographer' },
                          { label: 'admin', value: 'admin' },
                          { label: 'staff', value: 'staff' },
                          { label: 'super_admin', value: 'super_admin' },
                        ]}
                      />
                    </div>
                  </div>
                  <AdminTable
                    rows={users.items || []}
                    emptyState="No users found"
                    columns={[
                      { key: 'name', label: 'Name', render: (u) => <span className="font-medium">{u.full_name}</span> },
                      { key: 'email', label: 'Email', render: (u) => <span className="text-muted-foreground">{u.email}</span> },
                      {
                        key: 'role',
                        label: 'Role',
                        render: (u) => (
                          <div className="relative z-20 flex items-center gap-2">
                            <RoleBadge role={u.role} />
                            <Select value={u.role} onValueChange={(value) => updateRole(u.id, value)}>
                              <SelectTrigger className="h-8 w-[140px] rounded-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                position="popper"
                                sideOffset={6}
                                className="z-[90] rounded-lg border border-border bg-[#030711] shadow-lg"
                                style={{ backgroundColor: '#030711' }}
                              >
                                <SelectItem value="customer">customer</SelectItem>
                                <SelectItem value="photographer">photographer</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="staff">staff</SelectItem>
                                <SelectItem value="super_admin">super_admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ),
                      },
                      { key: 'created_at', label: 'Registered Date', render: (u) => formatLongDate(u.created_at) },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (u) => (
                          <ConfirmDialog
                            title="Delete user?"
                            description={`This will hide ${u.full_name} from active lists.`}
                            onConfirm={() => softDeleteUser('users', u.id)}
                            trigger={
                              <Button size="sm" variant="outline" className="gap-1">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
                            }
                          />
                        ),
                      },
                    ]}
                  />
                  <Pager page={users.page} total={users.total} limit={users.limit} onPrev={() => setUserFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} onNext={() => setUserFilters((f) => ({ ...f, page: f.page + 1 }))} />
                </CardContent>
              </Card>
            ) : null}

            {tab === 'photographers' ? (
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Photographers</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage photographer listings and plans</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <SearchInput
                        placeholder="Search photographers by name or email"
                        value={photographerFilters.search}
                        onChange={(e) => setPhotographerFilters((f) => ({ ...f, page: 1, search: e.target.value }))}
                      />
                      <FilterDropdown
                        value={photographerFilters.plan}
                        onValueChange={(value) => setPhotographerFilters((f) => ({ ...f, page: 1, plan: value }))}
                        placeholder="All plans"
                        options={[
                          { label: 'free', value: 'free' },
                          { label: 'pro', value: 'pro' },
                          { label: 'premium', value: 'premium' },
                        ]}
                      />
                    </div>
                  </div>
                  <AdminTable
                    rows={photographers.items || []}
                    emptyState="No photographers found"
                    columns={[
                      { key: 'name', label: 'Name', render: (p) => <span className="font-medium">{p.full_name}</span> },
                      { key: 'email', label: 'Email', render: (p) => <span className="text-muted-foreground">{p.email}</span> },
                      { key: 'plan', label: 'Plan', render: (p) => <span className="capitalize">{p.photographer_plan || 'free'}</span> },
                      {
                        key: 'action',
                        label: 'Action',
                        render: (p) => (
                          <ConfirmDialog
                            title="Delete photographer?"
                            description={`This will hide ${p.full_name} from active lists.`}
                            onConfirm={() => softDeleteUser('photographers', p.id)}
                            trigger={
                              <Button size="sm" variant="outline" className="gap-1">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
                            }
                          />
                        ),
                      },
                    ]}
                  />
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
                          {titleCase(t)}
                        </Button>
                      ))}
                    </div>
                    <AdminTable
                      rows={paymentRows}
                      emptyState="No payment records found"
                      columns={[
                        { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
                        { key: 'name', label: 'Name', render: (r) => getPaymentRowName(r, paymentTab) },
                        { key: 'amount', label: 'Amount', render: (r) => fmtCurrency(r.amount || r.total_amount || 0) },
                        { key: 'date', label: 'Date', render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : '—') },
                      ]}
                    />
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
    <Card className="border-border/80">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-2xl font-semibold">{value}</p></CardContent>
    </Card>
  );
}

function Pager({ page, total, limit, onPrev, onNext }) {
  const hasNext = page * limit < total;
  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <span className="text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 1}>Prev</Button>
        <Button size="sm" variant="outline" onClick={onNext} disabled={!hasNext}>Next</Button>
      </div>
    </div>
  );
}
