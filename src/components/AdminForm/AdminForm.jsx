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

const AdminForm = ({ open, onClose, admin, onSubmit, loading = false }) => {
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
      alert("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Check if at least one permission is selected
    const hasPermissions = Object.values(formData.permissions).some(
      (permission) => permission
    );
    if (!hasPermissions) {
      alert("Please select at least one permission");
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
            {admin ? "Edit Admin" : "Create New Admin"}
          </div>
          <button className="admin-form-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-form-description">
          {admin
            ? "Update admin details and permissions"
            : "Add a new admin user with specific permissions"}
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Basic Information */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">Basic Information</h3>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">Full Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="Enter phone number"
                  variant="rounded"
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Role</label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Enter role (e.g., admin, manager, staff)"
                  variant="rounded"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="admin-form-section">
            <div className="admin-form-permissions-header">
              <h3 className="admin-form-section-title">Permissions</h3>
              <div className="admin-form-permission-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={selectAllPermissions}
                  className="admin-form-action-btn"
                >
                  Select Available
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearAllPermissions}
                  className="admin-form-action-btn"
                >
                  Clear All
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
                          {label}
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
                All permissions are available for admin users.
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
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : admin ? "Update Admin" : "Create Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
