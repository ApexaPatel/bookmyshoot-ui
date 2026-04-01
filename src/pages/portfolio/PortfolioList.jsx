import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function PortfolioList() {
  const { user, loading, isAuthenticated } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'photographer') return;
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = stored?.state?.token;

    fetch('/api/portfolio', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load portfolio');
        return data;
      })
      .then((data) => setPortfolios(data || []))
      .catch((fetchError) => setError(fetchError.message || 'Failed to load portfolio'))
      .finally(() => setPageLoading(false));
  }, [isAuthenticated, user?.role]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && isAuthenticated && user?.role !== 'photographer') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio</h1>
            <p className="mt-2 text-zinc-400">Manage your photoshoots, galleries, and thumbnail highlights.</p>
          </div>
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Link to="/portfolio/new">Add New Photoshoot</Link>
          </Button>
        </div>

        {pageLoading ? <div className="py-10 text-center text-zinc-400">Loading portfolio...</div> : null}
        {!pageLoading && error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!pageLoading && !error ? <PortfolioGrid portfolios={portfolios} /> : null}
      </main>
      <Footer />
    </div>
  );
}
