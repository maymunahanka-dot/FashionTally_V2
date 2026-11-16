import { useContext, useEffect, useState } from "react";
import NewAuthContext from "../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "./teamUtils";
import { currencySymbol, getNgnPerUnit } from "./exchangeRate";

const API = import.meta.env.VITE_BACKEND_URL;
let currencyCache = null;
let currencyRequest = null;

const normalizeCurrency = (value) => {
  const code = String(value || "").toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "NGN";
};

async function loadBrandCurrency(email) {
  if (
    currencyCache &&
    currencyCache.email === email &&
    Date.now() - currencyCache.at < 60 * 1000
  ) {
    return currencyCache.currency;
  }

  if (!currencyRequest || currencyRequest.email !== email) {
    currencyRequest = {
      email,
      promise: fetch(
        `${API}/api/brand-setting/get-by-email/${encodeURIComponent(email)}`
      )
        .then((res) => res.json())
        .then((data) => {
          const currency = normalizeCurrency(data?.data?.inventoryCurrency);
          currencyCache = { email, currency, at: Date.now() };
          return currency;
        }),
    };
  }

  return currencyRequest.promise;
}

/** Call after the Brand settings currency changes so screens pick it up straight away. */
export function clearCurrencyCache() {
  currencyCache = null;
  currencyRequest = null;
}

/** Entered amount (in the display currency) → Naira to save. */
function toNaira(entered, currency, rate) {
  const value = parseFloat(entered);
  const amount = Number.isFinite(value) ? value : 0;
  if (currency === "NGN") return amount;
  if (!rate) {
    throw new Error("Exchange rate is still loading. Try again in a moment.");
  }
  return Math.round(amount * rate * 100) / 100;
}

/** Saved Naira → amount in the display currency, for editing. */
function fromNaira(stored, currency, rate) {
  const naira = Number(stored);
  if (!Number.isFinite(naira)) return "";
  if (currency !== "NGN") {
    if (!rate) return "";
    return (naira / rate).toFixed(2);
  }
  return String(naira);
}

/**
 * The business's display currency and its rate.
 * `usdToNgn` (name kept for older code) = Naira per 1 unit of the display currency,
 * so `naira / usdToNgn` converts to it and `amount * usdToNgn` converts back.
 */
export function useDisplayCurrency() {
  const { user } = useContext(NewAuthContext);
  const [currency, setCurrency] = useState("NGN");
  const [rate, setRate] = useState(null);
  const [rateFailed, setRateFailed] = useState(false); // no rate: show Naira instead of waiting

  useEffect(() => {
    const email = getEffectiveUserEmail(user);
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      try {
        const next = await loadBrandCurrency(email);
        if (cancelled) return;
        setCurrency(next);
        // Naira is shown with a dollar hint underneath, so load the dollar rate for it
        const nextRate = await getNgnPerUnit(next === "NGN" ? "USD" : next);
        if (!cancelled) {
          setRate(nextRate);
          setRateFailed(false);
        }
      } catch (error) {
        if (!cancelled) setRateFailed(true);
        console.warn("Exchange rate unavailable, showing Naira:", error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isForeign = currency !== "NGN";
  return {
    currency,
    /** Currency of the small secondary line: the display currency, or $ for Naira businesses. */
    secondaryCurrency: isForeign ? currency : "USD",
    usdToNgn: rate,
    ngnPerUnit: rate,
    rateFailed,
    isForeign,
    showDollars: isForeign && !!rate, // name kept: true when showing a non-Naira currency
    symbol: currencySymbol(currency),
    toNaira: (value) => toNaira(value, currency, rate),
    fromNaira: (value) => fromNaira(value, currency, rate),
  };
}
