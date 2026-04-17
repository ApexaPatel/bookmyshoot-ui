import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

/** Matches quotation `event_type` values and backend EventType enum */
const EVENT_TYPES = [
  ['wedding', 'Wedding'],
  ['pre_wedding', 'Pre-wedding'],
  ['birthday', 'Birthday'],
  ['corporate', 'Corporate'],
  ['inauguration', 'Inauguration'],
  ['promotion', 'Promotion'],
  ['influencer', 'Influencer'],
  ['other', 'Other'],
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdminRole = ['super_admin', 'admin', 'staff'].includes(user?.role);
  const isPhotographer = user?.role === 'photographer';
  const [eventPanelOpen, setEventPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const hrefForEventType = (typeId) => {
    const params = new URLSearchParams();
    params.set('event_type', typeId);
    const q = search.trim() || typeId.replace(/_/g, ' ');
    params.set('q', q);
    return `/photographers?${params.toString()}`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const suffix = params.toString();
    navigate(suffix ? `/photographers?${suffix}` : '/photographers');
    setEventPanelOpen(false);
  };

  useEffect(() => {
    if (!eventPanelOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') setEventPanelOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [eventPanelOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur overflow-x-hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-10 min-w-0">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <span className="text-xl font-bold text-white">BookMyShoot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 min-w-0">
          <button
            type="button"
            onClick={() => setEventPanelOpen(true)}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            Event
          </button>
          <Link to="/photographers" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            Photographers
          </Link>
          <Link to="/organizations" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            Organizations
          </Link>
          {!isPhotographer ? (
            <Link to="/quote" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
              Get Quote
            </Link>
          ) : (
            <>
              <Link
                to="/photographer/quotations"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                Quote requests
              </Link>
              <Link
                to="/photographer/bookings"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                Bookings
              </Link>
            </>
          )}
          <Link to="/auction" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            Auctions
          </Link>
        </nav>

        {/* Right: Auth or User menu */}
        <div className="flex items-center gap-2 shrink-0">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" className="text-white hover:bg-zinc-800 hidden lg:inline-flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="ghost" className="text-white hover:bg-zinc-800 hidden lg:inline-flex" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white hidden sm:inline-flex lg:inline-flex" asChild>
                <Link to="/photographers">Find Photographer</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full overflow-hidden h-9 w-9 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Profile menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'photographer' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/photographer/quotations" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Quote requests
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {user?.role === 'photographer' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/photographer/bookings" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Bookings
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {user?.role === 'photographer' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Portfolio
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {user?.role === 'photographer' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Billing
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {!isAdminRole && !isPhotographer ? (
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      My bookings
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {!isAdminRole && !isPhotographer ? (
                  <DropdownMenuItem asChild>
                    <Link to="/membership" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Membership
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {isAuthenticated ? (
                  <DropdownMenuItem asChild>
                    <Link to="/auction" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Auctions
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {['super_admin', 'admin', 'staff'].includes(user?.role) ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {user?.role === 'super_admin' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/subscriptions" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                      Admin — Subscriptions
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-zinc-800 focus:text-white text-red-400 focus:text-red-400"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
    {mobileMenuOpen ? (
      <div className="fixed inset-0 top-16 z-40 lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <section className="relative z-10 mx-3 mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold tracking-wide text-zinc-200">Menu</p>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="grid gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setEventPanelOpen(true);
              }}
              className="rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Event
            </button>
            <Link to="/photographers" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              Photographers
            </Link>
            <Link to="/organizations" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              Organizations
            </Link>
            {!isPhotographer ? (
              <Link to="/quote" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                Get Quote
              </Link>
            ) : (
              <>
                <Link to="/photographer/quotations" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                  Quote requests
                </Link>
                <Link to="/photographer/bookings" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                  Bookings
                </Link>
              </>
            )}
            <Link to="/auction" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              Auctions
            </Link>
          </nav>

          {!isAuthenticated ? (
            <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-4">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-100 hover:bg-zinc-800" asChild>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </Button>
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-100 hover:bg-zinc-800" asChild>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                <Link to="/photographers" onClick={() => setMobileMenuOpen(false)}>Find Photographer</Link>
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    ) : null}
    {eventPanelOpen ? (
      <div className="fixed inset-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto md:max-h-none md:overflow-visible">
        <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setEventPanelOpen(false)} />
        <section className="relative z-10 w-full border-b border-zinc-800/80 bg-zinc-950/95 shadow-2xl md:max-h-[min(70vh,calc(100vh-5rem))] md:overflow-y-auto">
          <div className="container mx-auto px-6 py-6 md:px-10">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Event types</h2>
                <p className="text-sm text-zinc-400">Pick a shoot type or search to filter photographers</p>
              </div>
              <button
                type="button"
                onClick={() => setEventPanelOpen(false)}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                aria-label="Close event panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-300">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, city / location, or shoot type — press Enter"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />
              </label>
              <Button type="submit" className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                Search
              </Button>
            </form>

            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Browse by type</p>
            <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2 md:max-h-none">
              {EVENT_TYPES.map(([id, label]) => (
                <li key={id}>
                  <Link
                    to={hrefForEventType(id)}
                    onClick={() => setEventPanelOpen(false)}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-200 transition hover:bg-zinc-800/90 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    ) : null}
    </>
  );
};

export default Navbar;
