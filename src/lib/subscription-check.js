import { db } from "../backend/firebase.config.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export async function checkSubscriptionStatus(email, uuid) {
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
    const settingsDoc = await getDoc(
      doc(db, "system_settings", "subscription")
    );
    if (
      settingsDoc.exists() &&
      settingsDoc.data()?.subscriptionsEnabled === false
    ) {
      console.warn(
        `${logPrefix} 🚨 Subscriptions globally disabled — granting access`
      );
      return getFallbackAccess();
    }

    // 3. Admin / Delegation Logic
    let effectiveEmail = email;
    const adminSnapshot = await getDocs(
      query(collection(db, "fashiontally_admins"), where("email", "==", email))
    );

    if (!adminSnapshot.empty) {
      const adminData = adminSnapshot.docs[0].data();
      if (adminData.invitedBy) {
        console.log(
          `${logPrefix} 🔁 Invited admin: delegation to ${adminData.invitedBy}`
        );
        effectiveEmail = adminData.invitedBy;
      }
    }

    // 4. Resolve User Document
    const userDoc = await findUserDoc(effectiveEmail, uuid);
    if (!userDoc) {
      console.error(`${logPrefix} ❌ User not found`);
      return { isSubscribed: false };
    }

    const userData = userDoc.data();
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

    // 5. Evaluation Logic (Priority: Trial -> Paid Legacy -> New Fields)

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

    // Legacy Paid Check (30-day window)
    if (payment_amount > 0 && payment_date) {
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

    // New Fields Check
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

    // createdAt fallback — grant 7-day trial based on account creation date
    const createdAt = userData.createdAt;
    if (createdAt) {
      const createdDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
      const daysSinceCreation = getDaysSince(createdDate.toISOString());
      if (daysSinceCreation < 7) {
        const trialEndDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        console.log(`${logPrefix} 🆓 createdAt trial active — ${6 - daysSinceCreation} days remaining`);
        return {
          isSubscribed: true,
          planType: "GROWTH",
          subscriptionType: "trial",
          isTrialActive: true,
          subscriptionEndDate: trialEndDate,
        };
      }
    }

    return { isSubscribed: false, planType: "Free", subscriptionType: "free" };
  } catch (error) {
    console.error(`${logPrefix} 💥 Unexpected error`, { email, error });
    return { isSubscribed: false };
  }
}

export async function findUserDoc(email, uuid) {
  if (!db) return null;

  // Try Email
  const emailRef = doc(db, "fashiontally_users", email);
  const emailSnap = await getDoc(emailRef);
  if (emailSnap.exists()) return emailSnap;

  // Try UUID Fallback
  if (uuid) {
    const uuidRef = doc(db, "fashiontally_users", uuid);
    const uuidSnap = await getDoc(uuidRef);
    if (uuidSnap.exists()) return uuidSnap;
  }
  return null;
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

export async function addTestSubscription(email, uuid, options = {}) {
  const logPrefix = "[SUB_TEST_ADD]";

  const resolved = await resolveUserDocRef(email, uuid);
  if (!resolved) {
    console.error(`${logPrefix} ❌ User not found`, { email, uuid });
    return false;
  }

  const { ref, keyType } = resolved;

  const planType = options?.planType || "Growth";
  const subscriptionType = options?.subscriptionType || "paid";
  const daysValid = options?.daysValid ?? 30;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysValid);

  console.log(`${logPrefix} ✅ Adding test subscription`, {
    keyType,
    planType,
    subscriptionType,
    endDate,
  });

  await updateDoc(ref, {
    isSubscribed: true,
    subscriptionType,
    planType,
    subscriptionEndDate: endDate.toISOString(),
    isTrialActive: subscriptionType === "trial",
    payment_amount: subscriptionType === "paid" ? 10000 : null,
    payment_date: subscriptionType === "paid" ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function removeTestSubscription(email, uuid) {
  const logPrefix = "[SUB_TEST_REMOVE]";

  const resolved = await resolveUserDocRef(email, uuid);
  if (!resolved) {
    console.error(`${logPrefix} ❌ User not found`, { email, uuid });
    return false;
  }

  const { ref, keyType } = resolved;

  console.log(`${logPrefix} 🧹 Removing subscription`, { keyType });

  await updateDoc(ref, {
    isSubscribed: false,
    subscriptionType: "free",
    planType: "Free",
    subscriptionEndDate: null,
    isTrialActive: false,
    payment_amount: null,
    payment_date: null,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

async function resolveUserDocRef(email, uuid) {
  if (!db) throw new Error("DB not initialized");

  if (email) {
    const emailRef = doc(db, "fashiontally_users", email);
    const emailSnap = await getDoc(emailRef);
    if (emailSnap.exists()) {
      return { ref: emailRef, keyType: "email" };
    }
  }

  if (uuid) {
    const uuidRef = doc(db, "fashiontally_users", uuid);
    const uuidSnap = await getDoc(uuidRef);
    if (uuidSnap.exists()) {
      return { ref: uuidRef, keyType: "uuid" };
    }
  }

  return null;
}
