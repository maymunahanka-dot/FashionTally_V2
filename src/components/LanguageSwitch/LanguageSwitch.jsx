/**
 * English / Français switch shown at the top of the login and sign-up pages, so people
 * can pick their language before they have an account. The choice is remembered on
 * this device (and sent to the account at sign-up through the saved language).
 */
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setAppLanguage } from "../../i18n";
import "./LanguageSwitch.css";

/** `saveToAccount`: signed-in pages also store the choice on the account. */
export default function LanguageSwitch({ className = "", saveToAccount = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language === "fr" ? "fr" : "en";

  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language / Langue">
      <Globe size={15} className="lang-switch-icon" aria-hidden="true" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`lang-switch-btn ${current === lang.code ? "is-active" : ""}`}
          aria-pressed={current === lang.code}
          onClick={() => setAppLanguage(lang.code, saveToAccount ? { saveToAccount: true } : { chosen: true })}
          title={lang.label}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
