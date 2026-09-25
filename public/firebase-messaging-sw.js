/**
 * public/firebase-messaging-sw.js
 *
 * Firebase Cloud Messaging Service Worker.
 * Handles push notifications when the browser tab is closed or in the background.
 *
 * IMPORTANT: This file must stay in the /public folder so it is served
 * from the root URL as /firebase-messaging-sw.js
 *
 * Update the firebaseConfig values below to match your project.
 * These CANNOT use import.meta.env — service workers don't support Vite env vars.
 */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyBcl7hy63ZNw3mXiJTrL7EoWqdy44eWzHk",
  authDomain:        "fashiontallycloud.firebaseapp.com",
  projectId:         "fashiontallycloud",
  storageBucket:     "fashiontallycloud.firebasestorage.app",
  messagingSenderId: "203645598940",
  appId:             "1:203645598940:web:1c52d0a8f9a27c1c704819",
});

const messaging = firebase.messaging();

// Handle background / closed tab push notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "FashionTally";
  const body  = payload.notification?.body  || "";

  self.registration.showNotification(title, {
    body,
    icon:  "/favicon.ico",   // update to your app icon path
    badge: "/favicon.ico",
    data:  payload.data || {},
  });
});

// Optional: handle notification click — open/focus the app tab
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow("/dashboard");
      }
    })
  );
});
