import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import {
  getLoginTypeFromUserData,
  getLoginMethodDescription,
} from "../../utils/authUtils";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./SecurityPanel.css";

const SecurityPanel = ({ onClose }) => {
  const { user } = useNewAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loginInfo, setLoginInfo] = useState(null);

  // Get login type information
  useEffect(() => {
    if (user) {
      const info = getLoginTypeFromUserData(user);
      setLoginInfo(info);
    }
  }, [user]);

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    if (!user) {
      setErrors({ general: "User not authenticated" });
      return;
    }

    setIsUpdating(true);
    setErrors({});

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );
      const data = await res.json();

      if (!data.success) {
        const msg = data.error || "Failed to update password";
        if (msg.toLowerCase().includes("current password")) {
          setErrors({ currentPassword: msg });
        } else {
          setErrors({ general: msg });
        }
        return;
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrors({ general: "Failed to update password. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="sec_panel">
      {/* Header */}
      <div className="sec_header">
        <button className="sec_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="sec_header_content">
          <h2 className="sec_title">Security</h2>
          <p className="sec_subtitle">Manage your password</p>
        </div>
      </div>

      {/* Content */}
      <div className="sec_content">
        {/* Login Method Info */}
        <div className="sec_section">
          <h3 className="sec_section_title">Account Information</h3>

          {loginInfo && (
            <div className="sec_login_info">
              <div className="sec_login_method">
                <span className="sec_login_icon">
                  {loginInfo.isGoogle ? "🔍" : loginInfo.isEmail ? "📧" : "📱"}
                </span>
                <div className="sec_login_details">
                  <h4 className="sec_login_title">Login Method</h4>
                  <p className="sec_login_description">
                    {getLoginMethodDescription(user)}
                  </p>
                </div>
              </div>

              {!loginInfo.canChangePassword && (
                <div className="sec_info_note">
                  <AlertCircle size={16} />
                  <span>
                    {loginInfo.isGoogle
                      ? "Password changes are managed through your Google account"
                      : "Password changes are not available for phone-based accounts"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password Section - Only show for email users */}
        {loginInfo?.canChangePassword && (
          <div className="sec_section">
            <h3 className="sec_section_title">Change Password</h3>

            {/* General Error Message */}
            {errors.general && (
              <div className="sec_error_message">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="sec_success_message">
                <span>{successMessage}</span>
              </div>
            )}

            <div className="sec_form_group">
              <label className="sec_form_label">Current Password</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                placeholder="Enter current password"
                error={errors.currentPassword}
                className="sec_input"
                disabled={isUpdating}
              />
            </div>

            <div className="sec_form_group">
              <label className="sec_form_label">New Password</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                placeholder="Enter new password"
                error={errors.newPassword}
                className="sec_input"
                disabled={isUpdating}
              />
            </div>

            <div className="sec_form_group">
              <label className="sec_form_label">Confirm New Password</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm new password"
                error={errors.confirmPassword}
                className="sec_input"
                disabled={isUpdating}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleUpdatePassword}
              className="sec_update_btn"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>

            {/* Security Tip */}
            <div className="sec_tip">
              <div className="sec_tip_icon">
                <AlertCircle size={20} />
              </div>
              <div className="sec_tip_content">
                <h4 className="sec_tip_title">Security Tip</h4>
                <p className="sec_tip_text">
                  Use a strong password with at least 6 characters, including
                  uppercase, lowercase, numbers, and symbols.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
