// Cash on Rails payment integration for subscription management
import { SUBSCRIPTION_PRICING } from "../config/subscriptionPricing.js";

/**
 * Initialize Cash on Rails payment - Main function used by subscription page
 * @param {Object} paymentData - Payment configuration
 * @returns {Promise} Payment initialization result
 */
export async function initiatePayment(paymentData) {
  try {
    const { email, name, phone, plantype, planPrice, userId } = paymentData;

    console.log("🚀 Initiating Cash on Rails payment:", paymentData);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(`${backendUrl}/api/payment-cor/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, phone, plantype, planPrice, userId }),
    });

    const data = await response.json();
    console.log("💳 Payment-cor response:", data);

    if (response.ok && data.success) {
      const paymentLink      = data.data?.paymentLink;
      const transactionReference = data.data?.transactionRef;

      if (!paymentLink) {
        throw new Error("Provider failed to generate payment link");
      }

      console.log("✅ Payment link generated:", transactionReference);
      return { success: true, paymentLink, txRef: transactionReference, data: data.data };
    }

    throw new Error(data.error || "Payment initiation failed");

  } catch (error) {
    console.error("❌ Cash on Rails payment error:", error);
    return { success: false, message: error.message || "Payment initiation failed" };
  }
}

/**
 * Initialize Cash on Rails payment (legacy function)
 * @param {Object} config - Payment configuration
 * @returns {Promise} Payment initialization result
 */
export async function initiateCashOnRailsPayment(config) {
  const { email, name, phone, plantype, planPrice, userId } = config;

  try {
    // This would typically call your backend API
    // For now, we'll simulate the Cash on Rails integration
    const response = await fetch("/api/payment-cor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        phone,
        plantype,
        planPrice,
        userId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        paymentLink: data.data.paymentLink,
        message: data.message,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to initiate payment",
      };
    }
  } catch (error) {
    console.error("Cash on Rails payment error:", error);
    return {
      success: false,
      error: error.message || "Payment initialization failed",
    };
  }
}

/**
 * Mock Cash on Rails payment for development
 * @param {Object} config - Payment configuration
 * @returns {Promise} Mock payment result
 */
export async function mockCashOnRailsPayment(config) {
  console.log("Mock Cash on Rails payment initiated:", config);

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate mock payment link
  const mockPaymentLink = `https://checkout.cashonrails.com/pay/${Date.now()}`;

  return {
    success: true,
    paymentLink: mockPaymentLink,
    message: "Payment link generated successfully",
  };
}

/**
 * Format payment amount for display
 * @param {number} amount - Amount in kobo/cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currency = "NGN") {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Get plan pricing information
 * @param {string} planName - Plan name (starter, growth, professional)
 * @returns {Object} Plan pricing details
 */
export function getPlanDetails(planName) {
  const plans = {
    starter: {
      name: "STARTER",
      price: SUBSCRIPTION_PRICING.starter.monthly,
      description: "Best for solo designers",
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
    },
    growth: {
      name: "GROWTH",
      price: SUBSCRIPTION_PRICING.growth.monthly,
      description: "Ideal for growing fashion brands",
      features: [
        "Up to 3 Users",
        "All Starter features",
        "Design Management",
        "Notifications",
        "Calendar Sync",
        "Enhanced CRM",
      ],
    },
    professional: {
      name: "PROFESSIONAL",
      price: SUBSCRIPTION_PRICING.professional.monthly,
      description: "Best for studios with structured teams",
      features: [
        "Up to 10 Users",
        "All Growth features",
        "Full Workflow Access",
        "Priority Notifications",
        "Priority Support",
      ],
    },
  };

  return plans[planName.toLowerCase()] || plans.growth;
}

/**
 * Validate payment form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
export function validatePaymentForm(formData) {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email is invalid";
  }

  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Invalid Nigerian phone number";
  }

  if (!formData.businessName?.trim()) {
    errors.businessName = "Business name is required";
  }

  if (!formData.address?.trim()) {
    errors.address = "Address is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generate transaction reference
 * @param {string} firstName - User's first name
 * @returns {string} Transaction reference
 */
export function generateTxRef(firstName) {
  return `${firstName.toLowerCase()}-${Date.now()}`;
}

/**
 * Handle successful payment
 * @param {Object} paymentData - Payment response data
 * @param {Object} userInfo - User information
 * @returns {Promise} Subscription activation result
 */
export async function handlePaymentSuccess(paymentData, userInfo) {
  try {
    // This would typically call your backend to verify payment and activate subscription
    console.log("Payment successful:", paymentData);
    console.log("User info:", userInfo);

    // For demo purposes, we'll simulate subscription activation
    // In production, this would be handled by your backend webhook

    return {
      success: true,
      message: "Subscription activated successfully",
      subscriptionData: {
        planType: userInfo.planType,
        subscriptionType: "paid",
        subscriptionEndDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days
        isSubscribed: true,
        isTrialActive: false,
      },
    };
  } catch (error) {
    console.error("Error handling payment success:", error);
    return {
      success: false,
      error: error.message || "Failed to activate subscription",
    };
  }
}

/**
 * Check payment status
 * @param {string} txRef - Transaction reference
 * @returns {Promise} Payment status result
 */
export async function checkPaymentStatus(txRef) {
  try {
    const response = await fetch(`/api/check-payment-status?tx_ref=${txRef}`);
    const data = await response.json();

    return {
      success: response.ok,
      status: data.status,
      paymentStatus: data.payment_status,
      data: data,
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    return {
      success: false,
      error: error.message || "Failed to check payment status",
    };
  }
}
