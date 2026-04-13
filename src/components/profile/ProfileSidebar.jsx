import { Building2, CalendarDays, CreditCard, FolderKanban, MessageSquare, Settings, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

export default function ProfileSidebar({ user, avatar }) {
  const location = useLocation();
  const isPhotographer = user?.role === 'photographer';
  const navItems = [
    { label: 'Profile', icon: UserCircle2, href: '/profile' },
    ...(!isPhotographer ? [{ label: 'My bookings', icon: CalendarDays, href: '/my-bookings' }] : []),
    ...(isPhotographer
      ? [
          { label: 'Quote requests', icon: MessageSquare, href: '/photographer/quotations' },
          { label: 'Bookings', icon: CalendarDays, href: '/photographer/bookings' },
          { label: 'Portfolio', icon: FolderKanban, href: '/portfolio' },
          { label: 'Billing', icon: CreditCard, href: '/billing' },
        ]
      : []),
    { label: 'Organizations', icon: Building2, href: '/organizations' },
    { label: 'Settings', icon: Settings, disabled: true },
  ];

  return (
    <div className="xl:sticky xl:top-24">
      <Card className="rounded-[2rem] border-white/10 bg-zinc-900/80 shadow-xl backdrop-blur">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  <UserCircle2 className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">{user.name}</p>
              <p className="truncate text-sm text-zinc-400">{user.email}</p>
              {isPhotographer ? (
                <span className="mt-2 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                  {(user?.photographerPlan || 'free').toUpperCase()} Plan
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Navigation</p>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !item.disabled && location.pathname === item.href;
                const className = `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : item.disabled
                      ? 'border border-zinc-800 text-zinc-500'
                      : 'border border-transparent text-zinc-300 hover:border-zinc-800 hover:bg-zinc-800/80 hover:text-white'
                }`;

                if (item.disabled) {
                  return (
                    <div key={item.label} className={className}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  );
                }

                return (
                  <Link key={item.label} to={item.href} className={className}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
