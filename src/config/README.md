# Subscription Pricing Configuration

## Overview
This directory contains centralized configuration for subscription pricing across the Fashion Tally application.

## Files

### `subscriptionPricing.js`
Contains all subscription plan prices in one place. This is the **single source of truth** for pricing throughout the app.

## How to Update Prices

To change subscription prices, simply edit the values in `subscriptionPricing.js`:

```javascript
export const SUBSCRIPTION_PRICING = {
  starter: {
    monthly: 4000,    // Change this value
    yearly: 40000,    // Change this value
  },
  growth: {
    monthly: 9000,    // Change this value
    yearly: 90000,    // Change this value
  },
  professional: {
    monthly: 15000,   // Change this value
    yearly: 150000,   // Change this value
  },
};
```

## Files That Use This Configuration

The following files automatically use the centralized pricing:

### Core Logic Files
- `ft/src/lib/payment.js` - Payment processing
- `ft/src/lib/flutterwave.js` - Payment gateway integration
- `ft/src/lib/subscription-check.js` - Subscription validation
- `ft/src/hooks/use-subscription.jsx` - Subscription hook

### UI Components
- `ft/src/pages/Home/Home.jsx` - Landing page pricing
- `ft/src/pages/Subscription/Subscription.jsx` - Subscription page
- `ft/src/pannel_pages/SubscriptionPanel/SubscriptionPanel.jsx` - Subscription panel
- `ft/src/components/SubscriptionGate/SubscriptionGate.jsx` - Subscription gate

## Important Notes

1. **One Change Updates Everything**: Changing prices in `subscriptionPricing.js` automatically updates all pricing displays and logic throughout the app.

2. **Plan Type Detection**: The `determinePlanType()` function uses these prices to automatically determine which plan a user has based on their payment amount.

3. **Yearly Pricing**: By default, yearly prices are set to 10 months worth (monthly × 10), giving users 2 months free.

4. **Do Not Edit Individual Files**: Never hardcode prices in individual component files. Always import from `subscriptionPricing.js`.

## Current Pricing (as of last update)

- **Starter**: ₦4,000/month or ₦40,000/year
- **Growth**: ₦9,000/month or ₦90,000/year  
- **Professional**: ₦15,000/month or ₦150,000/year
