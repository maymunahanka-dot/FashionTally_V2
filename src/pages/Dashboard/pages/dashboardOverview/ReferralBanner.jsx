import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, X, ArrowRight, Copy, Check } from "lucide-react";
import { tl } from "../../../../i18n";

const HIDE_KEY = "ft.referralBanner.hidden";
const DEFAULT_REWARDS = { STARTER: 1000, GROWTH: 2000, PROFESSIONAL: 3000 };
const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

const isHidden = () => {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
};

/** Dashboard home: Refer & Earn promo card with the user's code; the X hides it on this device */
export default function ReferralBanner() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(isHidden);
  const [info, setInfo] = useState(null); // { code, rewards, enabled }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hidden) return undefined;
    let alive = true;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/referral/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    })
      .then((r) => r.json())
      .then((d) => alive && d?.success && setInfo(d.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hidden]);

  if (hidden || info?.enabled === false) return null;

  const rewards = info?.rewards || DEFAULT_REWARDS;
  const top = Math.max(...Object.values(rewards).map(Number));
  const open = () => navigate("/dashboard/settings?panel=referral");

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const copy = async () => {
    if (!info?.code) return;
    try {
      await navigator.clipboard.writeText(info.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      open();
    }
  };

  return (
    <section className="rf-banner" aria-label={tl("Refer & Earn")}>
      <div className="rf-banner-badge" aria-hidden="true">
        <Gift size={22} strokeWidth={1.8} />
      </div>

      <div className="rf-banner-copy">
        <div className="rf-banner-tag">
          <span className="rf-banner-eyebrow">{tl("Growth Partner")}</span>
          <span className="rf-banner-tag-sub">{tl("Refer & Earn")}</span>
        </div>
        <h3 className="rf-banner-title">
          {tl("Earn up to")} <span>{naira(top)}</span> {tl("for every designer you bring")}
        </h3>
        <p className="rf-banner-sub">{tl("Share your code. When they subscribe, we pay you straight to your bank account.")}</p>
        <ul className="rf-banner-chips" aria-label={tl("Rewards per plan")}>
          {["STARTER", "GROWTH", "PROFESSIONAL"].map((p) => (
            <li key={p}>
              <b>{naira(rewards[p])}</b> {tl(p.charAt(0) + p.slice(1).toLowerCase())}
            </li>
          ))}
        </ul>
      </div>

      <div className="rf-banner-actions">
        {info?.code && (
          <button type="button" className="rf-banner-code" onClick={copy} title={tl("Copy your code")}>
            <span>{info.code}</span>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        )}
        <button type="button" className="rf-banner-cta" onClick={open}>
          {info?.code ? tl("Share & track") : tl("Get my code")} <ArrowRight size={16} />
        </button>
      </div>

      <button type="button" className="rf-banner-close" onClick={hide} aria-label={tl("Hide")}>
        <X size={16} />
      </button>
    </section>
  );
}
