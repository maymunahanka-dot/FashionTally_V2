import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import { findUserDoc } from "../../lib/subscription-check";
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
  const { user, refreshUserData, loading: authLoading } = useNewAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Wait until auth is done loading and not already processed
    if (authLoading || processed) return;

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

          if (user?.email) {
            try {
              const userDoc = await findUserDoc(user.email, user.uid);
              if (userDoc) {
                const userRef = doc(db, "fashiontally_users", userDoc.id);
                await updateDoc(userRef, {
                  isSubscribed: true,
                  subscriptionType: "paid",
                  planType: planName,
                  subscriptionEndDate: subscriptionEndDate,
                  isTrialActive: false,
                  payment_amount: SUBSCRIPTION_PRICING[planName.toLowerCase()]?.monthly || 0,
                  payment_date: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  txRef: txRef || "",
                  transactionId: transactionId || "",
                });
                console.log("✅ Firestore subscription updated successfully");
                await refreshUserData();
              } else {
                console.error("❌ User document not found in Firestore");
              }
            } catch (err) {
              console.error("❌ Failed to update Firestore:", err);
            }
          } else {
            console.error("❌ No user found after auth loaded");
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
  }, [authLoading, processed, searchParams, navigate, user]);

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
