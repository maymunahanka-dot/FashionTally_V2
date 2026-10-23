import { formatDollars } from "../../utils/exchangeRate";
import { useDisplayCurrency } from "../../utils/useDisplayCurrency";
import "./MoneyAmount.css";

export function MoneyAmount({ amount, className = "", prefix = "", align = "start" }) {
  const { showDollars, usdToNgn } = useDisplayCurrency();
  const naira = `${prefix}₦${(Number(amount) || 0).toLocaleString()}`;

  if (!usdToNgn) {
    return <span className={className}>{naira}</span>;
  }

  const dollars = `${prefix}${formatDollars(amount, usdToNgn)}`;

  return (
    <span className={`money_amount ${align === "end" ? "is_end" : ""} ${className}`}>
      <span className="money_amount_primary">{showDollars ? dollars : naira}</span>
      <span className="money_amount_secondary">{showDollars ? naira : dollars}</span>
    </span>
  );
}

export function CurrencyHint({ currency, usdToNgn, amount }) {
  if (currency !== "USD") return null;
  const entered = parseFloat(amount) || 0;
  return (
    <p className="money_rate_hint">
      {usdToNgn
        ? `$1 = ₦${usdToNgn.toLocaleString()} · saves as ₦${(entered * usdToNgn).toLocaleString()}`
        : "Loading the dollar exchange rate..."}
    </p>
  );
}
