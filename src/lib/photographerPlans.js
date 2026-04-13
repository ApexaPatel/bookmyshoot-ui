export const PHOTOGRAPHER_PLAN_RULES = {
  free: {
    code: 'free',
    name: 'Free',
    priceInr: 0,
    maxPhotoshoots: 10,
    maxGalleryImages: 5,
    monthlyLimit: false,
    auctionAccess: false,
    priorityRanking: false,
    bidLimitLabel: 'No auction bids',
    description:
      'For beginners. Up to 10 photoshoots total (lifetime), 5 gallery images per photoshoot, and no auction access.',
  },
  pro: {
    code: 'pro',
    name: 'Pro',
    priceInr: 299,
    maxPhotoshoots: 20,
    maxGalleryImages: 7,
    monthlyLimit: true,
    auctionAccess: true,
    priorityRanking: false,
    bidLimitLabel: 'Limited bids',
    description:
      '₹299/month. Auction access with bidding enabled, higher search visibility, and 20 photoshoots/month with 7 images per shoot.',
  },
  premium: {
    code: 'premium',
    name: 'Premium',
    priceInr: 399,
    maxPhotoshoots: 28,
    maxGalleryImages: 10,
    monthlyLimit: true,
    auctionAccess: true,
    priorityRanking: true,
    bidLimitLabel: 'High/Unlimited bids',
    description:
      '₹399/month. All Pro features plus priority auction ranking, featured badge, and 28 photoshoots/month with 10 images per shoot.',
  },
};

export function getPhotographerPlanRules(planCode) {
  return PHOTOGRAPHER_PLAN_RULES[(planCode || 'free').toLowerCase()] || PHOTOGRAPHER_PLAN_RULES.free;
}
