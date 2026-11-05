import { createContext, useContext, useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import { requestAndRegisterToken, removeDeviceToken } from "../backend/services/notification.service";

const NewAuthContext = createContext();

function getTokenExpiryMs(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return 0;
  }
}

function isTokenExpired(token) {
  const expiry = getTokenExpiryMs(token);
  if (expiry === null) return false;
  return expiry <= Date.now();
}

/** The Bearer token a fetch call is sending, if any. */
function bearerTokenOf(input, init) {
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  const value = headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : null;
}

/** Checkout link for the plan (and monthly/yearly choice) picked before signing up, if any. */
function checkoutUrlFromSignup() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  if (!plan) return null;
  const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly";
  return `/subscription?plan=${plan}&cycle=${cycle}`;
}

function isProtectedPath(path) {
  return (
    path.startsWith("/dashboard") ||
    path === "/subscription" ||
    path.startsWith("/subscription-demo")
  );
}

export const useNewAuth = () => {
  const context = useContext(NewAuthContext);
  if (!context) {
    throw new Error("useNewAuth must be used within a NewAuthProvider");
  }
  return context;
};

export const NewAuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearSession = () => {
    localStorage.removeItem("newAuthUser");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Session ran out (expiry time reached, or the backend rejected the token)
  const expireSession = () => {
    if (!localStorage.getItem("authToken")) return;
    clearSession();
    toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
    if (isProtectedPath(window.location.pathname)) {
      window.location.replace("/login");
    }
  };

  // ── Any API call whose session token is rejected (401) logs the user out ─
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      if (response.status === 401) {
        const sessionToken = localStorage.getItem("authToken");
        if (sessionToken && bearerTokenOf(input, init) === sessionToken) expireSession();
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // ── Log out the moment the token expires, even if the tab just sits open ─
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("authToken");
    const expiry = token ? getTokenExpiryMs(token) : null;
    if (!expiry) return;

    const timer = setTimeout(expireSession, Math.max(0, expiry - Date.now()));
    // Background tabs delay timers, so also check when the tab is looked at again
    const checkNow = () => {
      const current = localStorage.getItem("authToken");
      if (current && isTokenExpired(current)) expireSession();
    };
    window.addEventListener("focus", checkNow);
    document.addEventListener("visibilitychange", checkNow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", checkNow);
      document.removeEventListener("visibilitychange", checkNow);
    };
  }, [isAuthenticated, user]);

  // ── Restore session and check token expiry once on page load ─
  useEffect(() => {
    const storedUser  = localStorage.getItem("newAuthUser");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken && !isTokenExpired(storedToken)) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        clearSession();
      }
    } else if (storedToken && isTokenExpired(storedToken)) {
      clearSession();
      if (isProtectedPath(window.location.pathname)) {
        window.location.replace("/login");
      }
    }
    setLoading(false);
  }, []);

  // ── Shared helper: persist session ──────────────────────────
  const persistSession = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("newAuthUser", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ── Sign up with email/password ──────────────────────────────
  const signUpWithEmail = async (formData) => {
    try {
      const { name, email, phone, password, businessName, category, country, logoFile, emailVerificationToken } = formData;

      if (!name || !email?.trim() || !phone?.trim() || !country || !password) {
        throw new Error("Please fill in all required fields");
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Step 1: signup
      const body = new FormData();
      body.append("name", name.trim());
      body.append("email", normalizedEmail);
      body.append("phone", phone.trim());
      body.append("password", password);
      body.append("country", country.trim());
      body.append("businessName", (businessName || "").trim());
      body.append("category", (category || "").trim());
      if (logoFile) body.append("logo", logoFile);
      if (emailVerificationToken) body.append("emailVerificationToken", emailVerificationToken);

      const signupRes  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, { method: "POST", body });
      const signupData = await signupRes.json();
      if (!signupData.success) throw new Error(signupData.error || "Signup failed");

      // Step 2: auto-login to get JWT
      const loginRes  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const loginData = await loginRes.json();
      if (!loginData.success) throw new Error(loginData.error || "Auto-login failed");

      persistSession(loginData.token, loginData.user);
      toast.success(`Welcome ${name}! Account created. Your free trial has started.`);

      setTimeout(() => { window.location.href = checkoutUrlFromSignup() || "/dashboard"; }, 1000);

      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to create account");
      return { success: false, error: error.message };
    }
  };

  // ── Sign in with email/password ──────────────────────────────
  const signInWithEmail = async (email, password) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Invalid email or password");

      persistSession(data.token, data.user);
      toast.success("Welcome back!");
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);

      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
      return { success: false, error: error.message };
    }
  };

  // ── Google sign-in (internal) — called by useGoogleLogin callback ──

  // ── Sign in with Google — hook must be called at component level ─
  // This is a factory: components call useGoogleSignIn() to get the trigger fn
  // We expose signInWithGoogle as a stable function that components call directly
  const [_googleResolve, _setGoogleResolve] = useState(null);
  const [_googleReject,  _setGoogleReject]  = useState(null);

  // signInWithGoogle returns a promise; the useGoogleLogin hook below resolves it
  const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
      _setGoogleResolve(() => resolve);
      _setGoogleReject(()  => reject);
    });
  };

  // The actual Google OAuth trigger — must be defined at top level (hook rules)
  const _googleLoginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("[googleAuth] Google OAuth success, fetching user info");
      try {
        // tokenResponse.access_token → fetch user info from Google
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        console.log("[googleAuth] userInfo received:", userInfo.email);

        // Build a credential-like object — send access_token to backend
        // Backend will use google-auth-library to get user info server-side
        const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            accessToken: tokenResponse.access_token,
            email:       userInfo.email,
            name:        userInfo.name,
            picture:     userInfo.picture,
            sub:         userInfo.sub,
          }),
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.error || "Google sign-in failed");

        persistSession(data.token, data.user);

        const name = data.user?.name || "";
        toast.success(`Welcome ${name}!${data.isNewUser ? " Your free trial has started." : ""}`);

        const checkoutUrl = checkoutUrlFromSignup();
        setTimeout(() => {
          window.location.href = (checkoutUrl && data.isNewUser) ? checkoutUrl : "/dashboard";
        }, 1000);

        // Register this browser for push notifications (fire-and-forget)
        requestAndRegisterToken().catch(() => {});

        // Register this browser for push notifications (fire-and-forget)
        requestAndRegisterToken().catch(() => {});

        if (_googleResolve) _googleResolve({ success: true });
      } catch (err) {
        toast.error(err.message || "Google sign-in failed");
        if (_googleReject) _googleReject(err);
      }
    },
    onError: (err) => {
      console.error("[googleAuth] OAuth error:", err);
      toast.error("Google sign-in failed");
      if (_googleReject) _googleReject(new Error("Google OAuth failed"));
    },
    flow: "implicit",
  });

  // Wrap so components just call signInWithGoogle() and it triggers the popup
  const triggerGoogleSignIn = () => {
    _googleLoginTrigger();
    return signInWithGoogle();
  };

  // ── Sign out ─────────────────────────────────────────────────
  const signOut = async () => {
    // Remove this browser's FCM token before clearing session
    await removeDeviceToken().catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("newAuthUser");
    localStorage.removeItem("authToken");
    toast.success("Signed out successfully");
    return { success: true };
  };

  // ── Forgot password ──────────────────────────────────────────
  const resetPassword = async (email) => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send reset email");

      toast.success("Password reset email sent!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
      return { success: false, error: error.message };
    }
  };

  // ── Update user profile locally ──────────────────────────────
  const updateUserProfile = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem("newAuthUser", JSON.stringify(newUserData));
  };

  // ── Refresh user from backend ────────────────────────────────
  const refreshUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !user?.email) return null;

    try {
      const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;

      const data = await res.json();
      if (data.success && data.data) {
        const refreshed = { ...user, ...data.data };
        setUser(refreshed);
        localStorage.setItem("newAuthUser", JSON.stringify(refreshed));
        return refreshed;
      }
    } catch (err) {
      console.error("refreshUserData error:", err.message);
    }
    return null;
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle:  triggerGoogleSignIn,
    signOut,
    resetPassword,
    updateUserProfile,
    refreshUserData,
  };

  return (
    <NewAuthContext.Provider value={value}>
      <Toaster toastOptions={{ duration: 4000 }} />
      {children}
    </NewAuthContext.Provider>
  );
};

export default NewAuthContext;
