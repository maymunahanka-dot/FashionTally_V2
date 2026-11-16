import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Crown,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  LogOut,
} from "lucide-react";
import Button from "../button/Button";
import { checkSubscriptionStatus } from "../../lib/subscription-check";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { hasFeatureAccess } from "../../lib/subscription-utils";
import "./SubscriptionGate.css";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";


/** Pages that stay open when the trial or plan has ended (keep in step with the mobile app). */
const FREE_PLAN_FEATURES = ["Dashboard Analytics", "Client Management", "Invoicing"];

// Import pricing plans matching tally-main
const pricingPlans = [
  {
    name: "STARTER",
    monthlyPrice: SUBSCRIPTION_PRICING.starter.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.starter.yearly,
    description: "Best for solo designers",
    badge: "Starter",
    badgeColor: "starter-badge",
    features: [
      "1 User",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "No Notifications",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "GROWTH",
    monthlyPrice: SUBSCRIPTION_PRICING.growth.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.growth.yearly,
    description: "Ideal for growing fashion brands",
    badge: "Popular",
    badgeColor: "popular-badge",
    features: [
      "Up to 3 Users",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "Notifications",
      "Calendar Sync",
      "Enhanced CRM",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "PROFESSIONAL",
    monthlyPrice: SUBSCRIPTION_PRICING.professional.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.professional.yearly,
    description: "Best for studios with structured teams and higher volume",
    badge: "Pro",
    badgeColor: "pro-badge",
    features: [
      "Up to 10 Users",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "Notifications",
      "Calendar Sync",
      "Enhanced CRM",
      "Full Workflow Access",
      "Priority Notifications",
      "Priority Support",
    ],
    cta: "Get Started",
    popular: false,
  },
];

export function SubscriptionGate({ children, requiredFeature = "CRM Tools" }) {
  const { t: tx } = useTranslation();
  const { user, signOut } = useNewAuth();
  const { actualTheme } = useTheme();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("GROWTH"); // Default to popular plan
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert(tx("auto.failedToLogoutPleaseTry_9d05"));
    }
  };

  useEffect(() => {
    async function checkStatus() {
      if (!user?.email) {
        setSubscriptionStatus({ isSubscribed: false });
        setLoading(false);
        return;
      }

      try {
        console.log("🔐 Checking subscription status for:", user.email);
        const token = localStorage.getItem("authToken");
        const status = await checkSubscriptionStatus(user.email, user.uid, token);
        console.log("📊 Subscription status result:", status);
        setSubscriptionStatus(status);

        if (status.isSubscribed) {
          console.log("✅ User has active subscription:", {
            planType: status.planType,
            subscriptionType: status.subscriptionType,
            endDate: status.subscriptionEndDate,
            isTrialActive: status.isTrialActive,
          });
        } else {
          console.log("❌ User does not have active subscription");
        }
      } catch (error) {
        console.error("❗ Error checking subscription:", error);
        setSubscriptionStatus({ isSubscribed: false });
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="subscription-loading" data-theme={actualTheme}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Free plan (no active trial or subscription): these pages stay open.
  // Clients and invoices are capped at 10 each by the backend.
  if (!subscriptionStatus?.isSubscribed && FREE_PLAN_FEATURES.includes(requiredFeature)) {
    return <>{children}</>;
  }

  if (subscriptionStatus?.isSubscribed) {
    // Check if specific feature is required and if the plan has it
    if (requiredFeature) {
      const plan = subscriptionStatus.planType || "STARTER";

      // For all features, use normal logic
      const hasAccess = hasFeatureAccess(plan, requiredFeature);
      if (hasAccess) {
        console.log(`🎉 Rendering content for feature: ${requiredFeature}`);
        return <>{children}</>;
      } else {
        console.log(
          `🚫 Plan ${plan} does not have access to feature: ${requiredFeature}`
        );
        // Continue to show subscription gate for this specific feature
      }
    } else {
      console.log("🎉 Rendering content - user is subscribed");
      return <>{children}</>;
    }
  }

  console.log("🚫 Blocking premium content - showing subscription gate");

  return (
    <div className="subscription-gate" data-theme={actualTheme}>
      <div className="gate-container">
        <div className="gate-content">
          {/* Lock Icon */}
          <div className="lock-icon-wrapper">
            <div className="lock-icon-bg">
              <Lock className="lock-icon" />
            </div>
          </div>

          {/* Main Message */}
          <div className="gate-header">
            <h1 className="gate-title">{tx("auto.premiumFeature_fbaf")}</h1>
            <p className="gate-description">
              {tl(requiredFeature)}{" "}{tx("auto.isAvailableForSubscribedUsers_00e2")}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="feature-highlights">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3 className="feature-title">{tx("auto.clientManagement_9610")}</h3>
              <p className="feature-desc">
                {tx("auto.advancedCrmToolsToManage_f547")}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <TrendingUp className="feature-icon" />
              </div>
              <h3 className="feature-title">{tx("auto.businessAnalytics_9442")}</h3>
              <p className="feature-desc">
                {tx("auto.detailedInsightsAndReportsTo_1064")}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield className="feature-icon" />
              </div>
              <h3 className="feature-title">{tx("auto.prioritySupport_ba43")}</h3>
              <p className="feature-desc">
                {tx("auto.getDedicatedSupportAndPriority_7ffe")}
              </p>
            </div>
          </div>

          {/* Current Status */}
          {user?.email && (
            <div
              className={`current-status ${
                subscriptionStatus?.subscriptionType === "trial" &&
                subscriptionStatus?.isTrialActive
                  ? "trial-active"
                  : "no-subscription"
              }`}
            >
              <div
                className={`status-badge ${
                  subscriptionStatus?.subscriptionType === "trial" &&
                  subscriptionStatus?.isTrialActive
                    ? "trial"
                    : "free"
                }`}
              >
                {tl(subscriptionStatus?.subscriptionType === "trial" &&
                subscriptionStatus?.isTrialActive
                  ? tx("auto.freeTrialActive_8306")
                  : tx("auto.currentStatus_d08b"))}
              </div>
              <h3 className="status-title">
                {tl(subscriptionStatus?.planType || tx("auto.free_75f5"))}{" "}{tx("auto.account_85df")}
              </h3>
              <p className="status-description">
                {subscriptionStatus?.subscriptionType === "trial" &&
                subscriptionStatus?.isTrialActive
                  ? `Your free trial is active! Enjoy full access to all features.`
                  : subscriptionStatus?.subscriptionType === "trial"
                  ? tx("auto.yourFreeTrialHasExpired_9454")
                  : subscriptionStatus?.subscriptionType === "paid"
                  ? tx("auto.yourPaidSubscriptionMayHave_401f")
                  : tx("auto.youReCurrentlyUsingThe_2865")}
              </p>
              <p className="user-email">{tx("auto.loggedInAs_3049")}{" "}{tl(user.email)}</p>
              {subscriptionStatus?.subscriptionEndDate && (
                <p className="subscription-date">
                  {tl(subscriptionStatus?.subscriptionType === "trial" &&
                  subscriptionStatus?.isTrialActive
                    ? tx("tpl.trialEnds_536e", { v0: new Date(
                        subscriptionStatus.subscriptionEndDate
                      ).toLocaleDateString(dateLocale()) })
                    : tx("tpl.subscriptionEnded_96e7", { v0: new Date(
                        subscriptionStatus.subscriptionEndDate
                      ).toLocaleDateString(dateLocale()) }))}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="refresh-btn"
                onClick={() => window.location.reload()}
              >
                {tx("auto.refreshStatus_28a0")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                {tx("auto.logout_e43d")}
              </Button>
            </div>
          )}

          {/* Subscription Plans Preview */}
          <div className="plans-preview">
            <div className="plans-header">
              <Crown className="plans-icon" />
              <h2 className="plans-title">{tx("auto.chooseYourPlan_c197")}</h2>
              <p className="plans-description">
                {tx("auto.startWithAnyPaidPlan_e3ee")}
              </p>
            </div>

            <div className="plans-grid">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`plan-card ${
                    selectedPlan === plan.name ? "selected" : ""
                  } ${plan.popular ? "popular" : ""}`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  {plan.popular && <div className="popular-badge">{tx("auto.popular_9bc2")}</div>}
                  <h3 className="plan-name">{tl(plan.name)}</h3>
                  <p className="plan-pricee">
                    ₦{plan.monthlyPrice.toLocaleString()}
                  </p>
                  <p className="plan-period">{tx("auto.month_ab0c")}</p>
                  <p className="plan-description">{tl(plan.description)}</p>
                </div>
              ))}
            </div>

            {/* Selected Plan Features */}
            {selectedPlan && (
              <div className="selected-plan-features">
                <h3 className="features-title">
                  {tl(selectedPlan)}{" "}{tx("auto.planFeatures_fa20")}
                </h3>
                <div className="features-grid">
                  {pricingPlans
                    .find((plan) => plan.name === selectedPlan)
                    ?.features.slice(0, 8) // Show first 8 features
                    .map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircle className="check-icon" />
                        <span className="feature-text">{tl(feature)}</span>
                      </div>
                    ))}
                </div>
                {(() => {
                  const selectedPlanData = pricingPlans.find(
                    (plan) => plan.name === selectedPlan
                  );
                  return (
                    selectedPlanData &&
                    selectedPlanData.features.length > 8 && (
                      <p className="more-features">
                        +{selectedPlanData.features.length - 8}{" "}{tx("auto.moreFeatures_2175")}
                      </p>
                    )
                  );
                })()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="gate-actions">
            <button
              className="upgrade-btn primary"
              onClick={() =>
                navigate(`/subscription?plan=${selectedPlan.toLowerCase()}`)
              }
            >
              <Sparkles className="btn-icon" />
              {tx("auto.upgradeTo_2161")}{" "}{tl(selectedPlan)}
              <ArrowRight className="btn-icon" />
            </button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="back-btn"
            >
              {tx("auto.goBack_f03e")}
            </Button>
          </div>

          {/* Help Text */}
          <p className="help-text">
            {tx("auto.needHelpChoosingAPlan_5387")}{" "}
            <a href="/support" className="help-link">
              {tx("auto.contactOurSupportTeam_6456")}
            </a>{" "}
            {tx("auto.forPersonalizedRecommendations_2c03")}
          </p>
        </div>
      </div>
    </div>
  );
}
