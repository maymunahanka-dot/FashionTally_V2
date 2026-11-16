import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNewAuth } from "../../contexts/NewAuthContext";
import Input from "../../components/Input";
import Button from "../../components/button/Button";
import logo from "../../assets/Image/logo.png";
import "./ForgotPassword.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";
const ForgotPassword = () => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const { resetPassword } = useNewAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(tx("auto.pleaseEnterYourEmailAddress_103d"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(tx("auto.pleaseEnterAValidEmail_0802"));
      return;
    }

    setLoading(true);
    setError("");

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || tx("auto.failedToSendPasswordReset_4653"));
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const resetState = () => {
    setSuccess(false);
    setError("");
    setEmail("");
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-left-section">
          <div className="forgot-password-left-content">
            <img
              src={logo}
              alt="FashionTally Logo"
              className="forgot-password-logo"
            />
            <h2 className="forgot-password-tagline">
              {tx("auto.empoweringAfricanFashionEntrepre_2252")}
            </h2>
          </div>
        </div>

        <div className="forgot-password-right-section">
          <div className="forgot-password-right-content">
            <div className="forgot-password-header">
              <div className="forgot-password-success-icon">✅</div>
              <h1 className="forgot-password-title">{tx("auto.checkYourEmail_e80f")}</h1>
              <p className="forgot-password-subtitle">
                {tx("auto.weVeSentAPassword_bb0c")}{" "}<strong>{tl(email)}</strong>
              </p>
            </div>

            <div className="forgot-password-success-alert">
              <p className="forgot-password-alert-text">
                {tx("auto.ifAnAccountWithThis_dcc3")}
              </p>
            </div>

            <div className="forgot-password-instructions">
              <p>{tx("auto.checkYourSpamFolderIf_f9dd")}</p>
              <p>{tx("auto.theLinkWillExpireIn_b960")}</p>
              <p>{tx("auto.makeSureToCheckThe_a2d7")}</p>
            </div>

            <div className="forgot-password-actions">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={resetState}
              >
                {tx("auto.sendAnotherEmail_416c")}
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                {tx("auto.backToLogin_71bc")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left-section">
        <div className="forgot-password-left-content">
          <img
            src={logo}
            alt="FashionTally Logo"
            className="forgot-password-logo"
          />
          <h2 className="forgot-password-tagline">
            {tx("auto.empoweringAfricanFashionEntrepre_2252")}
          </h2>
        </div>
      </div>

      <div className="forgot-password-right-section">
        <div className="forgot-password-right-content">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">{tx("auto.forgotPassword_1cc8")}</h1>
            <p className="forgot-password-subtitle">
              {tx("auto.enterYourEmailToReceive_6492")}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="forgot-password-error-message">{tl(error)}</div>
            )}

            <Input
              type="email"
              label=""
              value={email}
              onChange={handleInputChange}
              placeholder={tx("auto.emailAddress_09ba")}
              required
              error={error}
              active={!!email}
            />

            <div className="forgot-password-submit-button">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!email}
                className={email ? "" : "forgot-password-btn-inactive"}
              >
                {tx("auto.sendResetLink_987b")}
              </Button>
            </div>

            <p className="forgot-password-login-link">
              {tx("auto.rememberYourPassword_0eb2")}{" "}
              <span
                className="forgot-password-link"
                onClick={() => navigate("/login")}
              >
                {tx("auto.signInHere_3b04")}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
