import { useState, useEffect } from "react";
import {
  X,
  User,
  Shield,
  Settings,
  Users,
  Calendar,
  Package,
  FileText,
  DollarSign,
  MessageSquare,
  Lock,
  ShoppingCart,
} from "lucide-react";
import Button from "../button/Button";
import Input from "../Input/Input";
import { useTheme } from "../../contexts/ThemeContext";
import "./AdminForm.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const AdminForm = ({ open, onClose, admin, onSubmit, loading = false }) => {
  const { t: tx } = useTranslation();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phoneNumber: admin?.phoneNumber || "",
    role: admin?.role || "admin",
    permissions: admin?.permissions || {
      dashboard: true,
      clients: false,
      designs: false,
      appointments: false,
      inventory: false,
      invoices: false,
      finances: false,
      crm: false,
      ordermanagement: false,
      settings: false,
    },
  });

  const permissionLabels = {
    dashboard: { label: "Dashboard", icon: Shield },
    clients: { label: "Clients", icon: Users },
    designs: { label: "Designs", icon: FileText },
    appointments: { label: "Appointments", icon: Calendar },
    inventory: { label: "Inventory", icon: Package },
    invoices: { label: "Invoices", icon: FileText },
    finances: { label: "Finances", icon: DollarSign },
    crm: { label: "CRM", icon: MessageSquare },
    ordermanagement: { label: "Order Management", icon: ShoppingCart },
    settings: { label: "Settings", icon: Settings },
  };

  // Update form data when admin prop changes
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phoneNumber: admin.phoneNumber || "",
        role: admin.role || "admin",
        permissions: admin.permissions || {
          dashboard: true,
          clients: false,
          designs: false,
          appointments: false,
          inventory: false,
          invoices: false,
          finances: false,
          crm: false,
          ordermanagement: false,
          settings: false,
        },
      });
    } else {
      // Reset form for new admin
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        role: "admin",
        permissions: {
          dashboard: true,
          clients: false,
          designs: false,
          appointments: false,
          inventory: false,
          invoices: false,
          finances: false,
          crm: false,
          ordermanagement: false,
          settings: false,
        },
      });
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert(tx("auto.nameIsRequired_222c"));
      return;
    }

    if (!formData.email.trim()) {
      alert(tx("auto.emailIsRequired_4da1"));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(tx("auto.pleaseEnterAValidEmail_0802"));
      return;
    }

    // Check if at least one permission is selected
    const hasPermissions = Object.values(formData.permissions).some(
      (permission) => permission
    );
    if (!hasPermissions) {
      alert(tx("auto.pleaseSelectAtLeastOne_185a"));
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      // Reset form if creating new admin
      if (!admin) {
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          role: "admin",
          permissions: {
            dashboard: true,
            clients: false,
            designs: false,
            appointments: false,
            inventory: false,
            invoices: false,
            finances: false,
            crm: false,
            ordermanagement: false,
            settings: false,
          },
        });
      }
    } catch (error) {
      console.error("Error submitting admin form:", error);
    }
  };

  const handlePermissionChange = (permission, checked) => {
    console.log(`Permission ${permission} changed to:`, checked);
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked,
        },
      };
      console.log("Updated form data:", newFormData);
      return newFormData;
    });
  };

  const selectAllPermissions = () => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      Object.keys(newPermissions).forEach((key) => {
        // Since all permissions are now available, enable all
        newPermissions[key] = true;
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const clearAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: Object.keys(prev.permissions).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false,
        }),
        {}
      ),
    }));
  };

  if (!open) return null;

  return (
    <div className={`admin-form-overlay ${theme.actualTheme}`}>
      <div className="admin-form-modal">
        <div className="admin-form-header">
          <div className="admin-form-title">
            <User className="admin-form-icon" />
            {tl(admin ? tx("auto.editAdmin_a1bc") : tx("auto.createNewAdmin_1cdc"))}
          </div>
          <button className="admin-form-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-form-description">
          {tl(admin
            ? tx("auto.updateAdminDetailsAndPermissions_6928")
            : tx("auto.addANewAdminUser_af1e"))}
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Basic Information */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">{tx("auto.basicInformation_b0d5")}</h3>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">{tx("auto.fullName_0756")}</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={tx("auto.enterFullName_2936")}
                  required
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">{tx("auto.emailAddress_ff92")}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={tx("auto.enterEmailAddress_122a")}
                  required
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">{tx("auto.phoneNumber_ab25")}</label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder={tx("auto.enterPhoneNumber_a226")}
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">{tx("auto.role_c3f1")}</label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder={tx("auto.enterRoleEGAdmin_070b")}
                  variant="rounded"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="admin-form-section">
            <div className="admin-form-permissions-header">
              <h3 className="admin-form-section-title">{tx("auto.permissions_d06d")}</h3>
              <div className="admin-form-permission-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={selectAllPermissions}
                  className="admin-form-action-btn"
                >
                  {tx("auto.selectAvailable_5ef9")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearAllPermissions}
                  className="admin-form-action-btn"
                >
                  {tx("auto.clearAll_3a88")}
                </Button>
              </div>
            </div>
            <div className="admin-form-permissions-grid">
              {Object.entries(permissionLabels).map(
                ([key, { label, icon: Icon }]) => {
                  // Since all permissions are now available, isLocked is always false
                  const isLocked = false;

                  return (
                    <div
                      key={key}
                      className={`admin-form-permission-item ${
                        isLocked ? "locked" : ""
                      }`}
                    >
                      <div className="admin-form-permission-info">
                        {isLocked ? (
                          <Lock className="admin-form-permission-icon locked" />
                        ) : (
                          <Icon className="admin-form-permission-icon" />
                        )}
                        <span className="admin-form-permission-label">
                          {tl(label)}
                        </span>
                      </div>
                      <div className="admin-form-switch">
                        <input
                          id={`permission-${key}`}
                          type="checkbox"
                          checked={formData.permissions[key] || false}
                          onChange={(e) => {
                            console.log(
                              `Checkbox clicked for ${key}:`,
                              e.target.checked
                            );
                            handlePermissionChange(key, e.target.checked);
                          }}
                          disabled={isLocked}
                          className="admin-form-checkbox"
                        />
                        <label
                          htmlFor={`permission-${key}`}
                          className="admin-form-slider"
                        ></label>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            <div className="admin-form-locked-note">
              <span className="admin-form-note-text">
                {tx("auto.allPermissionsAreAvailableFor_ed54")}
              </span>
            </div>
          </div>

          <div className="admin-form-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {tx("auto.cancel_77df")}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? tx("auto.saving_ae7e") : admin ? tx("auto.updateAdmin_f62a") : tx("auto.createAdmin_318d")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
