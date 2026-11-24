import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNewAuth } from "../../../contexts/NewAuthContext";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";
import OTPVerificationModal from "../../../components/OTPVerificationModal/OTPVerificationModal";
import ReferralCodeField from "./ReferralCodeField";
import toast from "react-hot-toast";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";

const Step1PersonalInfo = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onNext,
}) => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const { signInWithGoogle } = useNewAuth();
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = tx("auto.nameIsRequired_222c");
    }

    if (!formData.email.trim()) {
      newErrors.email = tx("auto.emailIsRequired_4da1");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = tx("auto.pleaseEnterAValidEmail_0802");
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tx("auto.phoneNumberIsRequired_f845");
    } else if (formData.phone.length < 8) {
      newErrors.phone = tx("auto.pleaseEnterAValidPhone_4986");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // Navigation is handled in the context
        console.log("Google signup successful");
      }
    } catch (error) {
      console.error("Google signup error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const postAuth = async (path, payload) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Something went wrong. Please try again.");
    return data;
  };

  // The backend emails the code and checks it; the code never comes back to the browser.
  const sendOTP = () => postAuth("send-email-otp", { email: formData.email, flow: "server" });

  const handleNext = async () => {
    if (validateStep1()) {
      setShowOTPModal(true);
      setIsSendingOTP(true);

      try {
        await sendOTP();
        toast.success(tx("auto.otpSentToYourEmail_c65b"));
      } catch (error) {
        console.error("❌ Error sending OTP:", error);
        toast.error(error.message || tx("auto.failedToSendOtpPlease_6e4b"));
        setShowOTPModal(false);
      } finally {
        setIsSendingOTP(false);
      }
    }
  };

  const handleResendOTP = async () => {
    await sendOTP();
    toast.success(tx("auto.aNewCodeHasBeen_7f50"));
  };

  const handleOTPVerify = async (otp) => {
    const data = await postAuth("verify-email-otp", { email: formData.email, otp });
    onInputChange("emailVerificationToken", data.verificationToken);
    setShowOTPModal(false);
    toast.success(tx("auto.emailVerifiedSuccessfully_7d8b"));
    onNext();
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  // Check if all required fields are filled
  const isFormValid = !!(formData.name && formData.email && formData.phone);

  return (
    <>
      <div className="n_s_u_s-s-title-con">
        <h1 className="n_s_u_s-s-title">{tx("auto.createAccount_eff4")}</h1>
        <p className="n_s_u_s-s-subtitle">
          {tx("auto.setUpYourFashiontallyAccount_3dd5")}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        {errors.general && (
          <div className="n_s_u_error-message" style={{ marginBottom: "1rem" }}>
            {tl(errors.general)}
          </div>
        )}

        <Input
          type="text"
          label=""
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder={tx("auto.fullName_6434")}
          required
          error={errors.name}
          active={!!formData.name}
        />

        <Input
          type="email"
          label=""
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder={tx("auto.emailAddress_09ba")}
          required
          error={errors.email}
          active={!!formData.email}
        />

        <div
          className={`phone-input-wrapper ${errors.phone ? "error" : ""} ${
            formData.phone ? "active" : ""
          }`}
        >
          <PhoneInput
            country={"ng"}
            value={formData.phone}
            onChange={(phone) => onInputChange("phone", phone)}
            placeholder={tx("auto.phoneNumber_ab25")}
            inputClass="phone-input-field"
            containerClass="phone-input-container"
            buttonClass="phone-input-button"
            dropdownClass="phone-input-dropdown"
            searchClass="phone-input-search"
            enableSearch={true}
            disableSearchIcon={true}
            countryCodeEditable={false}
            specialLabel=""
          />
          {errors.phone && (
            <span className="phone-input-error">{tl(errors.phone)}</span>
          )}
        </div>

        {/* Refer & Earn: optional, filled in automatically from a ?ref= link */}
        <ReferralCodeField value={formData.referralCode || ""} onChange={(v) => onInputChange("referralCode", v)} />

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

        {/* Divider */}
        <div className="n_s_u_auth-divider">
          <span>{tx("auto.or_1758")}</span>
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          className="n_s_u_google-signup-btn"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
        >
          <div className="n_s_u_google-icon">
            {isGoogleLoading ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="n_s_u_loading-spinner"
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
          {tl(isGoogleLoading ? tx("auto.connecting_b98e") : tx("auto.continueWithGoogle_ccc5"))}
        </button>

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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        title={tx("auto.verifyYourAccount_ddee")}
        message={
          isSendingOTP
            ? tx("auto.sendingVerificationCode_b96b")
            : tx("tpl.weVeSentAVerification_c834", { v0: formData.email })
        }
        otpLength={6}
      />
    </>
  );
};

export default Step1PersonalInfo;
