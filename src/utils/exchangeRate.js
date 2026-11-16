/**
 * Exchange rates and money formatting.
 *
 * Amounts are always SAVED in Naira. Each business picks a display currency
 * (Brand settings, any ISO code like USD, CNY, GBP). Screens convert Naira to it
 * with live rates from the backend (refreshed hourly, cached here for 30 min).
 */
const API = import.meta.env.VITE_BACKEND_URL;

let cache = null; // { rates: { NGN, USD, CNY, ... per 1 USD }, usdToNgn, at }
let request = null;

/** Same free source the backend uses; only called when the backend doesn't send all rates. */
async function fetchPublicRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return data?.rates?.NGN ? data.rates : null;
  } catch {
    return null;
  }
}

/** All rates, as units of each currency per 1 USD. */
export async function getRates() {
  if (cache && Date.now() - cache.at < 30 * 60 * 1000) return cache.rates;
  if (!request) {
    request = fetch(`${API}/api/brand-setting/exchange-rate`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.rates?.NGN) return data.rates;
        // Older backends only send usdToNgn: get the other currencies directly
        const publicRates = await fetchPublicRates();
        if (publicRates) return publicRates;
        if (data.success && data.usdToNgn) return { USD: 1, NGN: Number(data.usdToNgn) };
        throw new Error(data.error || "Exchange rate unavailable");
      })
      .catch(async (error) => {
        const publicRates = await fetchPublicRates();
        if (publicRates) return publicRates;
        throw error;
      })
      .then((rates) => {
        cache = { rates, usdToNgn: Number(rates.NGN), at: Date.now() };
        return rates;
      })
      .finally(() => {
        request = null;
      });
  }
  return request;
}

/** How many Naira one unit of `currency` is worth (₦ per 1 ¥, ₦ per 1 $, …). 1 for NGN. */
export async function getNgnPerUnit(currency = "NGN") {
  if (!currency || currency === "NGN") return 1;
  const rates = await getRates();
  const ngn = Number(rates.NGN);
  const unit = Number(rates[currency]);
  if (!ngn || !unit) throw new Error(`No exchange rate for ${currency}`);
  return ngn / unit;
}

export async function getUsdToNgnRate() {
  return getNgnPerUnit("USD");
}

/** "¥230.50", "$12.00", "₦50,000" — symbol, separators and decimals per currency. */
export function formatMoney(amount, currency = "NGN") {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: currency === "NGN" ? 0 : undefined,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toLocaleString()}`;
  }
}

/** A saved Naira amount shown in another currency. */
export function formatForeign(nairaAmount, ngnPerUnit, currency) {
  const amount = Number(nairaAmount);
  if (!ngnPerUnit || !Number.isFinite(amount)) return "";
  return formatMoney(amount / ngnPerUnit, currency);
}

/**
 * Short form for stats and charts: ₦1.2M, ¥5.4K, $820.
 * `nairaAmount` is a saved Naira amount; it's converted when `currency` isn't NGN.
 */
export function formatCompactMoney(nairaAmount, currency = "NGN", ngnPerUnit = 1) {
  const naira = Number(nairaAmount);
  if (!Number.isFinite(naira)) return formatMoney(0, currency);
  const value = currency === "NGN" || !ngnPerUnit ? naira : naira / ngnPerUnit;
  const shown = currency !== "NGN" && !ngnPerUnit ? "NGN" : currency;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: shown,
      currencyDisplay: "narrowSymbol",
      notation: Math.abs(value) >= 1000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : shown === "NGN" ? 0 : 2,
    }).format(value);
  } catch {
    return formatMoney(value, shown);
  }
}

/** Kept for older callers: Naira shown in dollars. */
export function formatDollars(nairaAmount, usdToNgn) {
  return formatForeign(nairaAmount, usdToNgn, "USD");
}

/** Just the symbol for a currency, e.g. "¥", "$", "₦", "CHF". */
export function currencySymbol(currency = "NGN") {
  try {
    const part = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value || currency;
  } catch {
    return currency;
  }
}

/** Every currency the browser knows, with a readable name, for pickers. Naira and Dollar first. */
export function currencyOptions() {
  let codes = ["NGN", "USD", "EUR", "GBP", "CNY", "GHS", "KES", "ZAR", "XOF", "XAF", "CAD", "AED", "INR", "JPY"];
  try {
    if (Intl.supportedValuesOf) codes = Intl.supportedValuesOf("currency");
  } catch {
    // keep the short list
  }
  let names = null;
  try {
    names = new Intl.DisplayNames(["en"], { type: "currency" });
  } catch {
    names = null;
  }
  const list = codes.map((code) => ({
    code,
    label: `${names?.of(code) || code} (${currencySymbol(code)}) · ${code}`,
  }));
  const pinned = ["NGN", "USD"];
  return [
    ...pinned.map((c) => list.find((o) => o.code === c)).filter(Boolean),
    ...list.filter((o) => !pinned.includes(o.code)).sort((a, b) => a.label.localeCompare(b.label)),
  ];
}
