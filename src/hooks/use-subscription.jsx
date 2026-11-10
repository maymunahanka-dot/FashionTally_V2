import { useState, useEffect } from "react";
import { useNewAuth } from "../contexts/NewAuthContext.jsx";
import { hasFeatureAccess } from "../lib/subscription-utils.js";
import { determinePlanType } from "../config/subscriptionPricing.js";

export function useSubscription() {
  const { user } = useNewAuth();

  const [subscription, setSubscription] = useState({
    planType: "STARTER",
    isSubscribed: false,
    isTrialActive: false,
    subscriptionType: undefined,
    loading: true,
  });

  useEffect(() => {
    if (!user?.email) {
      setSubscription((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (!data.success) {
          console.log("❌ User not found from backend");
          setSubscription((prev) => ({ ...prev, loading: false }));
          return;
        }

        const userData = data.data;
        let plan = userData.planType?.toUpperCase() || "STARTER";

        if (!userData.planType && userData.payment_amount) {
          plan = determinePlanType(userData.payment_amount);
        }

        setSubscription({
          planType: plan,
          isSubscribed: userData.isSubscribed || false,
          isTrialActive: userData.isTrialActive || false,
          subscriptionEndDate: userData.subscriptionEndDate,
          subscriptionType: userData.subscriptionType,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchSubscription();
  }, [user?.email]);

  const checkFeature = (feature) => {
    return hasFeatureAccess(subscription.planType, feature);
  };

  return {
    ...subscription,
    checkFeature,
  };
}
