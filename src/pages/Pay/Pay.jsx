/**
 * /pay?t=<token>
 *
 * Opened from the mobile app in an in-app browser. The token tells us who is
 * paying, so there is no login: the user picks a plan, pays with Flutterwave,
 * and goes back to the app. Flutterwave returns to this same page with
 * tx_ref / transaction_id, and we confirm the payment the same way the web
 * subscription page does.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CircleAlert, CircleCheck, Clock3, LoaderCircle, Lock, Smartphone } from "lucide-react";
import logo from "../../assets/Image/logog.png";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing";
import { initiateFlutterwavePayment } from "../../lib/flutterwave";
import { PLANS } from "../Home/plans.js";
import "../Home/Landing.css";

const API = import.meta.env.VITE_BACKEND_URL;
const APP_RETURN_URL = "fashiontally://payment-complete";
const PAY_PLANS = PLANS.filter((p) => SUBSCRIPTION_PRICING[p.key]);
const PENDING_KEYS = [
  "pending_plan",
  "pending_cycle",
  "payment_gateway",
  "pending_tx_ref",
  "pending_transaction_id",
  "pending_payment_status",
];
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

function statusLine(sub) {
  if (!sub) return "";
  const plan = sub.plan ? `${sub.plan[0]}${sub.plan.slice(1).toLowerCase()}` : "";
  if (sub.status === "active") return `Your ${plan} plan is active until ${fmtDate(sub.endDate)}.`;
  if (sub.status === "trial") return `You're on the free trial (${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left).`;
  if (sub.status === "trial_ended") return "Your free trial has ended.";
  return "Your plan has ended.";
}

export default function Pay() {
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const txRef = params.get("tx_ref") || "";
  const transactionId = params.get("transaction_id") || "";
  const returnStatus = params.get("status") || "";
  const isReturn = Boolean(txRef || transactionId);

  const [stage, setStage] = useState(isReturn ? "confirming" : "loading"); // loading | choose | paying | confirming | success | pending | failed | expired
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [chosen, setChosen] = useState("growth");
  const ran = useRef(false);

  const yearlySaving = useMemo(
    () => Math.round((1 - SUBSCRIPTION_PRICING.growth.yearly / (SUBSCRIPTION_PRICING.growth.monthly * 12)) * 100),
    [],
  );

  useEffect(() => {
    document.title = "Choose your plan · FashionTally";
  }, []);

  // Load who is paying, or confirm a payment Flutterwave just returned from.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const loadUser = async () => {
      if (!token) {
        setStage("expired");
        setMessage("This page needs a payment link from the FashionTally app.");
        return null;
      }
      try {
        const res = await fetch(`${API}/api/pay-link/${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setStage("expired");
          setMessage(data.error || "This payment link has expired. Go back to the app and tap “Choose a plan & pay” again.");
          return null;
        }
        setUser(data.data);
        const current = String(data.data.subscription?.plan || "").toLowerCase();
        if (SUBSCRIPTION_PRICING[current]) setChosen(current);
        if (data.data.subscription?.billingCycle === "yearly") setCycle("yearly");
        return data.data;
      } catch {
        setStage("failed");
        setMessage("We couldn't reach FashionTally. Check your connection and try again.");
        return null;
      }
    };

    const confirmPayment = async () => {
      if (/cancel|fail/i.test(returnStatus)) {
        PENDING_KEYS.forEach((k) => localStorage.removeItem(k));
        const u = await loadUser();
        if (u) {
          setStage("choose");
          setMessage("The payment was cancelled. You can choose a plan and try again.");
        }
        return;
      }
      setMessage("Confirming your payment…");
      try {
        const planType = String(localStorage.getItem("pending_plan") || "GROWTH").toUpperCase();
        const billingCycle = localStorage.getItem("pending_cycle") === "yearly" ? "yearly" : "monthly";
        const res = await fetch(`${API}/api/payment/flutterwave/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, txRef, planType, billingCycle, status: returnStatus }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setStage("failed");
          setMessage(data.error || data.message || "We couldn't confirm this payment yet. Contact support with your receipt.");
          return;
        }
        PENDING_KEYS.forEach((k) => localStorage.removeItem(k));
        if (!data.pending) {
          setStage("success");
          return;
        }
        // Bank transfers can take a moment: wait for Flutterwave's webhook to activate the plan.
        const query = new URLSearchParams(transactionId ? { transactionId } : { txRef });
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        while (Date.now() < deadline) {
          await sleep(POLL_INTERVAL_MS);
          const check = await fetch(`${API}/api/payment/flutterwave/status?${query}`)
            .then((r) => r.json())
            .catch(() => ({}));
          if (check.activated) {
            setStage("success");
            return;
          }
        }
        setStage("pending");
      } catch {
        setStage("failed");
        setMessage("We couldn't confirm this payment. If you were charged, your plan will activate automatically.");
      }
    };

    if (isReturn) confirmPayment();
    else loadUser().then((u) => u && setStage("choose"));
  }, [token, isReturn, returnStatus, transactionId, txRef]);

  const pay = async () => {
    const price = SUBSCRIPTION_PRICING[chosen]?.[cycle];
    if (!user || !price) return;
    setStage("paying");
    setMessage("");
    const plantype = chosen.toUpperCase();
    localStorage.setItem("pending_plan", plantype);
    localStorage.setItem("pending_cycle", cycle);
    const result = await initiateFlutterwavePayment({
      email: user.email,
      name: user.name,
      phone: user.phone,
      plantype,
      planPrice: price,
      billingCycle: cycle,
      userId: user.uid,
      callbackPath: `/pay?t=${encodeURIComponent(token)}`,
    });
    // On success Flutterwave takes over and brings the user back here.
    if (!result.success) {
      setStage("choose");
      if (result.message && result.message !== "Payment window closed") setMessage(result.message);
    }
  };

  const plan = PAY_PLANS.find((p) => p.key === chosen);
  const price = SUBSCRIPTION_PRICING[chosen]?.[cycle];

  return (
    <div className="lx lx-pay">
      <header className="lx-pay-top">
        <img src={logo} alt="" />
        <span>FashionTally</span>
        <small>
          <Lock size={13} /> Secure checkout
        </small>
      </header>

      <main className="lx-pay-main">
        {(stage === "loading" || stage === "confirming") && (
          <div className="lx-pay-state">
            <LoaderCircle size={34} className="lx-spin" />
            <p>{stage === "loading" ? "Getting your account ready…" : message}</p>
          </div>
        )}

        {stage === "expired" && (
          <div className="lx-pay-state">
            <Clock3 size={34} />
            <h1>Link expired</h1>
            <p>{message}</p>
            <a className="lx-btn lx-btn-light" href={APP_RETURN_URL}>
              <Smartphone size={16} /> Back to the app
            </a>
          </div>
        )}

        {stage === "success" && (
          <div className="lx-pay-state is-ok">
            <CircleCheck size={40} />
            <h1>You're all set!</h1>
            <p>Your payment was successful and your plan is now active. We've emailed your receipt.</p>
            <a className="lx-btn lx-btn-accent" href={APP_RETURN_URL}>
              <Smartphone size={16} /> Back to the app
            </a>
          </div>
        )}

        {stage === "pending" && (
          <div className="lx-pay-state">
            <Clock3 size={36} />
            <h1>Almost there</h1>
            <p>
              Your payment is still being confirmed. Bank transfers can take a few minutes. Your plan will activate
              automatically and we'll email your receipt.
            </p>
            <a className="lx-btn lx-btn-light" href={APP_RETURN_URL}>
              <Smartphone size={16} /> Back to the app
            </a>
          </div>
        )}

        {stage === "failed" && (
          <div className="lx-pay-state is-error">
            <CircleAlert size={36} />
            <h1>Something went wrong</h1>
            <p>{message}</p>
            <a className="lx-btn lx-btn-light" href={APP_RETURN_URL}>
              <Smartphone size={16} /> Back to the app
            </a>
          </div>
        )}

        {(stage === "choose" || stage === "paying") && user && (
          <>
            <section className="lx-pay-head">
              <p className="lx-tag">CHOOSE YOUR PLAN</p>
              <h1>Hi {firstName(user.name)}, pick a plan.</h1>
              <p className="lx-pay-who">
                Paying for <b>{user.businessName || user.name}</b> · {user.email}
              </p>
              <p className="lx-pay-current">{statusLine(user.subscription)}</p>
            </section>

            <div className="lx-toggle lx-pay-toggle" role="tablist" aria-label="Billing cycle">
              <span className={`lx-toggle-pill ${cycle === "yearly" ? "is-right" : ""}`} aria-hidden="true" />
              <button
                type="button"
                role="tab"
                aria-selected={cycle === "monthly"}
                className={cycle === "monthly" ? "is-active" : ""}
                onClick={() => setCycle("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={cycle === "yearly"}
                className={cycle === "yearly" ? "is-active" : ""}
                onClick={() => setCycle("yearly")}
              >
                Yearly <em>Save {yearlySaving}%</em>
              </button>
            </div>

            <div className="lx-pay-plans" role="radiogroup" aria-label="Plans">
              {PAY_PLANS.map((p) => {
                const amount = SUBSCRIPTION_PRICING[p.key][cycle];
                const selected = p.key === chosen;
                return (
                  <button
                    type="button"
                    key={p.key}
                    role="radio"
                    aria-checked={selected}
                    className={`lx-pay-plan ${selected ? "is-selected" : ""}`}
                    onClick={() => setChosen(p.key)}
                  >
                    <span className="lx-pay-radio" aria-hidden="true">
                      {selected && <Check size={14} />}
                    </span>
                    <span className="lx-pay-plan-body">
                      <span className="lx-pay-plan-name">
                        {p.name}
                        {p.popular && <em>Most popular</em>}
                      </span>
                      <span className="lx-pay-plan-blurb">{p.blurb}</span>
                      {selected && (
                        <span className="lx-pay-plan-features">
                          {p.features.map((f) => (
                            <span key={f}>
                              <Check size={13} /> {f}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span className="lx-pay-plan-price">
                      <b>₦{amount.toLocaleString()}</b>
                      <small>/{cycle === "monthly" ? "month" : "year"}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            {message && (
              <p className="lx-form-status is-error" role="status">
                <CircleAlert size={18} /> {message}
              </p>
            )}

            <div className="lx-pay-bar">
              <div>
                <small>{plan?.name} · {cycle === "monthly" ? "Monthly" : "Yearly"}</small>
                <b>₦{price?.toLocaleString()}</b>
              </div>
              <button type="button" className="lx-btn lx-btn-accent" onClick={pay} disabled={stage === "paying"}>
                {stage === "paying" ? (
                  <>
                    <LoaderCircle size={17} className="lx-spin" /> Opening checkout…
                  </>
                ) : (
                  <>Pay ₦{price?.toLocaleString()}</>
                )}
              </button>
            </div>
            <p className="lx-pay-note">
              <Lock size={12} /> Paid securely with Flutterwave (card, bank transfer or USSD). Your plan doesn't renew
              automatically.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
