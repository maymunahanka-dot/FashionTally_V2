import { useNavigate } from "react-router-dom";
import { Lock, Shield, LogOut, AlertCircle, User } from "lucide-react";
import Button from "../button/Button";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { SubscriptionGate } from "../SubscriptionGate/SubscriptionGate";
import "./AdminPermissionGate.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

// Map feature names to permission keys
const FEATURE_TO_PERMISSION_MAP = {
  "Dashboard Analytics": "dashboard",
  "Client Management": "clients",
  "Inventory Tool": "inventory",
  "Inventory Management": "inventory",
  "Design Management": "designs",
  "Design Managements": "designs",
  "Custom Orders": "ordermanagement", // Orders have their own permission
  "Order Management": "ordermanagement", // Dedicated order management permission
  Invoicing: "invoices",
  "Appointment Scheduling": "appointments",
  "Appointments Management": "appointments",
  "Financial Reports": "finances",
  "Financial Management": "finances",
  "CRM Tools": "crm",
  "Settings Management": "settings",
};

export function AdminPermissionGate({
  children,
  requiredFeature = "CRM Tools",
}) {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();
  const navigate = useNavigate();

  // Get the auth context for logout
  const authContext = useNewAuth();

  const handleLogout = async () => {
    try {
      if (authContext?.signOut) {
        await authContext.signOut();
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If user is not a sub-admin, use regular SubscriptionGate
  const isSubAdmin = user?.isAdmin && user?.invitedBy;

  if (!isSubAdmin) {
    return (
      <SubscriptionGate requiredFeature={requiredFeature}>
        {children}
      </SubscriptionGate>
    );
  }

  // For sub-admins, check their specific permissions
  const requiredPermission = FEATURE_TO_PERMISSION_MAP[requiredFeature];
  const hasPermission = user?.permissions?.[requiredPermission] === true;

  console.log("🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐 ADMIN PERMISSION CHECK:", {
    userEmail: user?.email,
    isSubAdmin: isSubAdmin,
    requiredFeature: requiredFeature,
    requiredPermission: requiredPermission,
    userPermissions: user?.permissions,
    hasPermission: hasPermission,
  });

  // If sub-admin has permission, render the content
  if (hasPermission) {
    console.log(`✅ Sub-admin has permission for: ${requiredFeature}`);
    return <>{children}</>;
  }

  // If sub-admin doesn't have permission, show access denied
  console.log(`❌ Sub-admin lacks permission for: ${requiredFeature}`);

  return (
    <div className="admin-permission-gate">
      <div className="gate-container">
        <div className="gate-content">
          {/* Lock Icon */}
          <div className="lock-icon-wrapper">
            <div className="lock-icon-bg">
              <Lock className="lock-icon" />
            </div>
          </div>

          {/* Main Message */}
          <div className="gate-header">
            <h1 className="gate-title">{tx("auto.accessRestricted_13a4")}</h1>
            <p className="gate-description">
              {tx("auto.youDonTHavePermission_d8d9")}{" "}
              <strong>{tl(requiredFeature)}</strong>{tx("auto.contactTheMainAccountOwner_439d")}
            </p>
          </div>

          {/* Admin Info */}
          <div className="admin-info-card">
            <div className="admin-info-header">
              <User className="admin-info-icon" />
              <h3 className="admin-info-title">{tx("auto.subAdminAccount_cf37")}</h3>
            </div>
            <div className="admin-info-content">
              <p className="admin-info-text">
                {tx("auto.youAreLoggedInAs_6b82")}
              </p>
              <div className="admin-info-detail">
                <strong>{tx("auto.accountOwner_a4c3")}</strong> {user?.invitedBy}
              </div>
            </div>
          </div>

          {/* Permission Status */}
          <div className="permission-status">
            <div className="permission-status-header">
              <Shield className="permission-status-icon" />
              <h3 className="permission-status-title">{tx("auto.yourPermissions_c04c")}</h3>
            </div>
            <div className="permissions-grid">
              {user?.permissions &&
                Object.entries(user.permissions).map(([key, value]) => (
                  <div
                    key={key}
                    className={`permission-item ${
                      value ? "granted" : "denied"
                    }`}
                  >
                    <div
                      className={`permission-indicator ${
                        value ? "granted" : "denied"
                      }`}
                    >
                      {tl(value ? "✓" : "✗")}
                    </div>
                    <span className="permission-name">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="gate-actions">
            <Button
              variant="danger"
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut className="btn-icon" />
              {tx("auto.logout_e43d")}
            </Button>
          </div>

          {/* Help Text */}
          <div className="help-section">
            <AlertCircle className="help-icon" />
            <p className="help-text">
              {tx("auto.needAccessToThisFeature_3a00")}{" "}
              <strong>{user?.invitedBy}</strong>
              {tx("auto.toRequestPermissionUpdatesFor_6e0a")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
