/**
 * src/backend/services/notification.service.js
 *
 * Handles all FCM notification operations on the web frontend:
 *   - requestAndRegisterToken()  — ask browser permission + get FCM token + save to backend
 *   - toggleDeviceNotification() — turn notifications on/off for this browser
 *   - removeDeviceToken()        — call on logout to remove this browser's token
 *   - listenForForegroundMessages() — show in-app notification when tab is active
 *
 * Call requestAndRegisterToken() right after a successful login.
 */

import { messaging, getToken, onMessage } from "../firebase.config";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VAPID_KEY   = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ── Helper: get auth token from localStorage ──────────────────────────────────
const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Store this browser's FCM token so we can reference it for toggle/remove ───
const FCM_TOKEN_KEY = "fcmDeviceToken";

// ── Request permission, get FCM token, and register it with the backend ───────
export const requestAndRegisterToken = async () => {
  try {
    if (!messaging) {
      console.warn("[FCM] Messaging is null — Firebase Messaging failed to initialize. Check browser console for earlier errors.");
      return null;
    }

    // Check if notifications are supported by this browser
    if (!("Notification" in window)) {
      console.warn("[FCM] This browser does not support notifications");
      return null;
    }

    console.log("[FCM] Current permission state:", Notification.permission);

    // 1. Ask browser for notification permission
    const permission = await Notification.requestPermission();
    console.log("[FCM] Permission result:", permission);

    if (permission !== "granted") {
      console.log("[FCM] Notification permission not granted — user chose:", permission);
      return null;
    }

    if (!VAPID_KEY) {
      console.error("[FCM] VITE_FIREBASE_VAPID_KEY is not set in .env.local — cannot get FCM token");
      return null;
    }

    // 2. Get the FCM token (requires the service worker to be registered)
    console.log("[FCM] Requesting FCM token...");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.warn("[FCM] No token received — check that firebase-messaging-sw.js is in /public and VAPID key is correct");
      return null;
    }

    console.log("[FCM] Token received ✅");

    // 3. Save token locally so we can reference it for toggle/remove
    localStorage.setItem(FCM_TOKEN_KEY, token);

    // 4. Register the token with the backend
    const deviceName = `${getBrowserName()} / ${getOSName()}`;

    const res = await fetch(`${BACKEND_URL}/api/user/fcm-token`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body:    JSON.stringify({ token, platform: "web", deviceName }),
    });

    const data = await res.json();
    if (data.success) {
      console.log("[FCM] ✅ Device registered for notifications");
    } else {
      console.warn("[FCM] Backend rejected token:", data.error);
    }

    return token;
  } catch (error) {
    // Never block the login flow — fail silently
    console.error("[FCM] ❌ Error registering token:", error.message);
    return null;
  }
};

// ── Toggle notifications on or off for this browser ───────────────────────────
// enabled: true = turn ON, false = turn OFF
export const toggleDeviceNotification = async (enabled) => {
  try {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (!token) {
      console.warn("[FCM] No local token found — cannot toggle");
      return { success: false, error: "No device token found" };
    }

    const res = await fetch(`${BACKEND_URL}/api/user/notifications/toggle`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body:    JSON.stringify({ token, enabled }),
    });

    const data = await res.json();
    if (data.success) {
      console.log(`[FCM] Notifications ${enabled ? "enabled" : "disabled"} for this browser`);
    }
    return data;
  } catch (error) {
    console.error("[FCM] ❌ Error toggling notifications:", error.message);
    return { success: false, error: error.message };
  }
};

// ── Remove this browser's token on logout ─────────────────────────────────────
export const removeDeviceToken = async () => {
  try {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (!token) return; // Nothing to remove

    await fetch(`${BACKEND_URL}/api/user/fcm-token`, {
      method:  "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body:    JSON.stringify({ token }),
    });

    localStorage.removeItem(FCM_TOKEN_KEY);
    console.log("[FCM] ✅ Device token removed on logout");
  } catch (error) {
    console.error("[FCM] ❌ Error removing token:", error.message);
  }
};

// ── Listen for foreground messages (when the tab is open and active) ──────────
// Pass a callback: listenForForegroundMessages((payload) => showToast(...))
export const listenForForegroundMessages = (callback) => {
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message received:", payload);
    if (callback) callback(payload);
  });
};

// ── Helpers: detect browser and OS name for deviceName ───────────────────────
const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg"))  return "Chrome";
  if (ua.includes("Firefox"))  return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg"))      return "Edge";
  return "Browser";
};

const getOSName = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac"))     return "macOS";
  if (ua.includes("Linux"))   return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown OS";
};
