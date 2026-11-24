import { StrictMode } from "react";
import { captureReferralFromUrl } from "./utils/referral";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import "./styles/theme.css";
import "./i18n";
import App from "./App.jsx";
import { NewAuthProvider } from "./contexts/NewAuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId}>
        <NewAuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </NewAuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// Refer & Earn: remember a ?ref=CODE link for sign-up
captureReferralFromUrl();
