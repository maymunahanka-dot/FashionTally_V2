import { db } from "../backend/firebase.config.js";

export async function checkSubscriptionStatus(email, uuid, token) {
  const logPrefix = "[SUB_CHECK]";
  console.log(`${logPrefix} ▶️ Starting check`, { email, uuid });

  try {
    if (!email) {
      console.warn(`${logPrefix} ⚠️ No email provided`);
      return { isSubscribed: false };
    }

    // 1. Database Safety Check
    if (!db) {
      console.error(`${logPrefix} ❌ Firebase DB not initialized`);
      return getFallbackAccess();
    }

    // 2. Global Kill-Switch Check
    try {
      const settingsRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-setting/subscription`
      );
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data?.subscriptionsEnabled === false) {
        console.warn(`${logPrefix} 🚨 Subscriptions globally disabled — granting access`);
        return getFallbackAccess();
      }
    } catch (err) {
      console.warn(`${logPrefix} ⚠️ Could not fetch subscription setting, continuing`);
    }

    // 3. Fetch user from MongoDB via backend using token
    const userDoc = await findUserDoc(token);
    if (!userDoc) {
      console.error(`${logPrefix} ❌ User not found`);
      return { isSubscribed: false };
    }

    const userData = userDoc;

    // Newer backends send one ready-made summary (the same one the mobile app and
    // the free-plan limits use) — trust it so every place agrees.
    if (userData.subscription) {
      const s = userData.subscription;
      return {
        isSubscribed: s.isActive,
        planType: s.isActive ? s.plan : "Free",
        subscriptionType: s.status === "trial" ? "trial" : s.isActive ? "paid" : "free",
        subscriptionEndDate: s.endDate,
        isTrialActive: s.status === "trial",
        status: s.status,
      };
    }

    const {
      subscriptionType,
      planType,
      isTrialActive,
      subscriptionEndDate,
      payment_amount,
      payment_date,
      isSubscribed,
    } = userData;
    console.log(userData, "userdata");

    // 4. Evaluation Logic (Priority: Trial -> New Fields -> Legacy Paid)

    // Trial Check
    if (subscriptionType === "trial" && isTrialActive && subscriptionEndDate) {
      if (isFutureDate(subscriptionEndDate)) {
        return {
          isSubscribed: true,
          planType: planType || "Starter",
          subscriptionType: "trial",
          subscriptionEndDate,
        };
      }
      return {
        isSubscribed: false,
        planType: "Free",
        subscriptionType: "free",
      };
    }

    // New Fields Check — runs FIRST before legacy payment date window
    // isSubscribed + subscriptionEndDate is the authoritative source of truth
    if (
      isSubscribed &&
      subscriptionEndDate &&
      isFutureDate(subscriptionEndDate)
    ) {
      return {
        isSubscribed: true,
        planType: planType || "Starter",
        subscriptionType: subscriptionType || "paid",
        subscriptionEndDate,
      };
    }

    // Legacy Paid Check (30-day window) — fallback for old records without subscriptionEndDate
    if (payment_amount > 0 && payment_date && !subscriptionEndDate) {
      const daysSince = getDaysSince(payment_date);
      const isActive = daysSince <= 30;
      return {
        isSubscribed: isActive,
        paymentAmount: payment_amount,
        paymentDate: payment_date,
        planType: determinePlanType(payment_amount),
        subscriptionType: "paid",
      };
    }

    return { isSubscribed: false, planType: "Free", subscriptionType: "free" };
  } catch (error) {
    console.error(`${logPrefix} 💥 Unexpected error`, { email, error });
    return { isSubscribed: false };
  }
}

async function findUserDoc(token) {
  if (!token) return null;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/get`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  } catch (error) {
    console.error("[SUB_CHECK] Error fetching user from backend:", error);
    return null;
  }
}

const isFutureDate = (dateStr) => new Date(dateStr) > new Date();

const getDaysSince = (dateStr) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getFallbackAccess = () => ({
  isSubscribed: true,
  planType: "All Access",
  subscriptionType: "paid",
});

import { determinePlanType as getPlanTypeFromAmount } from "../config/subscriptionPricing.js";

function determinePlanType(amount) {
  return getPlanTypeFromAmount(amount);
}



