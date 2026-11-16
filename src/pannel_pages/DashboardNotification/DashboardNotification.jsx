import { useState, useEffect, useCallback, createElement } from "react";
import { useNavigate } from "react-router-dom";
import { X, Bell, Megaphone, CircleCheck, CalendarClock, CircleAlert, CircleX, ArrowRight } from "lucide-react";
import "./DashboardNotification.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";


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
  return new Date(isoStr).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" });
};

/** Icon and colour for each notification type (anything unknown shows as an announcement). */
const TYPE_STYLE = {
  broadcast:              { icon: Megaphone,     tone: "broadcast" },
  payment_success:        { icon: CircleCheck,   tone: "payment" },
  plan_ending:            { icon: CalendarClock, tone: "plan" },
  plan_expired:           { icon: CircleAlert,   tone: "invoice" },
  subscription_cancelled: { icon: CircleX,       tone: "invoice" },
};
const LINK_LABEL = {
  payment_success: "View subscription",
  plan_ending: "Renew plan",
  plan_expired: "Renew plan",
  subscription_cancelled: "Choose a plan",
};

const DashboardNotification = ({ onClose, onReadChange }) => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onReadChange?.(0);
    } catch (e) {
      console.error("[Notifications] mark all read error:", e);
    }
  };

  const openLink = (n) => {
    if (!n.isRead) markRead(n.id);
    onClose?.();
    navigate(n.url);
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
        <h2 className="dash_notif_title">{tx("auto.notifications_753a")}</h2>
        {unreadCount > 0 && (
          <span className="dash_notif_header_badge">{tl(unreadCount)}</span>
        )}
        {unreadCount > 0 && (
          <button className="dash_notif_mark_all_btn" onClick={markAllRead}>
            {tx("auto.markAllAsRead_1b83")}
          </button>
        )}
      </div>

      {/* List */}
      <div className="dash_notif_list">
        {loading ? (
          <div className="dash_notif_empty">
            <div className="dash_notif_spinner" />
            <p>{tx("auto.loading_33ce")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash_notif_empty">
            <Bell size={40} strokeWidth={1.2} />
            <p>{tx("auto.noNotificationsYet_d260")}</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className={`dash_notif_item ${n.isRead ? "read" : "unread"}`}>
              <div className="dash_notif_content">
                <div className="dash_notif_left">
                  <div className={`dash_notif_icon ${(TYPE_STYLE[n.type] || TYPE_STYLE.broadcast).tone}`}>
                    {tl(createElement((TYPE_STYLE[n.type] || TYPE_STYLE.broadcast).icon, { size: 18 }))}
                  </div>
                  <div className="dash_notif_details">
                    <h4 className="dash_notif_item_title">{tl(n.title)}</h4>
                    <p className="dash_notif_description">{tl(n.body)}</p>
                  </div>
                </div>
                <div className="dash_notif_right">
                  {!n.isRead && <div className="dash_notif_unread_dot" />}
                  <span className="dash_notif_time">{tl(formatTime(n.sentAt))}</span>
                </div>
              </div>
              {(!n.isRead || n.url) && (
                <div className="dash_notif_actions">
                  {n.url && (
                    <button className="dash_notif_link_btn" onClick={() => openLink(n)}>
                      {tl(LINK_LABEL[n.type] || tx("auto.open_cf9b"))} <ArrowRight size={13} />
                    </button>
                  )}
                  {!n.isRead && (
                    <button className="dash_notif_mark_read_btn" onClick={() => markRead(n.id)}>
                      {tx("auto.markAsRead_2b94")}
                    </button>
                  )}
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
