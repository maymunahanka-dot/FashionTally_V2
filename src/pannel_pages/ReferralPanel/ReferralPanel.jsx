import { useCallback, useEffect, useState } from "react";
import { X, Copy, Check, Share2, MessageCircle, Gift, Landmark, Clock, Wallet } from "lucide-react";
import { tl } from "../../i18n";
import "./ReferralPanel.css";

/**
 * Settings → Refer & Earn: your code and link, sharing, numbers, rewards, bank details and payouts.
 * Rewards are paid manually by the FashionTally team by bank transfer (no wallet).
 */
const API = `${import.meta.env.VITE_BACKEND_URL}/api/referral`;
const call = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `Request failed (${res.status})`);
  return data.data;
};

const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const day = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const planName = (p) => (p ? p.charAt(0) + p.slice(1).toLowerCase() : "");

const REWARD_LABEL = {
  pending: "Pending",
  eligible: "Ready",
  paid: "Paid out",
  reversed: "Reversed",
  review: "Being checked",
};
const PAYOUT_LABEL = { requested: "Requested", approved: "Approved", paid: "Paid", rejected: "Not approved" };

function CopyButton({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rp-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          window.prompt(tl("Copy this:"), text);
        }
      }}
    >
      {done ? <Check size={15} /> : <Copy size={15} />} {done ? tl("Copied") : label}
    </button>
  );
}

