import React, { useState, useEffect } from 'react';
import { User, Building2, Camera } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Photographers (Explore) page – PUBLIC.
 * No auth required. Shows Individual vs Organization photographers with badges.
 */
const Photographers = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Photographers</h1>
        <p className="text-zinc-400 mb-8">
          Browse and discover photographers. No login required.
        </p>

        {loading && (
          <div className="text-center py-12 text-zinc-400">Loading photographers...</div>
        )}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}
        {!loading && !error && photographers.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
            No photographers yet. Check back soon.
          </div>
        )}
        {!loading && !error && photographers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((p) => (
              <Card key={p.id} className="bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                {/* Profile image or placeholder */}
                <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center overflow-hidden">
                  {p.profile_picture ? (
                    <img
                      src={p.profile_picture}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-zinc-500" aria-hidden />
                  )}
                  <span className="sr-only">{p.profile_picture ? 'Profile photo' : 'Profile photo placeholder'}</span>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Photographers;
