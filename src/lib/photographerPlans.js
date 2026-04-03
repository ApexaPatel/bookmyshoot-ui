export const PHOTOGRAPHER_PLAN_RULES = {
  free: {
    code: 'free',
    name: 'Free',
    priceInr: 0,
    maxPhotoshoots: 10,
    maxGalleryImages: 5,
    monthlyLimit: false,
    description: 'Up to 10 photoshoots total (lifetime on Free) and 5 gallery images per photoshoot.',
  },
  pro: {
    code: 'pro',
    name: 'Pro',
    priceInr: 299,
    maxPhotoshoots: 20,
    maxGalleryImages: 7,
    monthlyLimit: true,
    description: '₹299/month. Up to 20 photoshoots in the active monthly billing cycle, event dates cannot be in the future, and 7 gallery images per photoshoot.',
  },
  premium: {
    code: 'premium',
    name: 'Premium',
    priceInr: 399,
    maxPhotoshoots: 28,
    maxGalleryImages: 10,
    monthlyLimit: true,
    description: '₹399/month. Up to 28 photoshoots in the active monthly billing cycle and 10 gallery images per photoshoot.',
  },
};

export function getPhotographerPlanRules(planCode) {
  return PHOTOGRAPHER_PLAN_RULES[(planCode || 'free').toLowerCase()] || PHOTOGRAPHER_PLAN_RULES.free;
}