export default function ReferralPanel({ onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const [bank, setBank] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await call("/me"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    call("/me")
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const shareText = data
    ? `${tl("I use FashionTally to run my fashion business. Sign up with my referral code")} ${data.code}: ${data.link}`
    : "";

  const saveBank = async (e) => {
    e.preventDefault();
    setBusy("bank");
    setNote(null);
    try {
      await call("/bank", { method: "PUT", body: JSON.stringify(bank) });
      setBankOpen(false);
      setNote({ ok: true, text: tl("Bank details saved.") });
      await load();
    } catch (err) {
      setNote({ ok: false, text: err.message });
    } finally {
      setBusy("");
    }
  };

  const requestPayout = async () => {
    if (!window.confirm(`${tl("Request a payout of")} ${naira(data.money.available)} ${tl("to your bank account ending")} ${data.bank?.accountNumberEnd}?`)) return;
    setBusy("payout");
    setNote(null);
    try {
      await call("/payout", { method: "POST" });
      setNote({ ok: true, text: tl("Payout requested. Our team will review it and send the money to your bank account.") });
      await load();
    } catch (err) {
      setNote({ ok: false, text: err.message });
    } finally {
      setBusy("");
    }
  };

  const openPayout = data?.payouts?.find((p) => p.status === "requested" || p.status === "approved");
  const progress = data ? Math.min(100, (data.money.available / (data.minPayout || 1)) * 100) : 0;

  return (
    <div className="rp-panel">
      <div className="rp-header">
        <button className="rp-close" onClick={onClose} type="button" aria-label={tl("Close")}>
          <X size={20} />
        </button>
        <h2 className="rp-title">{tl("Growth Partner")}</h2>
      </div>

      <div className="rp-body">
        {error && !data ? (
          <div className="rp-note is-error">
            {tl("Couldn't load Refer & Earn.")} {error}{" "}
            <button type="button" className="rp-link" onClick={load}>{tl("Try again")}</button>
          </div>
        ) : !data ? (
          <p className="rp-muted">{tl("Loading…")}</p>
        ) : (
          <>
            {!data.enabled && <div className="rp-note">{tl("Refer & Earn is paused right now. Your rewards are safe.")}</div>}
            {data.suspended && <div className="rp-note is-error">{tl("Your referral account is on hold. Please contact support.")}</div>}

            {/* Hero */}
            <section className="rp-hero">
              <Gift size={22} />
              <h3>{tl("Earn cash for every designer you bring")}</h3>
              <p>{tl("When someone signs up with your code and pays for two months in a row (or one year), you earn:")}</p>
              <div className="rp-rewards">
                {["STARTER", "GROWTH", "PROFESSIONAL"].map((p) => (
                  <div key={p}>
                    <b>{naira(data.rewards?.[p])}</b>
                    <span>{planName(p)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Code and link */}
            <section className="rp-card">
              <span className="rp-label">{tl("Your referral code")}</span>
              <div className="rp-code-row">
                <span className="rp-code">{data.code}</span>
                <CopyButton text={data.code} label={tl("Copy code")} />
              </div>
              <span className="rp-label">{tl("Your link (fills in the code on the website)")}</span>
              <div className="rp-link-row">
                <span className="rp-linktext">{data.link}</span>
                <CopyButton text={data.link} label={tl("Copy link")} />
              </div>
              <div className="rp-share">
                <a className="rp-share-btn is-wa" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a className="rp-share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.link)}`} target="_blank" rel="noreferrer">
                  Facebook
                </a>
                <a className="rp-share-btn" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                  X
                </a>
                {typeof navigator !== "undefined" && navigator.share && (
                  <button type="button" className="rp-share-btn" onClick={() => navigator.share({ title: "FashionTally", text: shareText }).catch(() => {})}>
                    <Share2 size={16} /> {tl("More")}
                  </button>
                )}
              </div>
              <p className="rp-muted rp-small">{tl("Friends using the mobile app can type your code when they sign up.")}</p>
            </section>

            {/* Numbers */}
            <section className="rp-stats">
              <div><b>{data.stats.clicks}</b><span>{tl("Link clicks")}</span></div>
              <div><b>{data.stats.signups}</b><span>{tl("Sign-ups")}</span></div>
              <div><b>{data.stats.paid}</b><span>{tl("Subscribed")}</span></div>
              <div><b>{data.stats.waitingToPay}</b><span>{tl("Not subscribed yet")}</span></div>
            </section>

            {/* Money */}
            <section className="rp-card">
              <div className="rp-money-main">
                <Wallet size={20} />
                <div>
                  <span className="rp-label">{tl("Ready to withdraw")}</span>
                  <b className="rp-big">{naira(data.money.available)}</b>
                </div>
              </div>
              <div className="rp-meter" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
              <p className="rp-muted rp-small">
                {data.money.available >= data.minPayout
                  ? tl("You can request a payout.")
                  : `${naira(Math.max(0, data.minPayout - data.money.available))} ${tl("more to reach the")} ${naira(data.minPayout)} ${tl("minimum payout.")}`}
              </p>
              <div className="rp-money-grid">
                <div><Clock size={14} /> {tl("Pending")} <b>{naira(data.money.pending)}</b></div>
                <div>{tl("In a payout")} <b>{naira(data.money.inPayout)}</b></div>
                <div>{tl("Total earned")} <b>{naira(data.money.earned)}</b></div>
                <div>{tl("Paid to you")} <b>{naira(data.money.paidOut)}</b></div>
              </div>
              <p className="rp-muted rp-small">
                {tl("New rewards wait")} {data.holdDays} {tl("days after the payment before they're ready.")}
              </p>
            </section>

            {/* Bank + payout */}
            <section className="rp-card">
              <div className="rp-bank-head">
                <span className="rp-label"><Landmark size={14} /> {tl("Bank details for payouts")}</span>
                {!bankOpen && (
                  <button type="button" className="rp-link" onClick={() => setBankOpen(true)}>
                    {data.bank ? tl("Change") : tl("Add")}
                  </button>
                )}
              </div>
              {!bankOpen && data.bank && (
                <p className="rp-bank">
                  {data.bank.bankName} · ****{data.bank.accountNumberEnd}
                  <br />
                  <span className="rp-muted">{data.bank.accountName}</span>
                </p>
              )}
              {!bankOpen && !data.bank && <p className="rp-muted rp-small">{tl("Add your bank account so we can pay you.")}</p>}
              {bankOpen && (
                <form className="rp-bank-form" onSubmit={saveBank}>
                  <input placeholder={tl("Bank name")} value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} required />
                  <input
                    placeholder={tl("Account number (10 digits)")}
                    inputMode="numeric"
                    maxLength={10}
                    value={bank.accountNumber}
                    onChange={(e) => setBank({ ...bank, accountNumber: e.target.value.replace(/\D/g, "") })}
                    required
                  />
                  <input placeholder={tl("Account name")} value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} required />
                  <div className="rp-row">
                    <button type="submit" className="rp-btn" disabled={busy === "bank"}>{busy === "bank" ? tl("Saving…") : tl("Save bank details")}</button>
                    <button type="button" className="rp-link" onClick={() => setBankOpen(false)}>{tl("Cancel")}</button>
                  </div>
                </form>
              )}

              {openPayout ? (
                <div className="rp-note">
                  {tl("Payout of")} {naira(openPayout.amount)}: <b>{tl(PAYOUT_LABEL[openPayout.status])}</b>. {tl("We'll let you know when it's sent.")}
                </div>
              ) : (
                <button type="button" className="rp-btn rp-btn-wide" onClick={requestPayout} disabled={!data.canRequestPayout || !data.bank || busy === "payout"}>
                  {busy === "payout" ? tl("Requesting…") : `${tl("Request payout")} ${data.money.available >= data.minPayout ? naira(data.money.available) : ""}`}
                </button>
              )}
              {note && <div className={`rp-note ${note.ok ? "is-ok" : "is-error"}`}>{note.text}</div>}
            </section>

            {/* Referrals */}
            <section className="rp-card">
              <span className="rp-label">{tl("Your referrals")}</span>
              {!data.referrals.length ? (
                <p className="rp-muted rp-small">{tl("No one has signed up with your code yet. Share it to get started!")}</p>
              ) : (
                <ul className="rp-list">
                  {data.referrals.map((r) => (
                    <li key={r.id}>
                      <div>
                        <b>{r.name}</b>
                        <span className="rp-muted">
                          {tl("Joined")} {day(r.joinedAt)}
                          {r.status === "paid" ? ` · ${planName(r.plan)}` : ""}
                        </span>
                      </div>
                      {r.status === "paid" ? (
                        <span className={`rp-pill is-${r.rewardStatus}`}>
                          {naira(r.reward)} · {tl(REWARD_LABEL[r.rewardStatus] || r.rewardStatus)}
                        </span>
                      ) : r.status === "first_payment" ? (
                        <span className="rp-pill is-pending">{tl("Paid 1 of 2 months")}</span>
                      ) : r.status === "registered" ? (
                        <span className="rp-pill">{tl("Not subscribed yet")}</span>
                      ) : (
                        <span className="rp-pill is-reversed">{tl("Not eligible")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Payout history */}
            {data.payouts.length > 0 && (
              <section className="rp-card">
                <span className="rp-label">{tl("Payout history")}</span>
                <ul className="rp-list">
                  {data.payouts.map((p) => (
                    <li key={p.id}>
                      <div>
                        <b>{naira(p.amount)}</b>
                        <span className="rp-muted">
                          {tl("Requested")} {day(p.requestedAt)}
                          {p.paidAt ? ` · ${tl("paid")} ${day(p.paidAt)}` : ""}
                          {p.reference ? ` · ${tl("ref")} ${p.reference}` : ""}
                          {p.rejectReason ? ` · ${p.rejectReason}` : ""}
                        </span>
                      </div>
                      <span className={`rp-pill is-${p.status}`}>{tl(PAYOUT_LABEL[p.status])}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="rp-muted rp-small rp-rules">
              {tl("Rules: rewards are for new FashionTally customers only, once per customer, after they pay for two months in a row (or one year). Renewals, refunds and self-referrals don't count. Payouts are made by bank transfer by the FashionTally team.")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
