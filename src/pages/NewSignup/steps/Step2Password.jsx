import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";
const Step2Password = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onNext,
  onBack,
}) => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const [showPassword] = useState(false);
  const [showConfirmPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 3) return { strength: 1, text: "Weak", class: "weak" };
    if (score < 5) return { strength: 2, text: "Medium", class: "medium" };
    return { strength: 3, text: "Strong", class: "strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = tx("auto.passwordIsRequired_6c56");
    } else if (formData.password.length < 8) {
      newErrors.password = tx("auto.passwordMustBeAtLeast_47a7");
    } else if (passwordStrength.strength < 2) {
      newErrors.password =
        tx("auto.passwordIsTooWeakPlease_9202");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tx("auto.pleaseConfirmYourPassword_51d6");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tx("auto.passwordsDoNotMatch_d69c");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep2()) {
      onNext();
    }
  };

  const isFormValid = !!(
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword
  );

  return (
    <>
      <div className="n_s_u_s-s-header">
        <div className="n_s_u_s-s-header-l-s">
          <button className="n_s_u_s-s-back-btn" onClick={onBack} type="button">
            <svg
              className="n_s_u_s-s-back-icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M19 12H5m7-7l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="n_s_u_s-s-title-con">
        <h1 className="n_s_u_s-s-title">{tx("auto.createPassword_710a")}</h1>
        <p className="n_s_u_s-s-subtitle">
          {tx("auto.chooseAStrongPasswordTo_a38e")}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <Input
          type={showPassword ? "text" : "password"}
          label=""
          value={formData.password}
          onChange={(e) => onInputChange("password", e.target.value)}
          placeholder={tx("auto.enterYourPassword_1378")}
          required
          error={errors.password}
          active={!!formData.password}
        />

        {formData.password && (
          <div className="n_s_u_password-strength">
            <div className="n_s_u_strength-bar">
              <div
                className={`n_s_u_strength-fill n_s_u_strength-${passwordStrength.class}`}
              ></div>
            </div>
            <div
              className={`n_s_u_strength-text n_s_u_strength-${passwordStrength.class}-text`}
            >
              {tx("auto.passwordStrength_c10b")}{" "}{tl(passwordStrength.text)}
            </div>
          </div>
        )}

        <Input
          type={showConfirmPassword ? "text" : "password"}
          label=""
          value={formData.confirmPassword}
          onChange={(e) => onInputChange("confirmPassword", e.target.value)}
          placeholder={tx("auto.confirmYourPassword_198b")}
          required
          error={errors.confirmPassword}
          active={!!formData.confirmPassword}
        />

        <div className="n_s_u_s-s-submitbutton">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isFormValid}
            className={isFormValid ? "" : "n_s_u_s-s-btn-inactive"}
          >
            {tx("auto.next_bc98")}
          </Button>
        </div>

        <p className="n_s_u_s-s-term">
          {tx("auto.bySigningUpYouAgree_d580")}{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/terms-of-service")}
          >
            {tx("auto.termsOfService_0c8a")}
          </span>{" "}
          {tx("auto.and_cffa")}{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/privacy-policy")}
          >
            {tx("auto.dataProcessingAgreement_a061")}
          </span>
        </p>
      </form>
    </>
  );
};

export default Step2Password;
