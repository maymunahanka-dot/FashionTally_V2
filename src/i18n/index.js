/**
 * App language (English / French).
 *
 * First visit: the browser's language (French browser → French, anything else → English).
 * After sign-up/login: the account's language, which the backend sets from the country
 * (e.g. Chad, Mali, Senegal → French) and the user can change in Settings → Appearance.
 * The choice is remembered on this device and saved to the account.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];
const STORAGE_KEY = "ft_language";
/** Set when the person picks a language themselves (login / sign-up switch). */
const CHOSEN_KEY = "ft_language_chosen";

/** The language the person picked on this device, or null (sign-up then uses the country). */
export function chosenLanguage() {
  try {
    const v = localStorage.getItem(CHOSEN_KEY);
    return v ? normalize(v) : null;
  } catch {
    return null;
  }
}

const normalize = (value) => (String(value || "").toLowerCase().startsWith("fr") ? "fr" : "en");

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalize(saved);
  } catch {
    // storage blocked: fall through
  }
  return normalize(navigator.language || navigator.languages?.[0]);
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: initialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
  returnEmptyString: false,
});

document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

/**
 * Switch language now and remember it on this device.
 * `saveToAccount`: also store it on the signed-in account (Settings change).
 */
export async function setAppLanguage(language, { saveToAccount = false, chosen = false } = {}) {
  const lng = normalize(language);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    if (chosen) localStorage.setItem(CHOSEN_KEY, lng);
  } catch {
    // ignore
  }
  if (i18n.language !== lng) await i18n.changeLanguage(lng);

  const token = localStorage.getItem("authToken");
  if (saveToAccount && token) {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/language`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: lng }),
      });
    } catch (error) {
      console.warn("Could not save language to account:", error);
    }
  }
}

/**
 * After sign-in: a language picked on the login / sign-up page wins and is saved to the
 * account; otherwise the account's language is used. Call once the auth token is stored.
 */
export function applyAccountLanguage(accountLanguage) {
  const picked = chosenLanguage();
  try {
    localStorage.removeItem(CHOSEN_KEY);
  } catch {
    // ignore
  }
  if (picked) {
    setAppLanguage(picked, { saveToAccount: picked !== normalize(accountLanguage) });
    return picked;
  }
  if (accountLanguage) setAppLanguage(accountLanguage);
  return accountLanguage;
}

export default i18n;

/**
 * Translate outside React hooks (toasts, helpers). Components that show text also
 * call useTranslation() so they re-render when the language changes.
 */
export const t = (...args) => i18n.t(...args);

/**
 * Labels kept in lists (options, statuses, categories…), keyed by their English text.
 * Every translated screen text is reused too, so a label written once is known everywhere.
 */
import phrasesFr from "./locales/phrases.fr.json";

const PHRASES_FR = {};
for (const [key, english] of Object.entries(en.auto || {})) {
  if (fr.auto?.[key]) PHRASES_FR[english] = fr.auto[key];
}
Object.assign(PHRASES_FR, phrasesFr, {
  "All Designs": "Toutes les créations",
  Expense: "Dépense",
  "Low Stock": "Stock faible",
  "Out of Stock": "Rupture de stock",
});

/**
 * Translate text at the moment it's shown, by its English wording. Used for labels
 * that live in lists, so the stored values (compared in code / saved) stay English.
 * Returns the text unchanged in English or when there's no translation.
 */
export function tl(text) {
  if (i18n.language !== "fr" || typeof text !== "string") return text;
  return PHRASES_FR[text] ?? PHRASES_FR[text.trim()] ?? text;
}

/** Locale for showing dates: French when the app is in French, else the given English one. */
export function dateLocale(english) {
  return i18n.language === "fr" ? "fr-FR" : english;
}
