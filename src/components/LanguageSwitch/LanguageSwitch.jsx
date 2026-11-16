/**
 * Language select (flag + name) shown at the top of the login and sign-up pages, so people
 * can pick their language before they have an account. The choice is remembered on
 * this device (and sent to the account at sign-up through the saved language).
 */
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setAppLanguage } from "../../i18n";
import "./LanguageSwitch.css";

/** Small SVG flag (flag emojis don't show on Windows browsers). */
export function Flag({ code, width = 22, height = 16, className = "" }) {
  const id = useId().replace(/:/g, "");
  const common = {
    width,
    height,
    className: `lang-flag ${className}`,
    preserveAspectRatio: "xMidYMid slice",
    "aria-hidden": true,
    focusable: "false",
  };
  if (code === "fr") {
    return (
      <svg {...common} viewBox="0 0 3 2">
        <rect width="1" height="2" x="0" fill="#002654" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#CE1126" />
      </svg>
    );
  }
  // English: United Kingdom
  return (
    <svg {...common} viewBox="0 0 60 30">
      <clipPath id={`${id}s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

/** `saveToAccount`: signed-in pages also store the choice on the account. */
export default function LanguageSwitch({ className = "", saveToAccount = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language === "fr" ? "fr" : "en";
  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code) => {
    setOpen(false);
    if (code !== current) setAppLanguage(code, saveToAccount ? { saveToAccount: true } : { chosen: true });
  };

  return (
    <div ref={rootRef} className={`lang-select ${open ? "is-open" : ""} ${className}`}>
      <button
        type="button"
        className="lang-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Language / Langue: ${currentLang.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Flag code={currentLang.code} />
        <span className="lang-select-label">{currentLang.label}</span>
        <ChevronDown size={15} className="lang-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="lang-select-menu" role="listbox" id={listId} aria-label="Language / Langue">
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={current === lang.code}
                className={`lang-select-option ${current === lang.code ? "is-active" : ""}`}
                onClick={() => pick(lang.code)}
              >
                <Flag code={lang.code} />
                <span>{lang.label}</span>
                {current === lang.code && <Check size={15} className="lang-select-check" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
