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

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const SecurityPanel = ({ onClose }) => {
  const { t: tx } = useTranslation();
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
      newErrors.currentPassword = tx("auto.currentPasswordIsRequired_5166");
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = tx("auto.newPasswordIsRequired_ded2");
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = tx("auto.passwordMustBeAtLeast_c017");
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = tx("auto.pleaseConfirmYourNewPassword_d331");
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = tx("auto.passwordsDoNotMatch_d69c");
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        tx("auto.newPasswordMustBeDifferent_3c75");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    if (!user) {
      setErrors({ general: tx("auto.userNotAuthenticated_dc86") });
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
      setSuccessMessage(tx("auto.passwordUpdatedSuccessfully_c0e2"));
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrors({ general: tx("auto.failedToUpdatePasswordPlease_d553") });
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
          <h2 className="sec_title">{tx("auto.security_f25c")}</h2>
          <p className="sec_subtitle">{tx("auto.manageYourPassword_824b")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="sec_content">
        {/* Login Method Info */}
        <div className="sec_section">
          <h3 className="sec_section_title">{tx("auto.accountInformation_0cbd")}</h3>

          {loginInfo && (
            <div className="sec_login_info">
              <div className="sec_login_method">
                <span className="sec_login_icon">
                  {loginInfo.isGoogle ? "🔍" : loginInfo.isEmail ? "📧" : "📱"}
                </span>
                <div className="sec_login_details">
                  <h4 className="sec_login_title">{tx("auto.loginMethod_3859")}</h4>
                  <p className="sec_login_description">
                    {tl(getLoginMethodDescription(user))}
                  </p>
                </div>
              </div>

              {!loginInfo.canChangePassword && (
                <div className="sec_info_note">
                  <AlertCircle size={16} />
                  <span>
                    {tl(loginInfo.isGoogle
                      ? tx("auto.passwordChangesAreManagedThrough_49bd")
                      : tx("auto.passwordChangesAreNotAvailable_1400"))}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password Section - Only show for email users */}
        {loginInfo?.canChangePassword && (
          <div className="sec_section">
            <h3 className="sec_section_title">{tx("auto.changePassword_4928")}</h3>

            {/* General Error Message */}
            {errors.general && (
              <div className="sec_error_message">
                <AlertCircle size={16} />
                <span>{tl(errors.general)}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="sec_success_message">
                <span>{tl(successMessage)}</span>
              </div>
            )}

            <div className="sec_form_group">
              <label className="sec_form_label">{tx("auto.currentPassword_4d59")}</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                placeholder={tx("auto.enterCurrentPassword_149b")}
                error={errors.currentPassword}
                className="sec_input"
                disabled={isUpdating}
              />
            </div>

            <div className="sec_form_group">
              <label className="sec_form_label">{tx("auto.newPassword_4894")}</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                placeholder={tx("auto.enterNewPassword_a8b1")}
                error={errors.newPassword}
                className="sec_input"
                disabled={isUpdating}
              />
            </div>

            <div className="sec_form_group">
              <label className="sec_form_label">{tx("auto.confirmNewPassword_68dc")}</label>
              <Input
                type="password"
                variant="rounded"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                placeholder={tx("auto.confirmNewPassword_f850")}
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
                  {tx("auto.updatingPassword_ab06")}
                </>
              ) : (
                tx("auto.updatePassword_61dc")
              )}
            </Button>

            {/* Security Tip */}
            <div className="sec_tip">
              <div className="sec_tip_icon">
                <AlertCircle size={20} />
              </div>
              <div className="sec_tip_content">
                <h4 className="sec_tip_title">{tx("auto.securityTip_8418")}</h4>
                <p className="sec_tip_text">
                  {tx("auto.useAStrongPasswordWith_79f1")}
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
