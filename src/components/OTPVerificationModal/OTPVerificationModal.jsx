import { useEffect, useState } from "react";
import { X } from "lucide-react";
import OTPInput from "../OTPInput/OTPInput";
import Button from "../button/Button";
import "./OTPVerificationModal.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


const RESEND_SECONDS = 30;

const OTPVerificationModal = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  title = "Verify OTP",
  message = "Please enter the OTP sent to your email/phone",
  otpLength = 6,
}) => {
  const { t: tx } = useTranslation();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  // Restart the countdown each time the modal opens
  useEffect(() => {
    if (isOpen) setResendIn(RESEND_SECONDS);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, resendIn]);

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    try {
      await onResend();
      setOtp("");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || tx("auto.couldNotResendTheCode_cab1"));
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value || "";
    setOtp(value);
    setError(""); // Clear error when user types
  };

  const handleVerify = async () => {
    if (otp.length !== otpLength) {
      setError(tx("tpl.pleaseEnterAllDigits_9c7e", { v0: otpLength }));
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call the onVerify callback passed from parent
      await onVerify(otp);
      // Parent component will handle navigation/next steps
    } catch (err) {
      setError(err.message || tx("auto.verificationFailedPleaseTryAgain_79a2"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setOtp("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={handleCancel}>
      <div className="otp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="otp-modal-close" onClick={handleCancel}>
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="otp-modal-title">{tl(title)}</h2>

        {/* Message */}
        <p className="otp-modal-message">{tl(message)}</p>

        {/* OTP Input */}
        <div className="otp-input-container">
          <OTPInput
            length={otpLength}
            value={otp}
            onChange={handleOTPChange}
            disabled={isVerifying}
          />
        </div>

        {/* Error Message */}
        {error && <p className="otp-error-message">{tl(error)}</p>}

        {onResend && (
          <p className="otp-resend">
            {resendIn > 0 ? (
              tx("tpl.didnTGetTheCode_bcae", { v0: resendIn })
            ) : (
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={isResending || isVerifying}
              >
                {tl(isResending ? tx("auto.sending_c338") : tx("auto.resendCode_1d3c"))}
              </button>
            )}
          </p>
        )}

        {/* Action Buttons */}
        <div className="otp-modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isVerifying}
            className="otp-cancel-btn"
          >
            {tx("auto.cancel_77df")}
          </Button>
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== otpLength}
            className="otp-verify-btn"
          >
            {tl(isVerifying ? tx("auto.verifying_bf6e") : tx("auto.verify_dda6"))}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
