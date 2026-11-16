import { formatForeign, formatMoney } from "../../utils/exchangeRate";
import { useDisplayCurrency } from "../../utils/useDisplayCurrency";
import "./MoneyAmount.css";

import { tl } from "../../i18n";
import { useTranslation } from "react-i18next";
/**
 * A saved (Naira) amount, shown only in the business's Brand currency.
 * Naira businesses see ₦; others see their currency at today's rate.
 */
export function MoneyAmount({ amount, className = "", prefix = "", align = "start" }) {
  useTranslation(); // re-render when the language changes
  const { isForeign, currency, ngnPerUnit, rateFailed } = useDisplayCurrency();
  const text =
    isForeign && ngnPerUnit
      ? formatForeign(amount, ngnPerUnit, currency)
      : isForeign && !rateFailed
        ? "…" // rate still loading: don't flash the wrong currency
        : formatMoney(amount, "NGN");

  return (
    <span className={`money_amount ${align === "end" ? "is_end" : ""} ${className}`}>
      <span className="money_amount_primary">
        {tl(prefix)}
        {tl(text)}
      </span>
    </span>
  );
}

/** Kept so existing forms still import it; amounts are shown only in the Brand currency now. */
export function CurrencyHint() {
  return null;
}
