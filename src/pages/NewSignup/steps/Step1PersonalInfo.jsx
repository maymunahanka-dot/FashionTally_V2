import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNewAuth } from "../../../contexts/NewAuthContext";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";
import OTPVerificationModal from "../../../components/OTPVerificationModal/OTPVerificationModal";
import toast from "react-hot-toast";
import { sendOTP, generateOTP } from "../../../utils/emailService";

const Step1PersonalInfo = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onNext,
}) => {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const { signInWithGoogle } = useNewAuth();
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 8) {
      newErrors.phone = "Please enter a valid phone number";
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

  const handleNext = async () => {
    if (validateStep1()) {
      const otp = generateOTP();
      setGeneratedOTP(otp);
      setShowOTPModal(true);
      setIsSendingOTP(true);

      try {
        const result = await sendOTP({
          mail: formData.email,
          name: formData.name,
          otp,
        });

        if (result.success) {
          toast.success("OTP sent to your email!");
          console.log("✅ OTP sent successfully");
        } else {
          throw new Error(result.error || "Failed to send OTP");
        }
      } catch (error) {
        console.error("❌ Error sending OTP:", error);
        toast.error("Failed to send OTP. Please try again.");
        console.log("🔐 Generated OTP (fallback):", otp);
      } finally {
        setIsSendingOTP(false);
      }
    }
  };

  const handleOTPVerify = async (otp) => {
    // Verify the entered OTP matches the generated one
    console.log("Verifying OTP:", otp, "Generated:", generatedOTP);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === generatedOTP) {
          setShowOTPModal(false);
          toast.success("Email verified successfully!");
          onNext(); // Go to next step after successful verification
          resolve();
        } else {
          reject(new Error("Invalid OTP. Please check and try again."));
        }
      }, 500);
    });
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setGeneratedOTP("");
  };

  // Check if all required fields are filled
  const isFormValid = !!(formData.name && formData.email && formData.phone);

  return (
    <>
      <div className="n_s_u_s-s-title-con">
        <h1 className="n_s_u_s-s-title">Create Account</h1>
        <p className="n_s_u_s-s-subtitle">
          Set up your Fashiontally account today!
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
            {errors.general}
          </div>
        )}

        <Input
          type="text"
          label=""
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Full Name"
          required
          error={errors.name}
          active={!!formData.name}
        />

        <Input
          type="email"
          label=""
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="Email Address"
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
            placeholder="Phone Number"
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
            <span className="phone-input-error">{errors.phone}</span>
          )}
        </div>

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

        {/* Divider */}
        <div className="n_s_u_auth-divider">
          <span>or</span>
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
          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </button>

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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        onVerify={handleOTPVerify}
        title="Verify Your Account"
        message={
          isSendingOTP
            ? "Sending verification code..."
            : `We've sent a verification code to ${formData.email}. Please enter it below.`
        }
        otpLength={6}
      />
    </>
  );
};

export default Step1PersonalInfo;
