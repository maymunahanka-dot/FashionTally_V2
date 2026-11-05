import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";

const Step2Password = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onNext,
  onBack,
}) => {
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
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (passwordStrength.strength < 2) {
      newErrors.password =
        "Password is too weak. Please include uppercase, lowercase, numbers, and special characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        <h1 className="n_s_u_s-s-title">Create Password</h1>
        <p className="n_s_u_s-s-subtitle">
          Choose a strong password to secure your account
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
          placeholder="Enter your password"
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
              Password strength: {passwordStrength.text}
            </div>
          </div>
        )}

        <Input
          type={showConfirmPassword ? "text" : "password"}
          label=""
          value={formData.confirmPassword}
          onChange={(e) => onInputChange("confirmPassword", e.target.value)}
          placeholder="Confirm your password"
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
            Next
          </Button>
        </div>

        <p className="n_s_u_s-s-term">
          By signing up, you agree to the{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/terms-of-service")}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/privacy-policy")}
          >
            Data Processing Agreement
          </span>
        </p>
      </form>
    </>
  );
};

export default Step2Password;
