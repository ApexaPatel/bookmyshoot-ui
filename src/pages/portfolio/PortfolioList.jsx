import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IndianRupee } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getPhotographerPlanRules } from '@/lib/photographerPlans';

export default function PortfolioList() {
  const { user, loading, isAuthenticated } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [planInfo, setPlanInfo] = useState(null);
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
      .then((data) => {
        setPortfolios(data?.portfolios || []);
        setPlanInfo(data?.plan || null);
      })
      .catch((fetchError) => setError(fetchError.message || 'Failed to load portfolio'))
      .finally(() => setPageLoading(false));
  }, [isAuthenticated, user?.role]);

  const fallbackPlan = getPhotographerPlanRules(user?.photographerPlan);
  const effectivePlan = {
    code: planInfo?.code ?? fallbackPlan.code,
    name: planInfo?.name ?? fallbackPlan.name,
    price_inr: planInfo?.price_inr ?? fallbackPlan.priceInr ?? 0,
    max_photoshoots: planInfo?.max_photoshoots ?? fallbackPlan.maxPhotoshoots,
    max_gallery_images: planInfo?.max_gallery_images ?? fallbackPlan.maxGalleryImages,
    photoshoots_used: planInfo?.photoshoots_used,
    remaining_photoshoots: planInfo?.remaining_photoshoots,
    monthly_limit: planInfo?.monthly_limit ?? fallbackPlan.monthlyLimit,
    plan_expires_at: planInfo?.plan_expires_at ?? user?.planExpiresAt ?? null,
    cycle_ends_at: planInfo?.cycle_ends_at ?? planInfo?.plan_expires_at ?? user?.planExpiresAt ?? null,
  };
  const addDisabled = effectivePlan.remaining_photoshoots === 0;
  const shootPct =
    typeof effectivePlan.photoshoots_used === 'number' && effectivePlan.max_photoshoots > 0
      ? Math.min(100, (effectivePlan.photoshoots_used / effectivePlan.max_photoshoots) * 100)
      : 0;

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
            <p className="mt-3 text-sm text-zinc-300">
              {effectivePlan.name} plan
              {effectivePlan.price_inr > 0 ? (
                <span className="inline-flex items-center">
                  {' ('}
                  <IndianRupee className="mx-0.5 h-3.5 w-3.5" />
                  {effectivePlan.price_inr}/month)
                </span>
              ) : (
                <span className="inline-flex items-center">
                  {' ('}
                  <IndianRupee className="mx-0.5 h-3.5 w-3.5" />
                  0 for Getting started)
                </span>
              )}
              : {effectivePlan.max_photoshoots} photoshoots
              {effectivePlan.monthly_limit ? ' per month' : ' total'} and up to {effectivePlan.max_gallery_images} gallery images per photoshoot.
            </p>
            {typeof effectivePlan.photoshoots_used === 'number' &&
            typeof effectivePlan.remaining_photoshoots === 'number' ? (
              <>
                <p className="mt-2 text-sm text-zinc-400">
                  Photoshoots: {effectivePlan.photoshoots_used} / {effectivePlan.max_photoshoots} used
                </p>
                <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${shootPct}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Remaining: {effectivePlan.remaining_photoshoots}
                  {effectivePlan.monthly_limit && effectivePlan.cycle_ends_at
                    ? ` · Billing cycle ends ${new Date(effectivePlan.cycle_ends_at).toLocaleDateString()}`
                    : ''}
                </p>
              </>
            ) : null}
          </div>
          {addDisabled ? (
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <Button className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800" disabled>
                Plan limit reached
              </Button>
              <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
                <Link to="/billing#available-plans">Upgrade Plan</Link>
              </Button>
            </div>
          ) : (
            <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Link to="/portfolio/new">Add New Photoshoot</Link>
            </Button>
          )}
        </div>

        {pageLoading ? <div className="py-10 text-center text-zinc-400">Loading portfolio...</div> : null}
        {!pageLoading && error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!pageLoading && !error ? <PortfolioGrid portfolios={portfolios} /> : null}
      </main>
      <Footer />
    </div>
  );
}
