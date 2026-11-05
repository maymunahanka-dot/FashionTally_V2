import { useState } from "react";
import {
  Edit,
  Trash2,
  User,
  Mail,
  Shield,
  Clock,
  Phone,
  Key,
} from "lucide-react";
import Button from "../button/Button";
import { useTheme } from "../../contexts/ThemeContext";
import "./AdminList.css";

const AdminList = ({ admins, loading = false, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    setDeleting(true);
    try {
      await onDelete(adminToDelete.email);
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleDisplayName = (role) => {
    if (!role) return "Admin";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className={`admin-list ${theme.actualTheme}`}>
        <div className="admin-cards-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-card loading">
              <div className="admin-card-header">
                <div className="admin-avatar loading-shimmer"></div>
                <div className="admin-card-actions">
                  <div className="loading-shimmer loading-icon"></div>
                  <div className="loading-shimmer loading-icon"></div>
                </div>
              </div>
              <div className="admin-card-body">
                <div className="loading-shimmer loading-text"></div>
                <div className="loading-shimmer loading-text-small"></div>
                <div className="loading-shimmer loading-text-small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className={`admin-list-empty ${theme.actualTheme}`}>
        <User className="admin-list-empty-icon" />
        <h3 className="admin-list-empty-title">No admins found</h3>
        <p className="admin-list-empty-description">
          Get started by creating your first admin user.
        </p>
      </div>
    );
  }

  return (
    <div className={`admin-list ${theme.actualTheme}`}>
      <div className="admin-cards-grid">
        {admins.map((admin) => (
          <div key={admin.id || admin.email} className="admin-card">
            {/* Card Header */}
            <div className="admin-card-header">
              <div className="admin-avatar">
                <User className="admin-avatar-icon" />
              </div>
              <div className="admin-card-actions">
                <button
                  className="admin-action-btn edit"
                  onClick={() => onEdit(admin)}
                  title="Edit Admin"
                >
                  <Edit className="admin-action-icon" />
                </button>
                <button
                  className="admin-action-btn delete"
                  onClick={() => handleDeleteClick(admin)}
                  title="Delete Admin"
                >
                  <Trash2 className="admin-action-icon" />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="admin-card-body">
              <div className="admin-name">{admin.name}</div>

              <div className="admin-detail">
                <Mail className="admin-detail-icon" />
                <span className="admin-detail-text">{admin.email}</span>
              </div>

              {admin.phoneNumber && (
                <div className="admin-detail">
                  <Phone className="admin-detail-icon" />
                  <span className="admin-detail-text">{admin.phoneNumber}</span>
                </div>
              )}

              <div className="admin-detail">
                <Shield className="admin-detail-icon" />
                <span className="admin-detail-text">
                  Role: {getRoleDisplayName(admin.role)}
                </span>
              </div>

              <div className="admin-detail">
                <Shield className="admin-detail-icon" />
                <span className="admin-detail-text">
                  Permissions: {getPermissionCount(admin.permissions)}/
                  {Object.keys(admin.permissions || {}).length}
                </span>
              </div>

              {/* Passwords aren't stored or shown: members set their own via the invite email */}
              <div className="admin-detail">
                <Key className="admin-detail-icon" />
                <span className="admin-detail-text">
                  Password: set by the member (forgot it? use "Forgot password" on the login page)
                </span>
              </div>

              <div className="admin-detail">
                <Clock className="admin-detail-icon" />
                <span className="admin-detail-text">
                  Created: {formatDate(admin.createdAt)}
                </span>
              </div>

              <div
                className={`admin-status-badge ${
                  admin.status === "active" ? "active" : "inactive"
                }`}
              >
                {admin.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && adminToDelete && (
        <div className="admin-delete-overlay">
          <div className="admin-delete-modal">
            <div className="admin-delete-header">
              <h3 className="admin-delete-title">Delete Admin</h3>
            </div>
            <div className="admin-delete-body">
              <p className="admin-delete-message">
                Are you sure you want to delete{" "}
                <strong>{adminToDelete.name}</strong>? This action cannot be
                undone and will remove all access permissions for this admin.
              </p>
            </div>
            <div className="admin-delete-footer">
              <Button
                variant="secondary"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Admin"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;
