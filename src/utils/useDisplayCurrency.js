import { useContext, useEffect, useState } from "react";
import NewAuthContext from "../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "./teamUtils";
import { getUsdToNgnRate } from "./exchangeRate";

const API = import.meta.env.VITE_BACKEND_URL;
let currencyCache = null;
let currencyRequest = null;

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
          const currency = data?.data?.inventoryCurrency === "USD" ? "USD" : "NGN";
          currencyCache = { email, currency, at: Date.now() };
          return currency;
        }),
    };
  }

  return currencyRequest.promise;
}

export function toNaira(entered, currency, usdToNgn) {
  const value = parseFloat(entered);
  const amount = Number.isFinite(value) ? value : 0;
  if (currency !== "USD") return amount;
  if (!usdToNgn) {
    throw new Error("Exchange rate is still loading. Try again in a moment.");
  }
  return Math.round(amount * usdToNgn * 100) / 100;
}

export function fromNaira(stored, currency, usdToNgn) {
  const naira = Number(stored);
  if (!Number.isFinite(naira)) return "";
  if (currency === "USD") {
    if (!usdToNgn) return "";
    return (naira / usdToNgn).toFixed(2);
  }
  return String(naira);
}

export function formatEntryAmount(amount, currency) {
  const num = Number(amount) || 0;
  if (currency === "USD") {
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `₦${num.toLocaleString()}`;
}

export function useDisplayCurrency() {
  const { user } = useContext(NewAuthContext);
  const [currency, setCurrency] = useState("NGN");
  const [usdToNgn, setUsdToNgn] = useState(null);

  useEffect(() => {
    const email = getEffectiveUserEmail(user);
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      try {
        const next = await loadBrandCurrency(email);
        if (cancelled) return;
        setCurrency(next);
        setUsdToNgn(await getUsdToNgnRate());
      } catch (error) {
        console.error("Error loading currency:", error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    currency,
    usdToNgn,
    showDollars: currency === "USD" && !!usdToNgn,
    symbol: currency === "USD" ? "$" : "₦",
    toNaira: (value) => toNaira(value, currency, usdToNgn),
    fromNaira: (value) => fromNaira(value, currency, usdToNgn),
  };
}
