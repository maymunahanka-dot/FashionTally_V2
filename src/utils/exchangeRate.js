const API = import.meta.env.VITE_BACKEND_URL;

let cachedRate = null;

export async function getUsdToNgnRate() {
  if (cachedRate && Date.now() - cachedRate.at < 30 * 60 * 1000) {
    return cachedRate.rate;
  }

  const res = await fetch(`${API}/api/brand-setting/exchange-rate`);
  const data = await res.json();
  if (!data.success || !data.usdToNgn) {
    throw new Error(data.error || "Exchange rate unavailable");
  }

  cachedRate = { rate: Number(data.usdToNgn), at: Date.now() };
  return cachedRate.rate;
}

export function formatDollars(nairaAmount, usdToNgn) {
  const amount = Number(nairaAmount);
  if (!usdToNgn || !Number.isFinite(amount)) return "";
  return `$${(amount / usdToNgn).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
