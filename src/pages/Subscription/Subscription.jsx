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
import { initiatePayment } from "../../lib/cash-on-rails";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./Subscription.css";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan") || "growth";
  const selectedPlan =
    pricingPlans.find(
      (plan) => plan.name.toLowerCase() === planParam.toLowerCase()
    ) || pricingPlans[1];

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
      newErrors.firstName = "First name is required";
    if (!paymentForm.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!paymentForm.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(paymentForm.email))
      newErrors.email = "Email is invalid";
    if (!paymentForm.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^(\+234|0)[789]\d{9}$/.test(paymentForm.phoneNumber))
      newErrors.phoneNumber = "Invalid Nigerian phone number";
    if (!paymentForm.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!paymentForm.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiatePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await initiatePayment({
        email: paymentForm.email,
        name: paymentForm.firstName,
        phone: paymentForm.phoneNumber,
        plantype: selectedPlan.name,
        planPrice: selectedPlan.monthlyPrice,
        userId: user?.uid,
      });

      if (result.success) {
        // Save plan name so callback page can use it
        localStorage.setItem("pending_plan", selectedPlan.name);
        // Redirect to Cash on Rails payment page
        window.location.href = result.paymentLink;
      } else {
        throw new Error(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(error.message || "Failed to initiate payment. Please try again.");
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
          <h2 className="loading-title">Loading Subscription Plans...</h2>
          <p className="loading-message">
            Please wait while we prepare your subscription options.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="subscription-error" data-theme={actualTheme}>
        <div className="error-content">
          <h1>Plan Not Found</h1>
          <p>The requested subscription plan could not be found.</p>
          <Button onClick={() => navigate("/subscription")}>
            View Available Plans
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
            <span>Back</span>
          </button>
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span className="step-label">Details</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span className="step-label">Payment</span>
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
                  <h2 className="plan-name">{selectedPlan.name}</h2>
                  <div className={`plan-badge ${selectedPlan.badgeColor}`}>
                    {selectedPlan.badge}
                  </div>
                </div>
                <div className="plan-pricing">
                  <div className="price">
                    <span className="amount">
                      {formatCurrency(selectedPlan.monthlyPrice)}
                    </span>
                    <span className="period">/month</span>
                  </div>
                  <p className="plan-description">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="summary-content">
                <div className="features-section">
                  <h4 className="features-title">What's included:</h4>
                  <ul className="features-list">
                    {selectedPlan.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="feature-item">
                        <Check className="check-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {selectedPlan.features.length > 6 && (
                      <li className="more-features">
                        +{selectedPlan.features.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="security-info">
                  <div className="security-item">
                    <Shield className="security-icon" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="security-item">
                    <Clock className="security-icon" />
                    <span>Cancel anytime</span>
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
                    Processing Payment...
                  </h3>
                  <p className="payment-loading-message">
                    Please wait while we redirect you to the payment gateway.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">Account Information</h2>
                  <p className="form-description">
                    Please provide your details to set up your subscription
                  </p>
                </div>
                <div className="form-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        <User className="label-icon" />
                        First Name
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
                        <p className="error-message">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        Last Name
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
                        <p className="error-message">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <Mail className="label-icon" />
                      Email Address
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
                      <p className="error-message">{errors.email}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">
                      <Phone className="label-icon" />
                      Phone Number
                    </label>
                    <Input
                      id="phoneNumber"
                      placeholder="e.g., 08069354904"
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
                      <p className="error-message">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">
                      <Building className="label-icon" />
                      Business Name
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
                      <p className="error-message">{errors.businessName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      <MapPin className="label-icon" />
                      Business Address
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
                      <p className="error-message">{errors.address}</p>
                    )}
                  </div>

                  <div className="form-actions">
                    <Button
                      onClick={handleInitiatePayment}
                      disabled={loading}
                      className="continue-button"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Initiating Payment...
                        </>
                      ) : (
                        <>
                          Continue to Payment
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
