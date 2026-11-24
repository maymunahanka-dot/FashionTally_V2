/**
 * Refer & Earn on the website.
 * A link like /signup?ref=FT-MAY123 (any page works) remembers the code for 30 days in this
 * browser, so it's filled in at sign-up even if they look around first. The first code
 * clicked wins (later links don't replace it while it's still valid).
 */
const KEY = "ft.referral";
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
const API = () => `${import.meta.env.VITE_BACKEND_URL}/api/referral`;

export const normalizeCode = (code) => String(code || "").trim().toUpperCase().replace(/\s+/g, "");

export const getStoredReferral = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved?.code && Date.now() - saved.at < DAYS_30) return saved.code;
  } catch {
    /* storage blocked or bad value */
  }
  return "";
};

/** Reads ?ref= from the current address; call once when the site loads */
export const captureReferralFromUrl = () => {
  try {
    const code = normalizeCode(new URLSearchParams(window.location.search).get("ref"));
    if (!code || !/^FT-[A-Z0-9]{4,12}$/.test(code)) return;
    if (!getStoredReferral()) localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
    fetch(`${API()}/click`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }).catch(() => {});
  } catch {
    /* never break the page for this */
  }
};

/** { valid, name } for a code, e.g. to show "Referred by Adunni Styles" */
export const checkReferralCode = async (code) => {
  const c = normalizeCode(code);
  if (!c) return { valid: false };
  const res = await fetch(`${API()}/check/${encodeURIComponent(c)}`);
  const data = await res.json().catch(() => ({}));
  return data?.data || { valid: false };
};

export const clearStoredReferral = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
