import { ArrowLeft, Sun, Moon } from "lucide-react";
import Button from "../../components/button/Button";
import { useTheme } from "../../contexts/ThemeContext";
import "./AppearancePanel.css";

const AppearancePanel = ({ onClose }) => {
  const { theme, changeTheme, getCurrentTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  const handleSaveSettings = () => {
    // Theme settings are already saved automatically
    console.log("Settings saved - Theme:", theme);
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
          <h2 className="app_title">Appearance</h2>
          <p className="app_subtitle">Customize your experience</p>
        </div>
      </div>

      {/* Content */}
      <div className="app_content">
        {/* Theme Section */}
        <div className="app_section">
          <h3 className="app_section_title">Theme</h3>

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
              <span className="app_theme_label">Light Mode</span>
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
              <span className="app_theme_label">Dark Mode</span>
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
              <span className="app_theme_label">System</span>
            </div>
          </div>

          <div className="app_theme_info">
            <p className="app_theme_description">
              Theme changes are saved automatically and will persist across
              sessions.
              {theme === "system" && (
                <span>
                  {" "}
                  Currently following system preference: {getCurrentTheme()}.
                </span>
              )}
            </p>
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
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AppearancePanel;
