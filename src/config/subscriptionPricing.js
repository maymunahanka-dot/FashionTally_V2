/**
 * Centralized Subscription Pricing Configuration
 * 
 * All subscription prices are defined here in one place.
 * Update these values to change prices across the entire app.
 */

export const SUBSCRIPTION_PRICING = {
  starter: {
    monthly: 5000,
    yearly: 50000, // 10 months price
  },
  growth: {
    monthly: 10000,
    yearly: 100000, // 10 months price
  },
  professional: {
    monthly: 15000,
    yearly: 150000, // 10 months price
  },
};

/**
 * Helper function to determine plan type based on payment amount
 * @param {number} amount - Payment amount
 * @returns {string} Plan type (PROFESSIONAL, GROWTH, STARTER, or Free)
 */
export function determinePlanType(amount) {
  if (amount >= SUBSCRIPTION_PRICING.professional.monthly) return "PROFESSIONAL";
  if (amount >= SUBSCRIPTION_PRICING.growth.monthly) return "GROWTH";
  if (amount >= SUBSCRIPTION_PRICING.starter.monthly) return "STARTER";
  return "Free";
}

/**
 * Get pricing for a specific plan
 * @param {string} planId - Plan identifier (starter, growth, professional)
 * @returns {object} Pricing object with monthly and yearly prices
 */
export function getPlanPricing(planId) {
  return SUBSCRIPTION_PRICING[planId.toLowerCase()] || SUBSCRIPTION_PRICING.starter;
}
