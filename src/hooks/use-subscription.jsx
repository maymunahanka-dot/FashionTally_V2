import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../backend/firebase.config.js";
import { useNewAuth } from "../contexts/NewAuthContext.jsx";
import { hasFeatureAccess } from "../lib/subscription-utils.js";
import { determinePlanType } from "../config/subscriptionPricing.js";

export function useSubscription() {
  const { user } = useNewAuth();
  const currentUser = user;

  const [subscription, setSubscription] = useState({
    planType: "STARTER", // Default
    isSubscribed: false,
    isTrialActive: false,
    subscriptionType: undefined,
    loading: true,
  });

  useEffect(() => {
    if (!currentUser || !db) {
      setSubscription((prev) => ({ ...prev, loading: false }));
      return;
    }

    let unsubscribe;

    const initSubscription = async () => {
      if (!db) return;
      let effectiveEmail = currentUser.email;

      console.log("🔍 Initializing subscription for user:", currentUser);
      console.log("🔍 User email:", effectiveEmail);

      // Check if user is an admin
      try {
        const adminsRef = collection(db, "fashiontally_admins");
        const adminQuery = query(
          adminsRef,
          where("email", "==", currentUser.email)
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0].data();
          if (adminDoc.invitedBy) {
            console.log(
              "👥 User is an invited admin. Checking inviter:",
              adminDoc.invitedBy
            );
            effectiveEmail = adminDoc.invitedBy;
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }

      const userDocRef = doc(db, "fashiontally_users", effectiveEmail);
      console.log(
        "🔍 Looking for document at path:",
        `fashiontally_users/${effectiveEmail}`
      );

      // First, do a one-time check to see if the document exists
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          console.log("✅ Document found on initial check:", docSnap.data());
        } else {
          console.log("❌ Document not found on initial check");
        }
      } catch (error) {
        console.error("Error during initial document check:", error);
      }

      unsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let plan = data.planType?.toUpperCase() || "STARTER";

            if (!data.planType && data.payment_amount) {
              const amount = data.payment_amount;
              plan = determinePlanType(amount);
            }

            console.log(
              "💳💳💳💳💳💳💳💳💳💳 SUBSCRIPTION DATA - User Email:",
              effectiveEmail
            );
            console.log(
              "📊📊📊📊📊📊📊📊📊📊 SUBSCRIPTION DATA - Plan Type:",
              plan
            );
            console.log(
              "✅✅✅✅✅✅✅✅✅✅ SUBSCRIPTION DATA - Is Subscribed:",
              data.isSubscribed || false
            );
            console.log(
              "🆓🆓🆓🆓🆓🆓🆓🆓🆓🆓 SUBSCRIPTION DATA - Is Trial Active:",
              data.isTrialActive || false
            );
            console.log(
              "📅📅📅📅📅📅📅📅📅📅 SUBSCRIPTION DATA - End Date:",
              data.subscriptionEndDate
            );
            console.log(
              "💰💰💰💰💰💰💰💰💰💰 SUBSCRIPTION DATA - Payment Amount:",
              data.payment_amount
            );
            console.log(
              "🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️ SUBSCRIPTION DATA - Payment Date:",
              data.payment_date
            );
            console.log(
              "🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍 SUBSCRIPTION DATA - Raw Data:",
              data
            );

            // If no subscription info, fall back to createdAt-based 7-day trial
            let isSubscribed = data.isSubscribed || false;
            let isTrialActive = data.isTrialActive || false;
            let subscriptionEndDate = data.subscriptionEndDate;
            let subscriptionType = data.subscriptionType;

            if (!isSubscribed && !data.payment_amount && data.createdAt) {
              const createdDate = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt);
              const trialEnd = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              if (trialEnd > new Date()) {
                isSubscribed = true;
                isTrialActive = true;
                subscriptionType = "trial";
                subscriptionEndDate = trialEnd.toISOString();
                plan = "GROWTH";
                console.log("🆓 createdAt trial active for:", effectiveEmail);
              }
            }

            setSubscription({
              planType: plan,
              isSubscribed,
              isTrialActive,
              subscriptionEndDate,
              subscriptionType,
              loading: false,
            });
          } else {
            console.log(
              "❌❌❌❌❌❌❌❌❌❌ SUBSCRIPTION DATA - No user document found for email:",
              effectiveEmail
            );
            // No Firestore doc — fall back to Firebase Auth createdAt from user context
            const createdAt = currentUser?.createdAt;
            if (createdAt) {
              const createdDate = new Date(createdAt);
              const trialEnd = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              if (trialEnd > new Date()) {
                console.log("🆓 No doc — createdAt trial active for:", effectiveEmail);
                setSubscription({
                  planType: "GROWTH",
                  isSubscribed: true,
                  isTrialActive: true,
                  subscriptionType: "trial",
                  subscriptionEndDate: trialEnd.toISOString(),
                  loading: false,
                });
                return;
              }
            }
            setSubscription((prev) => ({ ...prev, loading: false }));
          }
        },
        (error) => {
          console.error("Error fetching subscription:", error);
          setSubscription((prev) => ({ ...prev, loading: false }));
        }
      );
    };

    initSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const checkFeature = (feature) => {
    return hasFeatureAccess(subscription.planType, feature);
  };

  return {
    ...subscription,
    checkFeature,
  };
}
