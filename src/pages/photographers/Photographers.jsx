import React, { useEffect, useMemo, useState } from 'react';
import { User, Building2, Camera, Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { photographerMatches } from '@/utils/photographerFilter';

/**
 * Photographers (Explore) page – PUBLIC.
 * Optional query params: ?q=...&event_type=wedding — filters client-side (event types, cities, org location, profile location, bio, name).
 */
const Photographers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get('q') || '';
  const urlEventType = searchParams.get('event_type') || '';

  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputQ, setInputQ] = useState(urlQ);

  useEffect(() => {
    setInputQ(urlQ);
  }, [urlQ]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/photographers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load photographers');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPhotographers(data.photographers || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => photographers.filter((p) => photographerMatches(p, urlQ, urlEventType)),
    [photographers, urlQ, urlEventType]
  );

  const applySearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const v = inputQ.trim();
    if (v) next.set('q', v);
    else next.delete('q');
    setSearchParams(next, { replace: false });
  };

  const clearFilters = () => {
    setInputQ('');
    setSearchParams({}, { replace: false });
  };

  const eventTypeLabel = urlEventType ? urlEventType.replace(/_/g, ' ') : '';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Photographers</h1>
        <p className="text-zinc-400 mb-6">Browse and discover photographers. No login required.</p>

        <form
          onSubmit={applySearch}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Search by name, city, organization location, or shoot type…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              aria-label="Search photographers"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Search
            </Button>
            {(urlQ || urlEventType) && (
              <Button type="button" variant="outline" className="border-zinc-600 text-zinc-200" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </form>

        {(urlQ || urlEventType) && (
          <p className="mb-4 text-sm text-zinc-400">
            Showing {filtered.length} of {photographers.length} photographers
            {urlEventType ? (
              <>
                {' '}
                · Event type: <span className="text-indigo-300 capitalize">{eventTypeLabel}</span>
              </>
            ) : null}
            {urlQ ? (
              <>
                {' '}
                · Keyword: <span className="text-zinc-200">&ldquo;{urlQ}&rdquo;</span>
              </>
            ) : null}
          </p>
        )}

        {loading && <div className="text-center py-12 text-zinc-400">Loading photographers...</div>}
        {error && <div className="rounded-lg border border-red-800 bg-red-500/10 p-4 text-red-400">{error}</div>}
        {!loading && !error && photographers.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
            No photographers yet. Check back soon.
          </div>
        )}
        {!loading && !error && photographers.length > 0 && filtered.length === 0 && (
          <div className="rounded-lg border border-amber-800/50 bg-amber-500/10 p-6 text-amber-200">
            No photographers match your search. Try different keywords or{' '}
            <button type="button" className="underline hover:text-white" onClick={clearFilters}>
              clear filters
            </button>
            .
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link key={p.id} to={`/photographer/${p.id}`} className="block">
                <Card className="bg-zinc-900/80 border border-zinc-800 overflow-hidden transition hover:border-indigo-500/50">
                  <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center overflow-hidden">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-12 w-12 text-zinc-500" aria-hidden />
                    )}
                    <span className="sr-only">{p.cover_image ? 'Cover image' : 'Cover placeholder'}</span>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full h-12 w-12 flex items-center justify-center bg-zinc-700 shrink-0 border-2 border-zinc-600 overflow-hidden">
                        {p.profile_picture ? (
                          <img src={p.profile_picture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{p.name || 'Photographer'}</p>
                        {p.is_part_of_organization && p.organizationId?.name ? (
                          <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{p.organizationId.name}</span>
                          </p>
                        ) : null}
                        <div className="mt-2">
                          {p.is_part_of_organization && p.organizationId?.name ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1">
                              <Building2 className="h-3 w-3" />
                              Photographer at {p.organizationId.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700 text-zinc-300 text-xs px-2.5 py-1">
                              <User className="h-3 w-3" />
                              Independent Photographer
                            </span>
                          )}
                        </div>
                        {p.portfolio_events?.length ? (
                          <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                            Shoots: {p.portfolio_events.slice(0, 4).join(' · ')}
                            {p.portfolio_events.length > 4 ? '…' : ''}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Photographers;
