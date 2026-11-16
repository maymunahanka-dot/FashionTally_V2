import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  Shield,
  Clock,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
} from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { initiateFlutterwavePayment } from "../../lib/flutterwave";
import { initiatePaystackPayment, paystackEnabled } from "../../lib/paystack";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./Subscription.css";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


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
  {
    name: "CUSTOM",
    description: "For large brands with custom operational needs",
    badge: "Enterprise",
    badgeColor: "enterprise-badge",
    features: [
      "Unlimited Users",
      "White Label",
      "API Integrations",
      "Enterprise Workflow",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function SubscriptionPage() {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan") || "growth";
  const selectedPlan =
    pricingPlans.find(
      (plan) => plan.name.toLowerCase() === planParam.toLowerCase()
    ) || pricingPlans[1];
  const [billingCycle, setBillingCycle] = useState(
    searchParams.get("cycle") === "yearly" ? "yearly" : "monthly"
  );
  const isYearly = billingCycle === "yearly";
  const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;

  const { user } = useNewAuth();
  const { actualTheme } = useTheme();
  const [step] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phoneNumber: "",
    businessName: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [gateway, setGateway] = useState("flutterwave");
  // Paystack shows once its public key is set (always in local dev)
  const showPaystack = paystackEnabled() || import.meta.env.DEV;

  // Simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!paymentForm.firstName.trim())
      newErrors.firstName = tx("auto.firstNameIsRequired_df38");
    if (!paymentForm.lastName.trim())
      newErrors.lastName = tx("auto.lastNameIsRequired_b1d9");
    if (!paymentForm.email.trim()) newErrors.email = tx("auto.emailIsRequired_4da1");
    else if (!/\S+@\S+\.\S+/.test(paymentForm.email))
      newErrors.email = tx("auto.emailIsInvalid_fe7d");
    if (!paymentForm.phoneNumber.trim())
      newErrors.phoneNumber = tx("auto.phoneNumberIsRequired_f845");
    else if (!/^(\+234|0)[789]\d{9}$/.test(paymentForm.phoneNumber))
      newErrors.phoneNumber = tx("auto.invalidNigerianPhoneNumber_8c4f");
    if (!paymentForm.businessName.trim())
      newErrors.businessName = tx("auto.businessNameIsRequired_b048");
    if (!paymentForm.address.trim()) newErrors.address = tx("auto.addressIsRequired_34bb");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiatePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const paymentData = {
        email:     paymentForm.email,
        name:      paymentForm.firstName,
        phone:     paymentForm.phoneNumber,
        plantype:  selectedPlan.name,
        planPrice: price,
        billingCycle,
        userId:    user?.uid,
      };

      // Opens the chosen gateway's popup; it redirects to /subscription/callback itself
      localStorage.setItem("pending_plan",    selectedPlan.name);
      localStorage.setItem("pending_cycle",   billingCycle);
      localStorage.setItem("payment_gateway", gateway);
      const result =
        gateway === "paystack"
          ? await initiatePaystackPayment(paymentData)
          : await initiateFlutterwavePayment(paymentData);
      if (!result.success && result.message) {
        // Only show error if it wasn't just the user closing the modal
        if (result.message !== "Payment window closed") {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(error.message || tx("auto.failedToInitiatePaymentPlease_9159"));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Show loading state
  if (pageLoading) {
    return (
      <div className="subscription-loading" data-theme={actualTheme}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">{tx("auto.loadingSubscriptionPlans_c2ab")}</h2>
          <p className="loading-message">
            {tx("auto.pleaseWaitWhileWePrepare_a7c5")}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="subscription-error" data-theme={actualTheme}>
        <div className="error-content">
          <h1>{tx("auto.planNotFound_f949")}</h1>
          <p>{tx("auto.theRequestedSubscriptionPlanCoul_002c")}</p>
          <Button onClick={() => navigate("/subscription")}>
            {tx("auto.viewAvailablePlans_b14f")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page" data-theme={actualTheme}>
      {/* Header */}
      <div className="subscription-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>{tx("auto.back_b52b")}</span>
          </button>
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span className="step-label">{tx("auto.details_dc3d")}</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span className="step-label">{tx("auto.payment_b41a")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-content">
        <div className="content-grid">
          {/* Plan Summary */}
          <div className="plan-summary">
            <div className="summary-card">
              <div className="summary-header">
                <div className="plan-info">
                  <h2 className="plan-name">{tl(selectedPlan.name)}</h2>
                  <div className={`plan-badge ${selectedPlan.badgeColor}`}>
                    {tl(selectedPlan.badge)}
                  </div>
                </div>
                <div className="plan-pricing">
                  <div className="billing-cycle-toggle" role="group" aria-label="Billing period">
                    <button
                      type="button"
                      className={`billing-cycle-btn ${!isYearly ? "active" : ""}`}
                      aria-pressed={!isYearly}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      {tx("auto.monthly_d31e")}
                    </button>
                    <button
                      type="button"
                      className={`billing-cycle-btn ${isYearly ? "active" : ""}`}
                      aria-pressed={isYearly}
                      onClick={() => setBillingCycle("yearly")}
                    >
                      {tx("auto.yearly_7622")}{" "}<span className="billing-cycle-save">{tx("auto.2MonthsFree_e093")}</span>
                    </button>
                  </div>
                  <div className="price">
                    <span className="amount">{tl(formatCurrency(price))}</span>
                    <span className="period">/{tl(isYearly ? "year" : "month")}</span>
                  </div>
                  <p className="plan-description">{tl(selectedPlan.description)}</p>
                </div>
              </div>
              <div className="summary-content">
                <div className="features-section">
                  <h4 className="features-title">{tx("auto.whatSIncluded_fd5c")}</h4>
                  <ul className="features-list">
                    {selectedPlan.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="feature-item">
                        <Check className="check-icon" />
                        <span>{tl(feature)}</span>
                      </li>
                    ))}
                    {selectedPlan.features.length > 6 && (
                      <li className="more-features">
                        +{selectedPlan.features.length - 6}{" "}{tx("auto.moreFeatures_2175")}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="security-info">
                  <div className="security-item">
                    <Shield className="security-icon" />
                    <span>{tx("auto.securePaymentProcessing_2896")}</span>
                  </div>
                  <div className="security-item">
                    <Clock className="security-icon" />
                    <span>{tx("auto.cancelAnytime_ceec")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {loading && (
              <div className="payment-loading-overlay" data-theme={actualTheme}>
                <div className="payment-loading-content">
                  <div className="payment-loading-spinner"></div>
                  <h3 className="payment-loading-title">
                    {tx("auto.processingPayment_d29b")}
                  </h3>
                  <p className="payment-loading-message">
                    {tx("auto.pleaseWaitWhileWeRedirect_2c85")}
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">{tx("auto.accountInformation_0cbd")}</h2>
                  <p className="form-description">
                    {tx("auto.pleaseProvideYourDetailsTo_34aa")}
                  </p>
                </div>
                <div className="form-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        <User className="label-icon" />
                        {tx("auto.firstName_b6ea")}
                      </label>
                      <Input
                        id="firstName"
                        value={paymentForm.firstName}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            firstName: e.target.value,
                          })
                        }
                        className={errors.firstName ? "error" : ""}
                      />
                      {errors.firstName && (
                        <p className="error-message">{tl(errors.firstName)}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        {tx("auto.lastName_863c")}
                      </label>
                      <Input
                        id="lastName"
                        value={paymentForm.lastName}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            lastName: e.target.value,
                          })
                        }
                        className={errors.lastName ? "error" : ""}
                      />
                      {errors.lastName && (
                        <p className="error-message">{tl(errors.lastName)}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <Mail className="label-icon" />
                      {tx("auto.emailAddress_09ba")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={paymentForm.email}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          email: e.target.value,
                        })
                      }
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <p className="error-message">{tl(errors.email)}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">
                      <Phone className="label-icon" />
                      {tx("auto.phoneNumber_ab25")}
                    </label>
                    <Input
                      id="phoneNumber"
                      placeholder={tx("auto.eG08069354904_1fc1")}
                      value={paymentForm.phoneNumber}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className={errors.phoneNumber ? "error" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="error-message">{tl(errors.phoneNumber)}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">
                      <Building className="label-icon" />
                      {tx("auto.businessName_4fee")}
                    </label>
                    <Input
                      id="businessName"
                      value={paymentForm.businessName}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          businessName: e.target.value,
                        })
                      }
                      className={errors.businessName ? "error" : ""}
                    />
                    {errors.businessName && (
                      <p className="error-message">{tl(errors.businessName)}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      <MapPin className="label-icon" />
                      {tx("auto.businessAddress_6a24")}
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      className={`form-textarea ${
                        errors.address ? "error" : ""
                      }`}
                      value={paymentForm.address}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          address: e.target.value,
                        })
                      }
                    />
                    {errors.address && (
                      <p className="error-message">{tl(errors.address)}</p>
                    )}
                  </div>

                  {showPaystack && (
                    <div className="form-group">
                      <span className="form-label">{tx("auto.payWith_86b6")}</span>
                      <div className="gateway-options" role="radiogroup" aria-label="Payment provider">
                        {[
                          { key: "flutterwave", name: "Flutterwave", hint: "Card, bank transfer or USSD" },
                          { key: "paystack", name: "Paystack", hint: "Card, bank, USSD or transfer" },
                        ].map((g) => (
                          <button
                            type="button"
                            key={g.key}
                            role="radio"
                            aria-checked={gateway === g.key}
                            className={`gateway-option ${gateway === g.key ? "selected" : ""}`}
                            onClick={() => setGateway(g.key)}
                          >
                            <span className="gateway-dot" aria-hidden="true" />
                            <span>
                              <strong>{tl(g.name)}</strong>
                              <small>{tl(g.hint)}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <Button
                      onClick={handleInitiatePayment}
                      disabled={loading}
                      className="continue-button"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          {tx("auto.initiatingPayment_7482")}
                        </>
                      ) : (
                        <>
                          {tx("auto.continueToPayment_cfc5")}
                          <ArrowRight className="button-icon" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
