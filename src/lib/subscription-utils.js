import { PLAN_FEATURES, FEATURE_NAMES } from "../constants/subscription.js";

/**
 * Checks if a plan has access to a specific feature
 */
export function hasFeatureAccess(plan, feature) {
  console.log("[hasFeatureAccess] START", { plan, feature });

  if (!plan) {
    console.warn("[hasFeatureAccess] ❌ No plan provided");
    return false;
  }

  const normalizedPlan = plan.toUpperCase();
  console.log("[hasFeatureAccess] Normalized plan:", normalizedPlan);

  const planFeatures = PLAN_FEATURES[normalizedPlan];
  console.log("[hasFeatureAccess] Plan features:", planFeatures);

  if (!planFeatures) {
    console.warn("[hasFeatureAccess] ❌ Unknown plan", normalizedPlan);
    return false;
  }

  // 1️⃣ Direct constant check
  const directMatch = planFeatures.includes(feature);
  console.log("[hasFeatureAccess] Direct match check:", {
    feature,
    directMatch,
  });

  if (directMatch) {
    console.log("[hasFeatureAccess] ✅ Access granted (direct match)");
    return true;
  }

  // 2️⃣ Display-name → constant mapping
  const featureKey = FEATURE_NAMES[feature];
  console.log("[hasFeatureAccess] Feature name mapping:", {
    inputFeature: feature,
    mappedFeatureKey: featureKey,
  });

  const mappedMatch =
    featureKey !== undefined && planFeatures.includes(featureKey);

  console.log("[hasFeatureAccess] Mapped match check:", mappedMatch);

  if (mappedMatch) {
    console.log("[hasFeatureAccess] ✅ Access granted (mapped feature)");
    return true;
  }

  console.warn("[hasFeatureAccess] ❌ Access denied", {
    plan: normalizedPlan,
    feature,
    planFeatures,
  });

  return false;
}


