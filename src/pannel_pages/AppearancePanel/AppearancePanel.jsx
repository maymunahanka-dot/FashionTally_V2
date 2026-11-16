import { ArrowLeft, Sun, Moon, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/button/Button";
import { useTheme } from "../../contexts/ThemeContext";
import { LANGUAGES, setAppLanguage } from "../../i18n";
import { Flag } from "../../components/LanguageSwitch/LanguageSwitch.jsx";
import "./AppearancePanel.css";

import { tl } from "../../i18n";
const AppearancePanel = ({ onClose }) => {
  const { theme, changeTheme, getCurrentTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  const handleSaveSettings = () => {
    // Theme and language are already saved when picked
    onClose();
  };

  return (
    <div className="app_panel">
      {/* Header */}
      <div className="app_header">
        <button className="app_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="app_header_content">
          <h2 className="app_title">{t("appearance.title")}</h2>
          <p className="app_subtitle">{t("appearance.subtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="app_content">
        {/* Theme Section */}
        <div className="app_section">
          <h3 className="app_section_title">{t("appearance.theme")}</h3>

          <div className="app_theme_options">
            <div
              className={`app_theme_card ${
                theme === "light" ? "app_theme_selected" : ""
              }`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="app_theme_icon">
                <Sun size={24} />
              </div>
              <span className="app_theme_label">{t("appearance.light")}</span>
            </div>

            <div
              className={`app_theme_card ${
                theme === "dark" ? "app_theme_selected" : ""
              }`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="app_theme_icon">
                <Moon size={24} />
              </div>
              <span className="app_theme_label">{t("appearance.dark")}</span>
            </div>

            <div
              className={`app_theme_card ${
                theme === "system" ? "app_theme_selected" : ""
              }`}
              onClick={() => handleThemeChange("system")}
            >
              <div className="app_theme_icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <span className="app_theme_label">{t("appearance.system")}</span>
            </div>
          </div>

          <div className="app_theme_info">
            <p className="app_theme_description">
              {t("appearance.themeInfo")}
              {theme === "system" && (
                <span> {t("appearance.followingSystem", { theme: getCurrentTheme() })}</span>
              )}
            </p>
          </div>
        </div>

        {/* Language Section */}
        <div className="app_section">
          <h3 className="app_section_title">{t("appearance.language")}</h3>
          <div className="app_theme_options app_language_options">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className={`app_theme_card ${i18n.language === lang.code ? "app_theme_selected" : ""}`}
                onClick={() => setAppLanguage(lang.code, { saveToAccount: true })}
                role="radio"
                aria-checked={i18n.language === lang.code}
              >
                <div className="app_theme_icon">
                  <span className="app_language_flag">
                    <Flag code={lang.code} width={34} height={24} />
                    {i18n.language === lang.code && <Check size={13} className="app_language_check" />}
                  </span>
                </div>
                <span className="app_theme_label">{tl(lang.label)}</span>
              </div>
            ))}
          </div>
          <div className="app_theme_info">
            <p className="app_theme_description">{t("appearance.languageInfo")}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="app_footer">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          className="app_save_btn"
        >
          {t("appearance.save")}
        </Button>
      </div>
    </div>
  );
};

export default AppearancePanel;
