import { useState, useRef, useEffect } from "react";
import "./OTPInput.css";

const OTPInput = ({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  error = "",
  active = false,
  autoFocus = true,
  placeholder = "",
  className = "",
  ...props
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update internal state when value prop changes
  useEffect(() => {
    const valueString = String(value || ""); // Convert to string safely
    if (valueString !== otp.join("")) {
      const newOtp = valueString.split("").slice(0, length);
      while (newOtp.length < length) {
        newOtp.push("");
      }
      setOtp(newOtp);
    }
  }, [value, length, otp]);

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, digit) => {
    // Only allow single digits
    if (digit.length > 1) {
      digit = digit.slice(-1);
    }

    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    const otpString = newOtp.join("");
    if (onChange) {
      onChange({ target: { value: otpString } });
    }

    // Auto focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (newOtp[index]) {
        // Clear current digit
        newOtp[index] = "";
        setOtp(newOtp);

        const otpString = newOtp.join("");
        if (onChange) {
          onChange({ target: { value: otpString } });
        }
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();

        const otpString = newOtp.join("");
        if (onChange) {
          onChange({ target: { value: otpString } });
        }
      }
    }

    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle delete key
    else if (e.key === "Delete") {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      const otpString = newOtp.join("");
      if (onChange) {
        onChange({ target: { value: otpString } });
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, length);

    const newOtp = Array(length).fill("");
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }

    setOtp(newOtp);

    const otpString = newOtp.join("");
    if (onChange) {
      onChange({ target: { value: otpString } });
    }

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();

    // Call onComplete if all digits are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleFocus = (index) => {
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`otp-input-wrapper ${className}`}>
      <div
        className={`otp-input-container ${error ? "error" : ""} ${
          active ? "active" : ""
        }`}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            placeholder={placeholder}
            className={`otp-input-digit ${digit ? "filled" : ""} ${
              disabled ? "disabled" : ""
            }`}
            autoComplete="one-time-code"
            {...props}
          />
        ))}
      </div>
      {error && <span className="otp-error-message">{error}</span>}
    </div>
  );
};

export default OTPInput;
