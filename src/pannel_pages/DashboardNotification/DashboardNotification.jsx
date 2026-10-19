import { useState, useEffect, useCallback } from "react";
import { X, Bell, Megaphone } from "lucide-react";
import "./DashboardNotification.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatTime = (isoStr) => {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "Just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const DashboardNotification = ({ onClose, onReadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BACKEND_URL}/api/admin/notifications/user/list`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        onReadChange?.(data.data.filter((n) => !n.isRead).length);
      }
    } catch (e) {
      console.error("[Notifications] fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/notifications/user/read/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      setNotifications((prev) => {
        const updated = prev.map((n) => n.id === id ? { ...n, isRead: true } : n);
        onReadChange?.(updated.filter((n) => !n.isRead).length);
        return updated;
      });
    } catch (e) {
      console.error("[Notifications] mark read error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/notifications/user/read-all`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, isRead: true }));
        onReadChange?.(0);
        return updated;
      });
    } catch (e) {
      console.error("[Notifications] mark all read error:", e);
    }
  };

  const filtered = notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dash_notif_panel">
      {/* Header */}
      <div className="dash_notif_header">
        <button className="dash_notif_close_btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="dash_notif_title">Notifications</h2>
        {unreadCount > 0 && (
          <span className="dash_notif_header_badge">{unreadCount}</span>
        )}
      </div>

      {/* List */}
      <div className="dash_notif_list">
        {loading ? (
          <div className="dash_notif_empty">
            <div className="dash_notif_spinner" />
            <p>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash_notif_empty">
            <Bell size={40} strokeWidth={1.2} />
            <p>No notifications yet</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className={`dash_notif_item ${n.isRead ? "read" : "unread"}`}>
              <div className="dash_notif_content">
                <div className="dash_notif_left">
                  <div className="dash_notif_icon broadcast">
                    <Megaphone size={18} />
                  </div>
                  <div className="dash_notif_details">
                    <h4 className="dash_notif_item_title">{n.title}</h4>
                    <p className="dash_notif_description">{n.body}</p>
                  </div>
                </div>
                <div className="dash_notif_right">
                  {!n.isRead && <div className="dash_notif_unread_dot" />}
                  <span className="dash_notif_time">{formatTime(n.sentAt)}</span>
                </div>
              </div>
              {!n.isRead && (
                <div className="dash_notif_actions">
                  <button className="dash_notif_mark_read_btn" onClick={() => markRead(n.id)}>
                    ✓ Mark as read
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardNotification;
