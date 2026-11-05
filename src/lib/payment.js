// Payment integration utilities for subscription management
import { SUBSCRIPTION_PRICING } from '../config/subscriptionPricing.js';




/**
 * Format amount for display
 * @param {number} amount - Amount in kobo/cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
function formatAmount(amount, currency = "NGN") {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Get plan pricing
 * @param {string} planType - Plan type (starter, growth, professional)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {Object} Plan pricing information
 */
export function getPlanPricing(planType, billingCycle = "monthly") {
  const pricing = {
    starter: {
      monthly: SUBSCRIPTION_PRICING.starter.monthly,
      yearly: SUBSCRIPTION_PRICING.starter.yearly,
    },
    growth: {
      monthly: SUBSCRIPTION_PRICING.growth.monthly,
      yearly: SUBSCRIPTION_PRICING.growth.yearly,
    },
    professional: {
      monthly: SUBSCRIPTION_PRICING.professional.monthly,
      yearly: SUBSCRIPTION_PRICING.professional.yearly,
    },
  };

  const planPricing = pricing[planType.toLowerCase()];
  if (!planPricing) {
    throw new Error(`Invalid plan type: ${planType}`);
  }

  const amount = planPricing[billingCycle];
  const savings =
    billingCycle === "yearly" ? planPricing.monthly * 12 - amount : 0;
  const savingsPercentage =
    billingCycle === "yearly"
      ? Math.round((savings / (planPricing.monthly * 12)) * 100)
      : 0;

  return {
    amount,
    formattedAmount: formatAmount(amount),
    savings,
    formattedSavings: formatAmount(savings),
    savingsPercentage,
    billingCycle,
    planType,
  };
}




