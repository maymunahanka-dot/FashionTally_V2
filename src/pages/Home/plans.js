/** Subscription plans shown on the home page and the app pay page (prices live in config/subscriptionPricing.js). */
export const PLANS = [
  {
    key: "starter",
    name: "Starter",
    blurb: "For solo designers getting organised.",
    features: [
      "1 user",
      "Clients & measurements",
      "Custom & bespoke orders",
      "Invoicing & payments",
      "Inventory & finance reports",
      "Appointment scheduling",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    popular: true,
    blurb: "For growing brands with a small team.",
    features: [
      "Up to 3 users",
      "Everything in Starter",
      "Notifications",
      "Calendar sync",
      "Enhanced CRM",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    blurb: "For studios with structured teams.",
    features: [
      "Up to 10 users",
      "Everything in Growth",
      "Full workflow access",
      "Priority notifications",
      "Priority support",
    ],
  },
  {
    key: "custom",
    name: "Custom",
    blurb: "For large brands with special needs.",
    features: ["Unlimited users", "White label", "API integrations", "Enterprise workflow"],
  },
];
