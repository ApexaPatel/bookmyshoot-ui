import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import PricingPlansSection from '@/components/billing/PricingPlansSection';
import DemoCheckoutModal from '@/components/billing/DemoCheckoutModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getPhotographerPlanRules } from '@/lib/photographerPlans';

const PLAN_COPY = {
  free: {
    body: 'Best for beginners. Includes up to 10 lifetime photoshoots with 5 images per shoot. Auction view and bidding are locked on Free.',
  },
  pro: {
    body: 'Includes auction access and bidding with better visibility, plus up to 20 photoshoots per month and 7 images per photoshoot.',
  },
  premium: {
    body: 'Includes all Pro features with priority auction ranking and premium visibility, plus up to 28 photoshoots per month and 10 images per shoot.',
  },
};

function formatCycleDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function Billing() {
  const { user, refreshUser, token } = useAuth();
  const navigate = useNavigate();
  const [planInfo, setPlanInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoPlan, setDemoPlan] = useState('pro');

  const reloadPortfolioPlan = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = stored?.state?.token;
    if (!token) return Promise.resolve();
    return fetch('/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load billing details');
        }
        return data;
      })
      .then((data) => setPlanInfo(data?.plan || null))
      .catch((fetchError) => setError(fetchError.message || 'Failed to load billing details'));
  }, []);

  const openDemoCheckout = (planCode) => {
    setDemoPlan(planCode);
    setDemoOpen(true);
  };

  useEffect(() => {
    if (user?.role !== 'photographer') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    reloadPortfolioPlan().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.role, reloadPortfolioPlan]);

  const fallbackPlan = getPhotographerPlanRules(user?.photographerPlan);
  const effectivePlan = useMemo(() => {
    const maxPhotoshoots = planInfo?.max_photoshoots ?? fallbackPlan.maxPhotoshoots;
    const remaining = planInfo?.remaining_photoshoots;
    const usedFromApi = planInfo?.photoshoots_used;
    const used =
      typeof usedFromApi === 'number'
        ? usedFromApi
        : typeof remaining === 'number'
          ? Math.max(0, maxPhotoshoots - remaining)
          : null;

    return {
      code: (planInfo?.code ?? fallbackPlan.code).toLowerCase(),
      name: planInfo?.name ?? fallbackPlan.name,
      price_inr: planInfo?.price_inr ?? fallbackPlan.priceInr ?? 0,
      max_photoshoots: maxPhotoshoots,
      max_gallery_images: planInfo?.max_gallery_images ?? fallbackPlan.maxGalleryImages,
      remaining_photoshoots: remaining,
      photoshoots_used: used,
      monthly_limit: planInfo?.monthly_limit ?? fallbackPlan.monthlyLimit,
      plan_expires_at: planInfo?.plan_expires_at ?? user?.planExpiresAt ?? null,
      cycle_ends_at: planInfo?.cycle_ends_at ?? planInfo?.plan_expires_at ?? user?.planExpiresAt ?? null,
    };
  }, [planInfo, fallbackPlan, user?.planExpiresAt]);

  const planDescription = PLAN_COPY[effectivePlan.code]?.body ?? PLAN_COPY.free.body;

  const restrictFutureDates = effectivePlan.code === 'pro' || effectivePlan.code === 'premium';

  const usageCardTitle = effectivePlan.code === 'free' ? 'Usage' : 'Usage This Month';

  const billingCycleLine = useMemo(() => {
    if (effectivePlan.code === 'free') {
      return 'You are on the Free plan. Your photoshoot limit is lifetime until you upgrade — there is no paid billing cycle.';
    }
    const end = formatCycleDate(effectivePlan.cycle_ends_at);
    if (end) {
      return `Billing cycle ends on ${end}.`;
    }
    return 'Your paid plan is active. Cycle end is set from your last demo upgrade.';
  }, [effectivePlan.code, effectivePlan.cycle_ends_at]);

  if (user?.role !== 'photographer') {
    return <Navigate to="/profile" replace />;
  }

  const scrollToPlans = () => {
    document.getElementById('available-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const usedPct =
    typeof effectivePlan.photoshoots_used === 'number' && effectivePlan.max_photoshoots > 0
      ? Math.min(100, (effectivePlan.photoshoots_used / effectivePlan.max_photoshoots) * 100)
      : 0;

  const cta = (() => {
    if (effectivePlan.code === 'free') {
      return (
        <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={scrollToPlans}>
          Upgrade Plan
        </Button>
      );
    }
    if (effectivePlan.code === 'pro') {
      return (
        <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={scrollToPlans}>
          Upgrade to Premium
        </Button>
      );
    }
    return (
      <Button type="button" variant="outline" className="border-zinc-600 text-zinc-400" disabled>
        You are on the highest plan
      </Button>
    );
  })();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ProfileSidebar user={user} avatar={user?.avatar ?? null} />

          <div className="space-y-8">
            <Card className="rounded-[2rem] border-white/10 bg-zinc-900/80 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Billing</CardTitle>
                <p className="text-sm leading-6 text-zinc-400">
                  Manage your subscription and track your usage for this billing cycle. Upgrades use a demo checkout
                  only—no real charges.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? <p className="text-sm text-zinc-400">Loading billing details...</p> : null}
                {!loading && error ? <p className="text-sm text-red-400">{error}</p> : null}
                {!loading ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Current Plan</p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {effectivePlan.name} Plan —{' '}
                          <span className="inline-flex items-center">
                            <IndianRupee className="mx-0.5 h-6 w-6" />
                            {effectivePlan.price_inr}/month
                          </span>
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">{planDescription}</p>
                      </div>

                      <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{usageCardTitle}</p>
                        {typeof effectivePlan.photoshoots_used === 'number' &&
                        typeof effectivePlan.remaining_photoshoots === 'number' ? (
                          <>
                            <p className="mt-3 text-lg font-semibold text-white">
                              Photoshoots used: {effectivePlan.photoshoots_used} / {effectivePlan.max_photoshoots}
                            </p>
                            <p className="mt-2 text-sm text-zinc-300">
                              Remaining: {effectivePlan.remaining_photoshoots}
                            </p>
                            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all"
                                style={{ width: `${usedPct}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-400">Usage details will appear after your plan loads.</p>
                        )}
                        <p className="mt-4 text-sm text-zinc-400">
                          Image limit per photoshoot: {effectivePlan.max_gallery_images}
                        </p>
                        {restrictFutureDates ? (
                          <p className="mt-2 text-sm text-zinc-400">
                            Future shoot dates are restricted on your current plan.
                          </p>
                        ) : null}
                        <p className="mt-4 text-sm text-zinc-500">{billingCycleLine}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">{cta}</div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <div id="available-plans" className="space-y-4 scroll-mt-24">
              <div>
                <h2 className="text-2xl font-semibold text-white">Available Plans</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Compare limits and pricing. Choose an upgrade when you need more photoshoots or larger galleries.
                </p>
              </div>
              <PricingPlansSection
                currentPlanCode={effectivePlan.code}
                showCurrentPlan
                onUpgrade={openDemoCheckout}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <DemoCheckoutModal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        planCode={demoPlan}
        userName={user?.name}
        userEmail={user?.email}
        token={token}
        onPaidSuccess={async () => {
          await refreshUser();
          reloadPortfolioPlan();
          navigate('/portfolio');
        }}
      />
    </div>
  );
}
