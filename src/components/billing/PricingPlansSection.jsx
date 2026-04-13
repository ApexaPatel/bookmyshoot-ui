import { Check, CreditCard, IndianRupee } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PHOTOGRAPHER_PLAN_RULES } from '@/lib/photographerPlans';

const planOrder = ['free', 'pro', 'premium'];

const rank = { free: 0, pro: 1, premium: 2 };

export default function PricingPlansSection({
  currentPlanCode,
  showCurrentPlan = false,
  compact = false,
  onUpgrade,
}) {
  const current = (currentPlanCode || 'free').toLowerCase();
  const canUpgradeTo = (code) => rank[code] > rank[current];

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {planOrder.map((planCode) => {
        const plan = PHOTOGRAPHER_PLAN_RULES[planCode];
        const isCurrent = currentPlanCode === planCode;

        return (
          <Card
            key={plan.code}
            className={`rounded-[2rem] border shadow-xl ${
              isCurrent
                ? 'border-indigo-500/40 bg-indigo-500/10'
                : 'border-white/10 bg-zinc-900/80'
            }`}
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                {isCurrent && showCurrentPlan ? (
                  <span className="rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300">
                    Current Plan
                  </span>
                ) : null}
              </div>
              <div>
                <p className="flex items-center gap-1 text-3xl font-semibold text-white">
                  <IndianRupee className="h-7 w-7" />
                  {plan.priceInr}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {plan.priceInr > 0 ? 'per month' : 'for Getting started'}
                </p>
              </div>
              <p className="text-sm leading-6 text-zinc-300">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>
                    Up to {plan.maxPhotoshoots} photoshoots
                    {plan.monthlyLimit ? ' per billing month' : ' total (lifetime on Free)'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>Up to {plan.maxGalleryImages} gallery images per photoshoot</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{plan.auctionAccess ? 'Can view auctions and place bids' : 'No auction access (upgrade required)'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{plan.priorityRanking ? 'Priority ranking in bidder list' : 'Standard ranking in bidder list'}</span>
                </div>
              </div>

              {compact ? null : plan.priceInr > 0 && onUpgrade && canUpgradeTo(plan.code) ? (
                <Button
                  type="button"
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => onUpgrade(plan.code)}
                >
                  <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                  {`Upgrade to ${plan.name}`}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
