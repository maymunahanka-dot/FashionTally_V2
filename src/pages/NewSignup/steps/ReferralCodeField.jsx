import { useEffect, useState } from "react";
import Input from "../../../components/Input";
import { checkReferralCode, normalizeCode } from "../../../utils/referral";
import { tl } from "../../../i18n";

/**
 * Optional "Referral code" box at sign-up. Same look as the other sign-up fields (shared Input);
 * filled in from a referral link and checked as you type.
 */
export default function ReferralCodeField({ value, onChange }) {
  const [check, setCheck] = useState({ state: "idle" });
  const code = normalizeCode(value);

  useEffect(() => {
    if (!code) return undefined;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const r = await checkReferralCode(code);
        if (alive) setCheck(r.valid ? { state: "ok", name: r.name, code } : { state: "bad", code });
      } catch {
        if (alive) setCheck({ state: "idle" });
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [code]);

  const shown = code && check.code === code ? check.state : "idle";

  return (
    <div className="n_s_u_referral">
      <Input
        type="text"
        label=""
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s+/g, ""))}
        placeholder={tl("Referral code (optional)")}
        error={shown === "bad" ? tl("We couldn't find this code. Check it, or leave it empty.") : ""}
        active={!!value}
        maxLength={16}
        autoComplete="off"
        id="referral-code"
      />
      {shown === "ok" && (
        <p className="n_s_u_referral-ok">
          {tl("Referred by")} {check.name} ✓
        </p>
      )}
    </div>
  );
}
