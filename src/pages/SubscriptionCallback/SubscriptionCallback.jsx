import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing";
import Button from "../../components/button/Button";
import "./SubscriptionCallback.css";

// Derive plan type from tx_ref: "subscription-{userId}-{timestamp}"
// Plan is stored in localStorage before redirect so we can retrieve it here
function getPlanFromStorage() {
  return localStorage.getItem("pending_plan") || "GROWTH";
}

function getPlanType(planName) {
  const map = {
    STARTER: "STARTER",
    GROWTH: "GROWTH",
    PROFESSIONAL: "PROFESSIONAL",
  };
  return map[planName?.toUpperCase()] || "GROWTH";
}

const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actualTheme } = useTheme();
  const { refreshUserData, loading: authLoading } = useNewAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [processed, setProcessed] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (authLoading || hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      setProcessed(true);
      try {
        const txRef = searchParams.get("tx_ref");
        const paymentStatus = searchParams.get("status");
        const transactionId = searchParams.get("transaction_id");

        console.log("Payment callback received:", { txRef, paymentStatus, transactionId });

        if (paymentStatus === "successful" || paymentStatus === "success") {
          const planName = getPlanType(getPlanFromStorage());
          const subscriptionEndDate = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();

          const token = localStorage.getItem("authToken");
          if (token) {
            try {
              // Step 1: Create payment record
              await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/create`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    plantype: planName,
                    planPrice: SUBSCRIPTION_PRICING[planName.toLowerCase()]?.monthly || 0,
                    status: "successful",
                    gateway: "flutterwave",
                    transactionId: txRef || "",
                    providerTransactionId: transactionId || "",
                    paidAt: new Date().toISOString(),
                  }),
                }
              );

              // Step 2: Update user subscription
              const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/edit`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    isSubscribed: true,
                    subscriptionType: "paid",
                    planType: planName,
                    subscriptionEndDate,
                    isTrialActive: false,
                    payment_amount: SUBSCRIPTION_PRICING[planName.toLowerCase()]?.monthly || 0,
                    payment_date: new Date().toISOString(),
                    txRef: txRef || "",
                    transactionId: transactionId || "",
                  }),
                }
              );
              const data = await res.json();
              if (data.success) {
                console.log("✅ MongoDB subscription updated successfully");
                refreshUserData && await refreshUserData();
              } else {
                console.error("❌ Failed to update subscription:", data.error);
              }
            } catch (err) {
              console.error("❌ Failed to update subscription:", err);
            }
          } else {
            console.error("❌ No auth token found");
          }

          localStorage.removeItem("pending_plan");
          setStatus("success");
          setMessage("Payment successful! Your subscription has been activated.");

          setTimeout(() => navigate("/dashboard"), 3000);

        } else if (paymentStatus === "cancelled" || paymentStatus === "failed") {
          setStatus("failed");
          setMessage("Payment was cancelled or failed. Please try again.");
        } else {
          setStatus("failed");
          setMessage("Payment status unknown. Please contact support.");
        }
      } catch (error) {
        console.error("Error handling payment callback:", error);
        setStatus("failed");
        setMessage("An error occurred while processing your payment.");
      }
    };

    handleCallback();
  }, [authLoading, processed, searchParams, navigate]);

  const handleRetry = () => {
    navigate("/subscription");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="subscription-callback" data-theme={actualTheme}>
      <div className="callback-container">
        <div className="callback-content">
          {status === "loading" && (
            <>
              <div className="callback-icon loading">
                <Loader className="spinner" />
              </div>
              <h1 className="callback-title">Processing Payment...</h1>
              <p className="callback-message">
                Please wait while we confirm your payment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="callback-icon success">
                <CheckCircle />
              </div>
              <h1 className="callback-title">Payment Successful!</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleGoToDashboard} variant="primary">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="callback-icon failed">
                <XCircle />
              </div>
              <h1 className="callback-title">Payment Failed</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleRetry} variant="primary">
                  Try Again
                </Button>
                <Button onClick={handleGoToDashboard} variant="secondary">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCallback;
