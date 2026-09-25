import { useState, useEffect } from "react";
import { ArrowLeft, Bell, BellOff, Smartphone } from "lucide-react";
import { requestAndRegisterToken, toggleDeviceNotification } from "../../backend/services/notification.service";
import "./NotificationPanel.css";

const NotificationPanel = ({ onClose }) => {
  const [permissionState, setPermissionState] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [deviceEnabled, setDeviceEnabled] = useState(() => {
    const token = localStorage.getItem("fcmDeviceToken");
    return !!(token && "Notification" in window && Notification.permission === "granted");
  });
  const [loading, setLoading]     = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Sync on open
  useEffect(() => {
    const token = localStorage.getItem("fcmDeviceToken");
    if (token && Notification.permission === "granted") {
      setDeviceEnabled(true);
    } else {
      setDeviceEnabled(false);
    }
    if (Notification.permission === "denied") {
      setStatusMsg("Notifications are blocked. Click the lock icon in the address bar → Notifications → Allow.");
    }
  }, []);

  // ── Toggle handler ───────────────────────────────────────────
  const handleToggle = async () => {
    if (loading) return;

    const existingToken = localStorage.getItem("fcmDeviceToken");

    if (permissionState === "default" || !existingToken) {
      setLoading(true);
      setStatusMsg("Requesting permission...");
      const token = await requestAndRegisterToken();
      setPermissionState(Notification.permission);
      if (token) {
        setDeviceEnabled(true);
        setStatusMsg("Push notifications enabled for this device.");
      } else {
        setDeviceEnabled(false);
        setStatusMsg(
          Notification.permission === "denied"
            ? "Permission denied. Allow notifications in your browser settings."
            : "Could not enable notifications. Please try again."
        );
      }
      setLoading(false);
      return;
    }

    if (permissionState === "denied") {
      setStatusMsg("Notifications are blocked. Click the lock icon → Notifications → Allow.");
      return;
    }

    setLoading(true);
    const newState = !deviceEnabled;

    if (!newState) {
      const result = await toggleDeviceNotification(false);
      if (result.success) {
        setDeviceEnabled(false);
        setStatusMsg("Push notifications disabled for this device.");
      } else {
        setStatusMsg("Failed to update. Please try again.");
      }
    } else {
      const token = await requestAndRegisterToken();
      if (token) {
        await toggleDeviceNotification(true);
        setDeviceEnabled(true);
        setStatusMsg("Push notifications enabled for this device.");
      } else {
        setStatusMsg("Could not re-enable notifications. Please try again.");
      }
    }

    setLoading(false);
  };

  // ── Derived state ────────────────────────────────────────────
  const isOn          = permissionState === "granted" && deviceEnabled;
  const isBlocked     = permissionState === "denied";
  const isUnsupported = permissionState === "unsupported";

  const getStatusLabel = () => {
    if (isUnsupported) return "Not supported in this browser";
    if (isBlocked)     return "Blocked in browser settings";
    if (isOn)          return "Enabled for this device";
    if (permissionState === "default") return "Click to enable";
    return "Disabled";
  };

  const ToggleSwitch = () => (
    <div
      className={`notif_toggle_switch ${isOn ? "notif_toggle_on" : "notif_toggle_off"} ${(isBlocked || isUnsupported || loading) ? "notif_toggle_disabled" : ""}`}
      onClick={(!isBlocked && !isUnsupported) ? handleToggle : undefined}
      role="switch"
      aria-checked={isOn}
      aria-label="Push notifications"
    >
      <div className="notif_toggle_slider"></div>
    </div>
  );

  return (
    <div className="notif_panel">
      {/* Header */}
      <div className="notif_header">
        <button className="notif_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="notif_header_content">
          <h2 className="notif_title">Notifications</h2>
          <p className="notif_subtitle">Manage push notifications</p>
        </div>
      </div>

      {/* Content */}
      <div className="notif_content">
        <div className="notif_section">

          {/* Push Notifications toggle */}
          <div className="notif_item">
            <div className="notif_item_content">
              <div className={`notif_item_icon ${isOn ? "notif_icon_active" : ""}`}>
                {isOn ? <Bell size={20} /> : <BellOff size={20} />}
              </div>
              <div className="notif_item_info">
                <h4 className="notif_item_title">Push Notifications</h4>
                <p className="notif_item_description">{getStatusLabel()}</p>
              </div>
            </div>
            {loading
              ? <div className="notif_loading_spinner" />
              : <ToggleSwitch />
            }
          </div>

          {/* Device active row */}
          {isOn && (
            <div className="notif_device_row">
              <Smartphone size={14} />
              <span>Notifications active on this browser</span>
            </div>
          )}

          {/* Status / hint message */}
          {statusMsg && (
            <p className={`notif_status_msg ${isBlocked ? "notif_status_warn" : "notif_status_info"}`}>
              {statusMsg}
            </p>
          )}

          {permissionState === "default" && !statusMsg && (
            <p className="notif_status_msg notif_status_info">
              Toggle on to allow FashionTally to send you push notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
