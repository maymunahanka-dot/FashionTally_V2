// firebase-messaging-sw.js
// Must be at the root of the domain for Firebase Web Push to work on all browsers including Safari

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

// Handle background messages (when tab is not active)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || "FashionTally", {
    body:  body  || "",
    icon:  icon  || "/favicon.ico",
    badge: "/favicon.ico",
    data:  payload.data || {},
  });
});

// Clicking a notification opens the page it's about (data.url, set by the backend),
// reusing an open FashionTally tab when there is one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const path = data.url || data.FCM_MSG?.data?.url || "/dashboard";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.location.origin));
      if (open) {
        open.navigate(target);
        return open.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
