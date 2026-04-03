import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AddPortfolioForm from '@/components/portfolio/AddPortfolioForm';
import { useAuth } from '@/context/AuthContext';
import { getPhotographerPlanRules } from '@/lib/photographerPlans';

export default function PortfolioFormPage() {
  const { id } = useParams();
  const mode = id ? 'edit' : 'create';
  const { user, loading, isAuthenticated } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'photographer') return;
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = stored?.state?.token;

    const requests = [
      fetch('/api/portfolio', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load plan details');
        return data;
      }),
    ];

    if (mode === 'edit') {
      requests.push(
        fetch(`/api/portfolio/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load portfolio');
          return data;
        })
      );
    }

    Promise.all(requests)
      .then(([portfolioListResponse, editResponse]) => {
        setPlanInfo(portfolioListResponse?.plan || null);
        if (editResponse) {
          setInitialData(editResponse);
        }
      })
      .catch((fetchError) => setError(fetchError.message || 'Failed to load portfolio'))
      .finally(() => setPageLoading(false));
  }, [id, isAuthenticated, mode, user?.role]);

  const fallbackPlan = getPhotographerPlanRules(user?.photographerPlan);
  const effectivePlan = {
    code: planInfo?.code ?? fallbackPlan.code,
    name: planInfo?.name ?? fallbackPlan.name,
    price_inr: planInfo?.price_inr ?? fallbackPlan.priceInr ?? 0,
    max_photoshoots: planInfo?.max_photoshoots ?? fallbackPlan.maxPhotoshoots,
    max_gallery_images: planInfo?.max_gallery_images ?? fallbackPlan.maxGalleryImages,
    remaining_photoshoots: planInfo?.remaining_photoshoots,
    monthly_limit: planInfo?.monthly_limit ?? fallbackPlan.monthlyLimit,
    plan_expires_at: planInfo?.plan_expires_at ?? user?.planExpiresAt ?? null,
  };

  if (
    !loading &&
    mode === 'create' &&
    typeof effectivePlan.remaining_photoshoots === 'number' &&
    effectivePlan.remaining_photoshoots === 0
  ) {
    return <Navigate to="/billing#available-plans" replace />;
  }

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
        {pageLoading ? <div className="py-10 text-center text-zinc-400">Loading photoshoot...</div> : null}
        {!pageLoading && error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!pageLoading && !error ? <AddPortfolioForm initialData={initialData} mode={mode} planInfo={effectivePlan} /> : null}
      </main>
      <Footer />
    </div>
  );
}
