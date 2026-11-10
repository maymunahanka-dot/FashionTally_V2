import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Clock } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNewAuth } from "../../contexts/NewAuthContext";
import Button from "../../components/button/Button";
import "./SubscriptionCallback.css";

function getPlanFromStorage() {
  return localStorage.getItem("pending_plan") || "GROWTH";
}

function getPlanType(planName) {
  const map = {
    STARTER: "STARTER",
    GROWTH: "GROWTH",
    PROFESSIONAL: "PROFESSIONAL",
  };
  return map[String(planName || "").toUpperCase()] || "GROWTH";
}

function planFromTxRef(txRef) {
  const parts = String(txRef || "").split("-");
  const maybe = String(parts[parts.length - 2] || "").toUpperCase();
  return getPlanType(maybe);
}

function isFailedStatus(status) {
  return /cancel|fail/i.test(String(status || ""));
}

const PENDING_KEYS = ["pending_plan", "pending_cycle", "payment_gateway", "pending_tx_ref", "pending_transaction_id", "pending_payment_status"];
const clearPendingPayment = () => PENDING_KEYS.forEach((key) => localStorage.removeItem(key));

// While Flutterwave confirms a payment (e.g. bank transfer), check every 5s for up to 2 minutes
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actualTheme } = useTheme();
  const { refreshUserData, loading: authLoading } = useNewAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (authLoading || hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const txRef =
          searchParams.get("tx_ref") || localStorage.getItem("pending_tx_ref") || "";
        const paymentStatus =
          searchParams.get("status") || localStorage.getItem("pending_payment_status") || "";
        const transactionId =
          searchParams.get("transaction_id") ||
          localStorage.getItem("pending_transaction_id") ||
          "";

        console.log("Payment callback received:", { txRef, paymentStatus, transactionId });

        if (!transactionId && !txRef) {
          setStatus("failed");
          setMessage(
            isFailedStatus(paymentStatus)
              ? "Payment was cancelled or failed. Please try again."
              : "Missing transaction details from Flutterwave."
          );
          return;
        }

        const planType =
          getPlanType(getPlanFromStorage()) || planFromTxRef(txRef) || "GROWTH";

        const token = localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        setMessage("Saving your payment…");

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/payment/flutterwave/verify`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            transactionId,
            txRef,
            planType,
            billingCycle: localStorage.getItem("pending_cycle") === "yearly" ? "yearly" : "monthly",
            // The real status from Flutterwave — the backend confirms the payment itself
            status: paymentStatus,
          }),
        });
        const raw = await res.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          setStatus("failed");
          setMessage(
            `Backend at ${backendUrl} did not accept the payment route (HTTP ${res.status}). Restart the Fashiontally_Backend server and try Check again.`
          );
          return;
        }
        console.log("Callback verify response:", res.status, data);

        const showSuccess = async (alreadyProcessed) => {
          clearPendingPayment();
          if (refreshUserData) await refreshUserData();
          setStatus("success");
          setMessage(
            alreadyProcessed
              ? "Payment already saved. Your subscription is ready."
              : "Payment successful! Your subscription has been activated."
          );
          setTimeout(() => navigate("/dashboard"), 2500);
        };

        if (!res.ok || !data.success) {
          clearPendingPayment();
          setStatus("failed");
          setMessage(
            data.error ||
              data.message ||
              "Could not save your payment yet. Tap Check again, or contact support with your receipt."
          );
          return;
        }

        if (!data.pending) {
          await showSuccess(data.alreadyProcessed);
          return;
        }

        // Flutterwave hasn't confirmed it yet — wait for the webhook to activate the plan.
        // The pending details stay saved so "Check again" can pick up where this left off.
        setMessage(data.message || "Confirming your payment with Flutterwave…");
        const query = new URLSearchParams(transactionId ? { transactionId } : { txRef });
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        while (Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          const check = await fetch(`${backendUrl}/api/payment/flutterwave/status?${query}`)
            .then((r) => r.json())
            .catch(() => ({}));
          if (check.activated) {
            await showSuccess(false);
            return;
          }
        }
        setStatus("pending");
        setMessage(
          "Your payment is still being confirmed. Bank transfers can take a few minutes. Your plan will activate automatically and we'll email your receipt. You can check again or go to your dashboard."
        );
      } catch (error) {
        console.error("Error handling payment callback:", error);
        setStatus("failed");
        setMessage(error.message || "An error occurred while processing your payment.");
      }
    };

    handleCallback();
  }, [authLoading, searchParams, navigate, refreshUserData]);

  const handleRetry = () => {
    window.location.reload();
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
                {message || "Please wait while we save your payment."}
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

          {status === "pending" && (
            <>
              <div className="callback-icon loading">
                <Clock />
              </div>
              <h1 className="callback-title">Payment still processing</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleRetry} variant="primary">
                  Check again
                </Button>
                <Button onClick={handleGoToDashboard} variant="secondary">
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
              <h1 className="callback-title">Payment not confirmed</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleRetry} variant="primary">
                  Check again
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
