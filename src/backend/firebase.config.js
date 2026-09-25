// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBcl7hy63ZNw3mXiJTrL7EoWqdy44eWzHk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "fashiontallycloud.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fashiontallycloud",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "fashiontallycloud.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "203645598940",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:203645598940:web:1c52d0a8f9a27c1c704819",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W9HLR3B4CM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Messaging — only available in browsers that support service workers
let messaging = null;
try {
  messaging = getMessaging(app);
  console.log("[FCM] Messaging initialized ✅");
} catch (err) {
  console.warn("[FCM] Messaging not supported in this environment:", err.message);
}

export { messaging, getToken, onMessage };
