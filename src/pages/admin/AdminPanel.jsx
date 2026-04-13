import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Camera, Copy, Crown, LayoutDashboard, Menu, ShieldCheck, Sparkles, Trash2, Users, Wallet } from 'lucide-react';
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
  { key: 'plans', label: 'Plans & Membership', icon: BriefcaseBusiness },
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
  const [membershipFilters, setMembershipFilters] = useState({ search: '', status: '', from: '', to: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', description: '' });
  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [membershipMetrics, setMembershipMetrics] = useState(null);
  const [planStats, setPlanStats] = useState(null);

  const [userFilters, setUserFilters] = useState({ search: '', role: '', page: 1, limit: 10 });
  const [photographerFilters, setPhotographerFilters] = useState({ search: '', plan: '', page: 1, limit: 10 });

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const apiGet = useCallback(async (path) => {
    const res = await fetch(path, { headers: authHeaders });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }, [authHeaders]);

  const fetchPlansData = useCallback(async () => {
    const [plansResp, membershipResp, planStatsResp] = await Promise.all([
      apiGet('/api/admin/plans'),
      apiGet('/api/admin/membership'),
      apiGet('/api/admin/photographers/plan-stats'),
    ]);
    const rawPlans = Array.isArray(plansResp.items) ? plansResp.items : [];
    const byName = new Map();
    rawPlans.forEach((plan) => {
      const key = String(plan?.name || '').toLowerCase();
      if (!key || byName.has(key)) return;
      byName.set(key, plan);
    });
    const planRows = ['free', 'pro', 'premium'].map((name) => byName.get(name)).filter(Boolean);
    setPlans(planRows);
    setMembership(membershipResp.config || null);
    setMembershipMetrics(membershipResp.metrics || null);
    setPlanStats({
      freeCount: Number(planStatsResp.free || 0),
      proCount: Number(planStatsResp.pro || 0),
      premiumCount: Number(planStatsResp.premium || 0),
      conversionRate: Number(planStatsResp.conversion_rate || 0).toFixed(1),
    });
  }, [apiGet]);

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
          const paymentsQuery = new URLSearchParams({ page: '1', limit: '20' });
          if (paymentTab === 'memberships') {
            if (membershipFilters.search) paymentsQuery.set('search', membershipFilters.search);
            if (membershipFilters.status) paymentsQuery.set('status', membershipFilters.status);
            if (membershipFilters.from) paymentsQuery.set('from_date', new Date(membershipFilters.from).toISOString());
            if (membershipFilters.to) paymentsQuery.set('to_date', new Date(membershipFilters.to).toISOString());
          }
          const [s, list] = await Promise.all([
            apiGet('/api/admin/payments/summary'),
            apiGet(`/api/admin/payments/${paymentTab}?${paymentsQuery.toString()}`),
          ]);
          if (!cancelled) {
            setPaymentsSummary(s);
            setPaymentRows(Array.isArray(list.items) ? list.items : []);
          }
        } else if (tab === 'plans') {
          await fetchPlansData();
          if (!cancelled) {
            // state already set in fetchPlansData
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
  }, [tab, token, userFilters, photographerFilters, paymentTab, membershipFilters, apiGet, fetchPlansData]);

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

  async function editPlan(plan) {
    const price = window.prompt(`Update ${titleCase(plan.name)} monthly price`, String(plan.price ?? 0));
    if (price === null) return;
    const res = await fetch(`/api/admin/plans/${plan.name}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Number(price) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || 'Failed to update plan');
      return;
    }
    await fetchPlansData();
  }

  async function togglePlan(plan) {
    const res = await fetch(`/api/admin/plans/${plan.name}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !plan.is_active }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || 'Failed to toggle plan');
      return;
    }
    await fetchPlansData();
  }

  async function editMembershipPrice() {
    if (!membership) return;
    const price = window.prompt('Update membership annual price', String(membership.price ?? 999));
    if (price === null) return;
    const res = await fetch('/api/admin/membership', {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Number(price) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || 'Failed to update membership');
      return;
    }
    await fetchPlansData();
  }

  async function updateMembershipBenefits() {
    if (!membership) return;
    const current = Array.isArray(membership.features) ? membership.features.join(', ') : '';
    const value = window.prompt('Update membership benefits (comma separated)', current);
    if (value === null) return;
    const features = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const res = await fetch('/api/admin/membership', {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ features }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || 'Failed to update membership benefits');
      return;
    }
    await fetchPlansData();
  }

  async function copyValue(value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
    } catch {
      // no-op fallback for unsupported clipboard API
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
          <Button variant="outline" className="xl:hidden" onClick={() => setSidebarOpen((v) => !v)}>
            <Menu className="mr-2 h-4 w-4" /> Menu
          </Button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[260px,1fr]">
          <Card className={`${sidebarOpen ? 'block' : 'hidden'} xl:block`}>
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
                  <Metric title="Memberships Purchased (Month)" value={summary.memberships_count ?? 0} />
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
                    <Metric title="Membership Revenue (Month)" value={fmtCurrency(paymentsSummary.membership_revenue_month)} />
                    <Metric title="Expenses (Month)" value={fmtCurrency(paymentsSummary.total_expenses_month)} />
                    <Metric title="Photoshoot Revenue" value={fmtCurrency(paymentsSummary.photoshoot_revenue_month)} />
                  </div>
                ) : null}
                <Card>
                  <CardHeader><CardTitle>Payments Ledger</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['subscriptions', 'memberships', 'photoshoots', 'expenses'].map((t) => (
                        <Button key={t} variant={paymentTab === t ? 'default' : 'outline'} onClick={() => setPaymentTab(t)}>
                          {titleCase(t)}
                        </Button>
                      ))}
                    </div>
                    {paymentTab === 'memberships' ? (
                      <div className="grid gap-2 md:grid-cols-4">
                        <Input
                          placeholder="Search name/email"
                          value={membershipFilters.search}
                          onChange={(e) => setMembershipFilters((f) => ({ ...f, search: e.target.value }))}
                        />
                        <Select
                          value={membershipFilters.status || 'all'}
                          onValueChange={(v) => setMembershipFilters((f) => ({ ...f, status: v === 'all' ? '' : v }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={6}
                            className="z-[90] rounded-lg border border-border bg-[#030711] shadow-lg"
                            style={{ backgroundColor: '#030711' }}
                          >
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={membershipFilters.from}
                          onChange={(e) => setMembershipFilters((f) => ({ ...f, from: e.target.value }))}
                        />
                        <Input
                          type="date"
                          value={membershipFilters.to}
                          onChange={(e) => setMembershipFilters((f) => ({ ...f, to: e.target.value }))}
                        />
                      </div>
                    ) : null}
                    <AdminTable
                      rows={paymentRows}
                      emptyState="No payment records found"
                      columns={paymentTab === 'memberships'
                        ? [
                            { key: 'user_name', label: 'User Name', render: (r) => r.user_name || '—' },
                            { key: 'user_email', label: 'Email', render: (r) => r.user_email || '—' },
                            { key: 'plan', label: 'Membership Plan', render: (r) => `${fmtCurrency(r.plan_price || 999)}/${r.plan_duration_days || 365} days` },
                            { key: 'amount_paid', label: 'Amount Paid', render: (r) => fmtCurrency(r.amount_paid || 0) },
                            { key: 'purchase_date', label: 'Purchase Date', render: (r) => (r.purchase_date ? new Date(r.purchase_date).toLocaleDateString() : '—') },
                            { key: 'expiry_date', label: 'Expiry Date', render: (r) => (r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—') },
                            {
                              key: 'status',
                              label: 'Status',
                              render: (r) => (
                                <span className={`rounded-full px-2 py-1 text-xs ${r.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                  {r.status === 'active' ? 'Active' : 'Expired'}
                                </span>
                              ),
                            },
                          ]
                        : paymentTab === 'subscriptions'
                          ? [
                              {
                                key: 'id',
                                label: 'ID',
                                render: (r) => (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{r.id}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyValue(r.id)} title="Copy ID">
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ),
                              },
                              { key: 'email', label: 'Photographer Email', render: (r) => r.user_email || '—' },
                              { key: 'name', label: 'Name', render: (r) => getPaymentRowName(r, paymentTab) },
                              { key: 'amount', label: 'Amount', render: (r) => fmtCurrency(r.amount || r.total_amount || 0) },
                              { key: 'date', label: 'Date', render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : '—') },
                            ]
                          : [
                              {
                                key: 'id',
                                label: 'ID',
                                render: (r) => (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{r.id}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyValue(r.id)} title="Copy ID">
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ),
                              },
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

            {tab === 'plans' ? (
              <div className="space-y-4">
                {planStats ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric title="Total Pro Users" value={planStats.proCount} />
                    <Metric title="Total Premium Users" value={planStats.premiumCount} />
                    <Metric title="Membership Users" value={membershipMetrics?.active_members ?? 0} />
                    <Metric title="Free → Paid Conversion" value={`${planStats.conversionRate}%`} />
                  </div>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>Photographer Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 xl:grid-cols-3">
                      {plans.map((plan) => {
                        const isPremium = plan.name === 'premium';
                        const badgeClass =
                          plan.name === 'free'
                            ? 'border-zinc-600 bg-zinc-700/40 text-zinc-200'
                            : plan.name === 'pro'
                              ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                              : 'border-amber-500/50 bg-amber-500/15 text-amber-300';
                        return (
                          <Card
                            key={plan.name}
                            className={`rounded-2xl border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 ${
                              isPremium ? 'ring-1 ring-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : ''
                            }`}
                          >
                            <CardHeader className="space-y-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="capitalize">{plan.name}</CardTitle>
                                <span className={`rounded-full border px-2.5 py-1 text-xs ${badgeClass}`}>
                                  {titleCase(plan.name)}
                                </span>
                              </div>
                              <p className="text-2xl font-semibold">
                                {plan.price > 0 ? `${fmtCurrency(plan.price)}/month` : fmtCurrency(0)}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Auctions {plan.name === 'free' ? 'locked' : 'enabled'}</li>
                                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /> Bid limit: {plan.max_bids || 0}</li>
                                <li className="flex items-center gap-2"><Crown className="h-4 w-4 text-amber-400" /> Priority weight: {plan.priority_weight || 0}</li>
                                <li className="flex items-center gap-2"><Camera className="h-4 w-4 text-sky-400" /> Portfolio limit: {plan.portfolio_limit || 0}</li>
                              </ul>
                              <div className="flex gap-2 pt-1">
                                <Button size="sm" variant="outline" onClick={() => editPlan(plan)}>Edit Plan</Button>
                                <Button size="sm" onClick={() => togglePlan(plan)}>
                                  {plan.is_active ? 'Set Inactive' : 'Set Active'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {membership ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Membership Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xl font-semibold">{fmtCurrency(membership.price)} / year</p>
                          <Button size="sm" onClick={async () => {
                            const res = await fetch('/api/admin/membership', {
                              method: 'PUT',
                              headers: { ...authHeaders, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ is_active: !membership.is_active }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) setError(data.detail || 'Failed to toggle membership');
                            else await fetchPlansData();
                          }}>
                            {membership.is_active ? 'Set Inactive' : 'Set Active'}
                          </Button>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">Validity: {membership.duration_days} days</p>
                        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          {(membership.features || []).map((feature) => (
                            <li key={feature} className="rounded-lg border border-border/70 px-2 py-1">
                              {String(feature).replaceAll('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Metric title="Active Members" value={membershipMetrics?.active_members ?? 0} />
                        <Metric title="Membership Revenue" value={fmtCurrency(membershipMetrics?.total_revenue ?? 0)} />
                        <Metric title="Membership Status" value={membership.is_active ? 'Active' : 'Inactive'} />
                        <Metric title="Duration (days)" value={membership.duration_days} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={editMembershipPrice}>Edit Membership Price</Button>
                        <Button onClick={updateMembershipBenefits}>Update Benefits</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

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
