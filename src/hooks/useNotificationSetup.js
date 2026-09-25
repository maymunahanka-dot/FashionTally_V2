/**
 * hooks/useNotificationSetup.js
 *
 * - Shows a native browser notification for foreground FCM messages
 *   (when the tab is open — service worker only handles background)
 * - Automatically asks for permission once if not yet decided
 */

import { useEffect } from "react";
import { messaging, onMessage } from "../backend/firebase.config";
import { requestAndRegisterToken } from "../backend/services/notification.service";

const SETUP_KEY = "fcm_setup_done";

export const useNotificationSetup = () => {
  useEffect(() => {
    if (!messaging) return;

    // ── 1. Listen for foreground messages and show native notification ──
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message received:", payload);

      const title = payload.notification?.title || "FashionTally";
      const body  = payload.notification?.body  || "";
      const icon  = "/favicon.ico";

      // Use the Notifications API directly — service worker isn't involved for foreground
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon });
      }
    });

    // ── 2. Auto-register token if permission already granted ────────────
    // (handles the case where user granted permission in a previous session
    //  but the token hasn't been registered yet e.g. after clearing storage)
    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      !localStorage.getItem("fcmDeviceToken") &&
      !sessionStorage.getItem(SETUP_KEY)
    ) {
      sessionStorage.setItem(SETUP_KEY, "1");
      setTimeout(() => {
        requestAndRegisterToken().catch(() => {});
      }, 1500);
    }

    return () => unsubscribe();
  }, []);
};
