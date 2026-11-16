import { useState } from "react";
import {
  ArrowLeft,
  UserPlus,
  X,
  Check,
  Shield,
  Users,
  Activity,
  Crown,
  RefreshCw,
  AlertCircle,
  Lock,
} from "lucide-react";
import Button from "../../components/button/Button";
import AdminForm from "../../components/AdminForm/AdminForm";
import AdminList from "../../components/AdminList/AdminList";
import { useAdminManagement } from "../../hooks/use-admin-management";
import { useSubscription } from "../../hooks/use-subscription";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import "./TeamPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";


const TeamPanel = ({ onClose }) => {
  const { t: tx } = useTranslation();
  const { theme } = useTheme();
  const { user } = useNewAuth();
  const { planType } = useSubscription();
  const {
    admins,
    loading,
    operationLoading,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refreshAdmins,
    canAddMoreAdmins,
    adminLimit,
  } = useAdminManagement();

  // Check if current user is a sub-admin (has isAdmin flag but has invitedBy field)
  const isSubAdmin = user?.isAdmin && user?.invitedBy;

  console.log("🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐 TEAM PANEL - Access check:", {
    userEmail: user?.email,
    isAdmin: user?.isAdmin,
    invitedBy: user?.invitedBy,
    isSubAdmin: isSubAdmin,
  });

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDisplay, setPasswordDisplay] = useState(null);

  // Get admin statistics
  const getAdminStats = () => {
    const total = admins.length;
    const active = admins.filter((a) => a.status === "active").length;
    const inactive = admins.filter((a) => a.status === "inactive").length;
    return { total, active, inactive };
  };

  const stats = getAdminStats();

  const handleCreateAdmin = () => {
    if (!canAddMoreAdmins()) {
      alert(
        tx("tpl.youHaveReachedTheLimit_c9f7", { v0: adminLimit, v1: planType })
      );
      return;
    }
    setSelectedAdmin(null);
    setIsEditing(false);
    setShowAdminForm(true);
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsEditing(false);
    setShowViewModal(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsEditing(true);
    setShowAdminForm(true);
  };

  const handleDeleteAdmin = async (adminEmail) => {
    console.log(
      "🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯 TEAM PANEL - Delete admin called for:",
      adminEmail
    );
    try {
      const result = await deleteAdmin(adminEmail);
      console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯 TEAM PANEL - Delete result:", result);

      if (result.success) {
        // Show detailed message about Firebase Auth limitation
        if (result.authUserStillExists) {
          alert(`${result.message}`);
        } else {
          alert(
            tx("tpl.adminHasBeenCompletelyRemoved_b676", { v0: result.deletedAdmin?.name })
          );
        }
        console.log(
          "✅✅✅✅✅✅✅✅✅✅ TEAM PANEL - Admin deletion completed, state should be updated"
        );
      }
    } catch (error) {
      console.error("❌❌❌❌❌❌❌❌❌❌ TEAM PANEL - Delete error:", error);
      alert(error.message || tx("auto.failedToDeleteAdmin_a3e8"));
    }
  };

  const handleSubmitAdmin = async (adminData) => {
    try {
      if (isEditing && selectedAdmin) {
        await updateAdmin(selectedAdmin.email, adminData);
        alert(tx("auto.adminUpdatedSuccessfully_16fb"));
      } else {
        const result = await createAdmin(adminData);
        if (result.success && result.password) {
          setPasswordDisplay({
            name: adminData.name,
            email: adminData.email,
            password: result.password,
          });
          // Auto-hide password after 15 seconds
          setTimeout(() => {
            setPasswordDisplay(null);
          }, 15000);
        }
        // Don't show alert here - the password banner is enough feedback
        console.log(
          "✅✅✅✅✅✅✅✅✅✅ TEAM PANEL - Admin created successfully, staying logged in as main user"
        );
      }
      setShowAdminForm(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("❌❌❌❌❌❌❌❌❌❌ TEAM PANEL - Submit error:", error);
      alert(error.message || tx("auto.failedToSaveAdmin_c776"));
    }
  };

  // If user is a sub-admin, show access denied message
  if (isSubAdmin) {
    return (
      <div className={`team_panel ${theme.actualTheme}`}>
        {/* Header */}
        <div className="team_header">
          <div className="team_header_left">
            <button className="team_back_btn" onClick={onClose}>
              <ArrowLeft size={20} />
            </button>
            <div className="team_header_content">
              <h2 className="team_title">{tx("auto.teamManagement_f603")}</h2>
            </div>
          </div>
        </div>

        {/* Access Denied Content */}
        <div className="team_access_denied">
          <div className="team_access_denied_content">
            <div className="team_access_denied_icon">
              <Lock size={64} />
            </div>
            <h3 className="team_access_denied_title">{tx("auto.accessRestricted_13a4")}</h3>
            <p className="team_access_denied_message">
              {tx("auto.youAreCurrentlyLoggedIn_13e7")}
            </p>
            <p className="team_access_denied_note">
              {tx("auto.ifYouNeedToManage_2fb6")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`team_panel ${theme.actualTheme}`}>
      {/* Header */}
      <div className="team_header">
        <div className="team_header_left">
          <button className="team_back_btn" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <div className="team_header_content">
            <h2 className="team_title">{tx("auto.teamManagement_f603")}</h2>
            <div className="team_stats">
              <span className="team_stat">
                <Users size={16} />
                {tl(stats.total)}{" "}{tx("auto.total_b259")}
              </span>
              <span className="team_stat">
                <Activity size={16} />
                {tl(stats.active)}{" "}{tx("auto.active_a733")}
              </span>
              <span className="team_stat">
                <Crown size={16} />
                {tl(adminLimit)}{" "}{tx("auto.limit_24d9")}
              </span>
            </div>
          </div>
        </div>
        <div className="team_header_actions">
          {/* Removed buttons - moved to bottom */}
        </div>
      </div>
      {/* Action Buttons - Moved to bottom */}
      <div className="team_bottom_actions">
        <Button
          variant="secondary"
          onClick={refreshAdmins}
          disabled={loading}
          className="team_refresh_btn"
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          {tx("auto.refresh_56e3")}
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateAdmin}
          className="team_invite_btn"
          disabled={!canAddMoreAdmins()}
        >
          <UserPlus size={16} />
          {tl(canAddMoreAdmins() ? tx("auto.addAdmin_975e") : tx("tpl.limitReached_b58d", { v0: adminLimit }))}
        </Button>
      </div>

      {/* Password Display Banner */}
      {passwordDisplay && (
        <div className="team_password_banner">
          <div className="team_password_content">
            <AlertCircle className="team_password_icon" />
            <div className="team_password_info">
              <strong>{tx("auto.adminCreatedSuccessfully_5c55")}</strong>
              <p>
                {tx("auto.loginCredentialsFor_ab15")}{" "}<strong>{tl(passwordDisplay.name)}</strong> (
                {tl(passwordDisplay.email)}{tx("auto.haveBeenGenerated_7209")}
              </p>
              <div className="team_password_credentials">
                <span>{tx("auto.email_4c4e")}{" "}{tl(passwordDisplay.email)}</span>
                <span>
                  {tx("auto.password_be81")}{" "}<strong>{tl(passwordDisplay.password)}</strong>
                </span>
              </div>
              <p className="team_password_note">
                {tx("auto.weVeEmailed_98c2")}{" "}{tl(passwordDisplay.email)}{" "}{tx("auto.anInviteLinkToSet_00af")}
              </p>
            </div>
            <button
              className="team_password_close"
              onClick={() => setPasswordDisplay(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="team_content">
        {/* Admin List */}
        <div className="team_members_section">
          <AdminList
            admins={admins}
            loading={loading}
            onView={handleViewAdmin}
            onEdit={handleEditAdmin}
            onDelete={handleDeleteAdmin}
          />
        </div>

        {/* Subscription Info */}
        <div className="team_subscription_info">
          <div className="team_subscription_card">
            <Shield className="team_subscription_icon" />
            <div className="team_subscription_details">
              <h4>{tx("auto.currentPlan_cb9b")}{" "}{tl(planType)}</h4>
              <p>
                {tx("auto.adminLimit_ccab")}{" "}{tl(stats.total)} / {tl(adminLimit)}
              </p>
              {!canAddMoreAdmins() && (
                <p className="team_subscription_warning">
                  {tx("auto.youVeReachedYourAdmin_8fe4")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Form Modal */}
      <AdminForm
        open={showAdminForm}
        onClose={() => {
          setShowAdminForm(false);
          setSelectedAdmin(null);
        }}
        admin={isEditing ? selectedAdmin : null}
        onSubmit={handleSubmitAdmin}
        loading={operationLoading}
      />

      {/* View Admin Modal */}
      {showViewModal && selectedAdmin && (
        <div className="modal_overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal_content view_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal_header">
              <h3 className="modal_title">{tx("auto.adminDetails_a579")}</h3>
              <button
                className="modal_close_btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal_body">
              <div className="admin_view_info">
                <div className="admin_view_avatar">
                  <Users size={24} />
                </div>
                <div className="admin_view_details">
                  <h4>{tl(selectedAdmin.name)}</h4>
                  <p>{tl(selectedAdmin.email)}</p>
                  <div className="admin_view_meta">
                    <span className="admin_view_role">
                      {tl(selectedAdmin.role)}
                    </span>
                    <span
                      className={`admin_view_status ${selectedAdmin.status}`}
                    >
                      {tl(selectedAdmin.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin_view_permissions">
                <h5>{tx("auto.permissions_d06d")}</h5>
                <div className="admin_permissions_grid">
                  {Object.entries(selectedAdmin.permissions || {}).map(
                    ([key, value]) => (
                      <div key={key} className="admin_permission_item">
                        <div
                          className={`admin_permission_status ${
                            value ? "allowed" : "denied"
                          }`}
                        >
                          {value ? <Check size={12} /> : <X size={12} />}
                        </div>
                        <span>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="admin_view_dates">
                <div className="admin_view_date">
                  <strong>{tx("auto.created_0c78")}</strong>{" "}
                  {new Date(selectedAdmin.createdAt).toLocaleDateString(dateLocale())}
                </div>
                {selectedAdmin.lastLogin && (
                  <div className="admin_view_date">
                    <strong>{tx("auto.lastLogin_c6a4")}</strong>{" "}
                    {new Date(selectedAdmin.lastLogin).toLocaleDateString(dateLocale())}
                  </div>
                )}
              </div>
            </div>

            <div className="modal_footer">
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAdmin(selectedAdmin);
                }}
              >
                {tx("auto.editAdmin_a1bc")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPanel;
