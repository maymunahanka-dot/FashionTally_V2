import { useState, useEffect } from "react";
import { ArrowLeft, Check, Crown, Clock, X, XCircle, CreditCard, Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../../components/button/Button";
import { useSubscription } from "../../hooks/use-subscription";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getPlanPricing } from "../../lib/payment";
import "./SubscriptionPanel.css";
import { SUBSCRIPTION_PRICING, TRIAL_DAYS } from "../../config/subscriptionPricing.js";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";


const SubscriptionPanel = ({ onClose }) => {
  const { t: tx } = useTranslation();
  const subscription = useSubscription();
  const { user } = useNewAuth();
  const { actualTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [activeTab, setActiveTab] = useState("plan");
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const subscriptionPlans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: SUBSCRIPTION_PRICING.starter.monthly,
      yearlyPrice: SUBSCRIPTION_PRICING.starter.yearly,
      description: "Perfect for solo designers",
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
      ],
      buttonText: "Get Started",
      cardStyle: "basic",
    },
    {
      id: "growth",
      name: "Growth",
      monthlyPrice: SUBSCRIPTION_PRICING.growth.monthly,
      yearlyPrice: SUBSCRIPTION_PRICING.growth.yearly,
      description: "Ideal for growing fashion brands",
      badge: "Popular",
      badgeColor: "#3b82f6",
      features: [
        "Up to 3 Users",
        "All Starter features",
        "Design Management",
        "Notifications",
        "Calendar Sync",
        "Enhanced CRM",
      ],
      buttonText: "Upgrade to Growth",
      cardStyle: "popular",
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: SUBSCRIPTION_PRICING.professional.monthly,
      yearlyPrice: SUBSCRIPTION_PRICING.professional.yearly,
      description: "Best for studios with teams",
      badge: "Pro",
      badgeColor: "#f59e0b",
      features: [
        "Up to 10 Users",
        "All Growth features",
        "Full Workflow Access",
        "Priority Notifications",
        "Priority Support",
      ],
      buttonText: "Upgrade to Professional",
      cardStyle: "pro",
    },
  ];

  // Update plan status based on current subscription
  const updatedPlans = subscriptionPlans.map((plan) => {
    // Only an active plan (or trial) counts as "current"; an expired one can be bought again.
    const isCurrentPlan =
      subscription.isSubscribed &&
      subscription.planType?.toUpperCase() === plan.id.toUpperCase();
    const pricing = getPlanPricing(plan.id, "monthly");

    if (isCurrentPlan) {
      return {
        ...plan,
        price: pricing.formattedAmount,
        period: "/month",
        badge: subscription.isTrialActive ? "Trial Active" : "Current Plan",
        badgeColor: subscription.isTrialActive ? "#10b981" : "#6b7280",
        buttonText: subscription.isTrialActive
          ? "Trial Active"
          : "Current Plan",
        buttonDisabled: true,
        cardStyle: "current",
      };
    }

    return {
      ...plan,
      price: pricing.formattedAmount,
      period: "/month",
    };
  });

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = async (plan) => {
    if (!user?.email) {
      alert(tx("auto.pleaseLogInToUpgrade_3b86"));
      return;
    }

    if (plan.buttonDisabled) return;

    // Redirect to the subscription page with the selected plan
    const planName = plan.id.toLowerCase();
    window.location.href = `/subscription?plan=${planName}`;
  };

  const handleCancelSubscription = async () => {
    if (!user?.email) return;

    if (!cancelReason.trim()) {
      alert(tx("auto.pleaseProvideAReasonFor_5323"));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      // Save cancellation record + reset subscription via backend
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscription-cancelation/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userEmail: user.email,
            userId: user.uid,
            userName: user.displayName || user.name || "Unknown",
            planType: subscription.planType,
            subscriptionType: subscription.subscriptionType,
            reason: cancelReason,
            subscriptionEndDate: subscription.subscriptionEndDate,
            isTrialActive: subscription.isTrialActive,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(tx("auto.subscriptionCancelledSuccessfull_4d03"));
        setShowCancelModal(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(tx("auto.failedToCancelSubscriptionPlease_4216"));
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      alert(tx("auto.anErrorOccurredWhileCancelling_13f3"));
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = () => {
    setShowCancelModal(true);
    setCancelReason("");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason("");
  };

  // The backend's summary is the source of truth (the mobile app shows the same one).
  const summary = subscription.summary;
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });

  const getTrialDaysRemaining = () => {
    if (summary) return summary.daysLeft;
    if (!subscription.subscriptionEndDate) return 0;
    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionProgress = () => {
    if (summary) {
      return {
        // Bar shows the share of days LEFT (shrinks over time), same as the mobile app.
        percentage: summary.totalDays ? (summary.daysLeft / summary.totalDays) * 100 : 0,
        daysRemaining: summary.daysLeft,
        totalDays: summary.totalDays,
      };
    }
    if (!subscription.subscriptionEndDate)
      return { percentage: 0, daysRemaining: 0, totalDays: 30 };

    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();

    // Calculate total subscription period (30 days for monthly, TRIAL_DAYS for trial)
    const totalDays = subscription.isTrialActive ? TRIAL_DAYS : 30;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays);

    const totalTime = endDate - startDate;
    const remainingTime = endDate - today;
    const elapsedTime = totalTime - remainingTime;

    const percentage = Math.max(
      0,
      Math.min(100, (elapsedTime / totalTime) * 100)
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil(remainingTime / (1000 * 60 * 60 * 24))
    );

    return { percentage: 100 - percentage, daysRemaining, totalDays };
  };

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update initial loading based on subscription loading state
  useEffect(() => {
    if (!subscription.loading) {
      setInitialLoading(false);
    }
  }, [subscription.loading]);

  // Fetch payments when payments tab is opened
  useEffect(() => {
    if (activeTab === "payments" && user?.email) {
      const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payment/list`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (data.success) setPayments(data.data);
        } catch (err) {
          console.error("Error fetching payments:", err);
        } finally {
          setPaymentsLoading(false);
        }
      };
      fetchPayments();
    }
  }, [activeTab, user?.email]);

  return (
    <div className="sub_panel" data-theme={actualTheme}>
      {/* Loading Overlay */}
      {initialLoading && (
        <div className="sub_loading_overlay">
          <div className="sub_loading_content">
            <div className="sub_loading_spinner"></div>
            <p className="sub_loading_text">{tx("auto.loadingYourSubscription_11c4")}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sub_header">
        <button className="sub_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="sub_header_content">
          <h2 className="sub_title">{tx("auto.subscription_8fde")}</h2>
          <p className="sub_subtitle">{tx("auto.planBilling_1e4e")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sub_tabs">
        <button
          className={`sub_tab_btn ${activeTab === "plan" ? "active" : ""}`}
          onClick={() => setActiveTab("plan")}
        >
          <Crown size={16} />
          {tx("auto.plan_ae2f")}
        </button>
        <button
          className={`sub_tab_btn ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          <CreditCard size={16} />
          {tx("auto.payments_4435")}
        </button>
      </div>

      {/* Content */}
      <div className="sub_content">
        {activeTab === "plan" ? (
        <>
        {/* Current Subscription Status */}
        {subscription.isSubscribed && (
          <div className="current_subscription_status">
            <div className="status_header">
              <div className="status_header_left">
                <Crown size={20} className="crown_icon" />
                <h3>{tx("auto.currentSubscription_2304")}</h3>
              </div>
              <button
                className="cancel_subscription_icon"
                onClick={openCancelModal}
                disabled={loading}
                title={tx("auto.cancelSubscription_58b2")}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="status_details">
              <div className="plan_info">
                <span className="current_plan_name">
                  {tl(summary?.plan ?? subscription.planType)}{" "}{tx("auto.plan_ae2f")}
                  {summary?.billingCycle && (
                    <span className="sub_cycle_note">
                      {" "}· {tl(summary.billingCycle === "yearly" ? tx("auto.yearly_7622") : tx("auto.monthly_d31e"))}
                    </span>
                  )}
                </span>
                {subscription.isTrialActive && (
                  <span className="trial_badge">
                    <Clock size={14} />
                    {tx("auto.trial_2b3e")}{" "}{tl(getTrialDaysRemaining())}{" "}{tx("auto.daysLeft_0575")}
                  </span>
                )}
              </div>

              {(summary?.endDate || subscription.subscriptionEndDate) && (
                <>
                  <div className="subscription_progress">
                    <div className="progress_info">
                      <span className="progress_label">{tx("auto.daysRemaining_cf27")}</span>
                      <span className="progress_days">
                        {tl(getSubscriptionProgress().daysRemaining)}{" "}{tx("auto.of_de04")}{" "}
                        {tl(getSubscriptionProgress().totalDays)}{" "}{tx("auto.days_5548")}
                      </span>
                    </div>
                    <div className="progress_bar">
                      <div
                        className="progress_fill"
                        style={{
                          width: `${getSubscriptionProgress().percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <p className="expiry_date">
                    {tl(subscription.isTrialActive ? tx("auto.trialEndsOn_8196") : tx("auto.endsOn_5c26"))}{" "}
                    {tl(formatDate(summary?.endDate ?? subscription.subscriptionEndDate))}
                    {!subscription.isTrialActive && tx("auto.doesnTRenewAutomatically_f2c6")}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* No active plan: say why, in the same words as the mobile app */}
        {!subscription.isSubscribed && (
          <div className="free_trial_banner">
            <div className="trial_content">
              <h3>
                {summary?.status === "trial_ended"
                  ? tx("auto.yourFreeTrialHasEnded_d030")
                  : summary?.status === "expired"
                  ? tx("tpl.yourPlanHasExpired_5c5b", { v0: summary.plan })
                  : tx("auto.youDonTHaveAn_82d7")}
              </h3>
              <p>
                {tl(summary?.endDate && summary.status !== "cancelled"
                  ? tx("tpl.itEndedOnChooseA_932a", { v0: formatDate(summary.endDate) })
                  : tx("auto.chooseAPlanBelowTo_eeb1"))}
              </p>
            </div>
          </div>
        )}

        <h3 className="sub_section_title">
          {tl(subscription.isSubscribed ? tx("auto.upgradeYourPlan_d6c6") : tx("auto.chooseYourPlan_c197"))}
        </h3>

        <div className="sub_plans_container">
          {updatedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`sub_plan_card ${plan.cardStyle} ${
                selectedPlan === plan.id ? "selected" : ""
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Plan Header */}
              <div className="sub_plan_header">
                <div className="sub_plan_title_section">
                  <h4 className="sub_plan_name">{tl(plan.name)}</h4>
                  {plan.badge && (
                    <span
                      className="sub_plan_badge"
                      style={{ backgroundColor: plan.badgeColor }}
                    >
                      {tl(plan.badge)}
                    </span>
                  )}
                </div>

                {plan.price && (
                  <div className="sub_plan_pricing">
                    <span className="sub_plan_price">{tl(plan.price)}</span>
                    <span className="sub_plan_period">{tl(plan.period)}</span>
                  </div>
                )}

                <p className="sub_plan_description">{tl(plan.description)}</p>
              </div>

              {/* Plan Features */}
              <div className="sub_plan_features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="sub_plan_feature">
                    <div className="sub_feature_icon">
                      <Check size={14} />
                    </div>
                    <span className="sub_feature_text">{tl(feature)}</span>
                  </div>
                ))}
              </div>

              {/* Plan Button */}
              <div className="sub_plan_button_container">
                <Button
                  variant={plan.buttonDisabled ? "secondary" : "primary"}
                  onClick={() => handleUpgrade(plan)}
                  disabled={plan.buttonDisabled || loading}
                  className="sub_plan_button"
                >
                  {tl(loading ? tx("auto.processing_272b") : plan.buttonText)}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Info */}
        <div className="subscription_info">
          <h4>{tx("auto.subscriptionDetails_fe11")}</h4>
          <ul>
            <li>{tx("auto.payMonthlyOrYearlyAnd_191b")}</li>
            <li>{tx("auto.plansDonTRenewAutomatically_0d66")}</li>
            <li>{tx("auto.cancelAnytime_f8f7")}</li>
            <li>{tx("auto.securePaymentProcessingWithFlutt_cd09")}</li>
            <li>{tx("auto.supportByEmailPhoneAnd_ba1a")}</li>
          </ul>
        </div>
        </>
        ) : (
        /* Payments Tab */
        <div className="sub_payments_tab">
          {paymentsLoading ? (
            <div className="sub_payments_loading">
              <div className="sub_loading_spinner"></div>
              <p>{tx("auto.loadingPaymentHistory_f6a9")}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="sub_no_payments">
              <Receipt size={48} className="sub_no_payments_icon" />
              <h3>{tx("auto.noPaymentsYet_d48f")}</h3>
              <p>{tx("auto.yourPaymentHistoryWillAppear_beb2")}</p>
            </div>
          ) : (
            <div className="sub_payments_list">
              {payments.map((payment, index) => (
                <div key={payment.id || index} className="sub_payment_card">
                  <div className="sub_payment_icon_wrap">
                    {payment.status === "successful" ? (
                      <CheckCircle2 size={20} className="sub_payment_icon success" />
                    ) : (
                      <AlertCircle size={20} className="sub_payment_icon failed" />
                    )}
                  </div>
                  <div className="sub_payment_info">
                    <p className="sub_payment_plan">{tl(payment.plantype || tx("auto.subscription_8fde"))}{" "}{tx("auto.plan_ae2f")}</p>
                    <p className="sub_payment_date">
                      {tl(payment.paidAt ? new Date(payment.paidAt).toLocaleDateString(dateLocale("en-US"), { day: "numeric", month: "short", year: "numeric" }) : tx("auto.nA_08d2"))}
                    </p>
                    {payment.transactionId && (
                      <p className="sub_payment_ref">{tx("auto.ref_e7c5")}{" "}{tl(payment.transactionId)}</p>
                    )}
                  </div>
                  <div className="sub_payment_right">
                    <p className="sub_payment_amount">₦{(payment.planPrice || 0).toLocaleString()}</p>
                    <span className={`sub_payment_status ${payment.status === "successful" ? "success" : "failed"}`}>
                      {tl(payment.status === "successful" ? tx("auto.paid_dc9d") : payment.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="cancel_modal_overlay">
          <div className="cancel_modal" data-theme={actualTheme}>
            <div className="cancel_modal_header">
              <h3>{tx("auto.cancelSubscription_58b2")}</h3>
              <button className="cancel_modal_close" onClick={closeCancelModal}>
                <X size={20} />
              </button>
            </div>

            <div className="cancel_modal_content">
              <p className="cancel_warning">
                ⚠️ <strong>{tx("auto.important_18dd")}</strong>{" "}{tx("auto.cancellingYourSubscriptionWillIm_f868")}{" "}
                <strong>{tx("auto.noRefundsWillBeProcessed_f732")}</strong>
              </p>

              <div className="cancel_form">
                <div className="cancel_form_group">
                  <label htmlFor="cancelReason">
                    {tx("auto.whyDoYouWantTo_64e9")}
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={tx("auto.pleaseTellUsWhyYou_c125")}
                    className="cancel_textarea"
                    rows={4}
                  />
                </div>
              </div>

              <div className="cancel_modal_actions">
                <Button
                  variant="secondary"
                  onClick={closeCancelModal}
                  disabled={loading}
                  className="cancel_confirm_btnn"
                >
                  {tx("auto.keepSubscription_c897")}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  disabled={loading || !cancelReason.trim()}
                  className="cancel_confirm_btn"
                >
                  {tl(loading ? tx("auto.cancelling_f498") : tx("auto.cancelSubscription_58b2"))}
                </Button>
              </div>

              <p className="cancel_disclaimer">
                {tx("auto.byClickingCancelSubscriptionYou_bfd1")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPanel;
