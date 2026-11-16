import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import Input from "../../components/Input";
import Button from "../../components/button/Button";
import logo from "../../assets/Image/logo.png";
import "./NewLogin.css";

import { tl } from "../../i18n";

import LanguageSwitch from "../../components/LanguageSwitch/LanguageSwitch.jsx";
const NewLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signInWithEmail, signInWithGoogle } = useNewAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleOnlyError, setGoogleOnlyError] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Dismiss Google-only banner when user edits email or password
    if (field === "email" || field === "password") {
      setGoogleOnlyError(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // Navigation is handled in the context
        console.log("Google sign-in successful");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = t("login.errors.emailRequired");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t("login.errors.emailInvalid");
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = t("login.errors.passwordRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setGoogleOnlyError(false);

    try {
      const result = await signInWithEmail(
        formData.email,
        formData.password,
        formData.rememberMe
      );
      if (!result.success) {
        // Detect Google-only account error — show inline hint instead of just toast
        if (result.error && result.error.includes('Google Sign-In')) {
          setGoogleOnlyError(true);
        }
      }
    } catch (error) {
      console.error("Email sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!(formData.email && formData.password);

  return (
    <div className="new-login-container">
      <div className="new-login-left-section">
        <div className="new-login-left-content">
          <img src={logo} alt="FashionTally Logo" className="new-login-logo" />
          <h2 className="new-login-tagline">
            {t("login.tagline")}
          </h2>
        </div>
      </div>

      <div className="new-login-right-section">
        <LanguageSwitch className="lang-switch-corner" />
        <div className="new-login-right-content">
          <div className="new-login-header">
            <button
              type="button"
              className="new-login-back-btn"
              onClick={() => navigate("/")}
              title={t("login.backHome")}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="new-login-title">{t("login.title")}</h1>
            <p className="new-login-subtitle">
              {t("login.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="new-login-error-message">{tl(errors.general)}</div>
            )}

            {googleOnlyError && (
              <div className="new-login-google-only-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#e67e22" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#e67e22" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{t("login.googleOnlyTitle")}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                    <Trans i18nKey="login.googleOnlyHint" components={{ 1: <strong /> }} />
                  </p>
                </div>
              </div>
            )}

            <Input
              type="email"
              label=""
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t("login.email")}
              required
              error={errors.email}
              active={!!formData.email}
            />

            <Input
              type="password"
              label=""
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder={t("login.password")}
              required
              error={errors.password}
              active={!!formData.password}
            />

            <div className="new-login-options">
              <label className="new-login-remember">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    handleInputChange("rememberMe", e.target.checked)
                  }
                />
                <span className="new-login-remember-text">{t("login.rememberMe")}</span>
              </label>

              <button
                type="button"
                className="new-login-forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                {t("login.forgot")}
              </button>
            </div>

            <div className="new-login-submit-button">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!isFormValid}
                className={isFormValid ? "" : "new-login-btn-inactive"}
              >
                {t("login.signIn")}
              </Button>
            </div>

            <div className="new-login-divider">
              <span>{t("login.or")}</span>
            </div>

            <button
              type="button"
              className="new-login-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              <div className="new-login-google-icon">
                {googleLoading ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="new-login-loading-spinner"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
              </div>
              {tl(googleLoading ? t("login.connecting") : t("login.google"))}
            </button>

            <p className="new-login-terms">
              {t("login.termsPrefix")}{" "}
              <span
                className="new-login-terms-link"
                onClick={() => navigate("/terms-of-service")}
              >
                {t("login.terms")}
              </span>{" "}
              {t("login.and")}{" "}
              <span
                className="new-login-terms-link"
                onClick={() => navigate("/privacy-policy")}
              >
                {t("login.dpa")}
              </span>
            </p>

            <p className="new-login-signup-link">
              {t("login.noAccount")}{" "}
              <span
                className="new-login-link"
                onClick={() => navigate("/signup")}
              >
                {t("login.signUp")}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
