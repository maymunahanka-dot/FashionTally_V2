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
import { auth } from "../../backend/firebase.config";
import { signOut } from "firebase/auth";
import "./SubscriptionGate.css";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";

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
  const { user } = useNewAuth();
  const { actualTheme } = useTheme();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("GROWTH"); // Default to popular plan
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
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
        const status = await checkSubscriptionStatus(user.email, user.uid);
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

  if (subscriptionStatus?.isSubscribed) {
    // Check if specific feature is required and if the plan has it
    if (requiredFeature) {
      const plan = subscriptionStatus.planType || "STARTER";

      const hasAccess = hasFeatureAccess(plan, requiredFeature);
      if (hasAccess) {
        console.log(`🎉 Rendering content for feature: ${requiredFeature}`);
        return <>{children}</>;
      } else {
        console.log(
          `🚫 Plan ${plan} does not have access to feature: ${requiredFeature}`
        );
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
            <h1 className="gate-title">Premium Feature</h1>
            <p className="gate-description">
              {requiredFeature} is available for subscribed users only. Upgrade
              your account to unlock powerful business management tools.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="feature-highlights">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3 className="feature-title">Client Management</h3>
              <p className="feature-desc">
                Advanced CRM tools to manage client relationships and loyalty
                programs
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <TrendingUp className="feature-icon" />
              </div>
              <h3 className="feature-title">Business Analytics</h3>
              <p className="feature-desc">
                Detailed insights and reports to grow your fashion business
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield className="feature-icon" />
              </div>
              <h3 className="feature-title">Priority Support</h3>
              <p className="feature-desc">
                Get dedicated support and priority assistance when you need it
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
                {subscriptionStatus?.subscriptionType === "trial" &&
                subscriptionStatus?.isTrialActive
                  ? "Free Trial Active"
                  : "Current Status"}
              </div>
              <h3 className="status-title">
                {subscriptionStatus?.planType || "Free"} Account
              </h3>
              <p className="status-description">
                {subscriptionStatus?.subscriptionType === "trial" &&
                subscriptionStatus?.isTrialActive
                  ? `Your free trial is active! Enjoy full access to all features.`
                  : subscriptionStatus?.subscriptionType === "trial"
                  ? "Your free trial has expired. Upgrade to continue using premium features."
                  : subscriptionStatus?.subscriptionType === "paid"
                  ? "Your paid subscription may have expired"
                  : "You're currently using the free version of Fashion Tally"}
              </p>
              <p className="user-email">Logged in as: {user.email}</p>
              {subscriptionStatus?.subscriptionEndDate && (
                <p className="subscription-date">
                  {subscriptionStatus?.subscriptionType === "trial" &&
                  subscriptionStatus?.isTrialActive
                    ? `Trial ends: ${new Date(
                        subscriptionStatus.subscriptionEndDate
                      ).toLocaleDateString()}`
                    : `Subscription ended: ${new Date(
                        subscriptionStatus.subscriptionEndDate
                      ).toLocaleDateString()}`}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="refresh-btn"
                onClick={() => window.location.reload()}
              >
                Refresh Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          )}

          {/* Subscription Plans Preview */}
          <div className="plans-preview">
            <div className="plans-header">
              <Crown className="plans-icon" />
              <h2 className="plans-title">Choose Your Plan</h2>
              <p className="plans-description">
                Start with any paid plan to unlock CRM features
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
                  {plan.popular && <div className="popular-badge">Popular</div>}
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-pricee">
                    ₦{plan.monthlyPrice.toLocaleString()}
                  </p>
                  <p className="plan-period">/month</p>
                  <p className="plan-description">{plan.description}</p>
                </div>
              ))}
            </div>

            {/* Selected Plan Features */}
            {selectedPlan && (
              <div className="selected-plan-features">
                <h3 className="features-title">
                  {selectedPlan} Plan Features:
                </h3>
                <div className="features-grid">
                  {pricingPlans
                    .find((plan) => plan.name === selectedPlan)
                    ?.features.slice(0, 8) // Show first 8 features
                    .map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircle className="check-icon" />
                        <span className="feature-text">{feature}</span>
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
                        +{selectedPlanData.features.length - 8} more features
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
              Upgrade to {selectedPlan}
              <ArrowRight className="btn-icon" />
            </button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="back-btn"
            >
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="help-text">
            Need help choosing a plan?{" "}
            <a href="/support" className="help-link">
              Contact our support team
            </a>{" "}
            for personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
