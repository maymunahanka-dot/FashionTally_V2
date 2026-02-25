import { useEffect } from "react";
import "./App.css";
import "./styles/theme.css";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useNewAuth } from "./contexts/NewAuthContext";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy/CookiePolicy";
import NewSignup from "./pages/NewSignup/NewSignup";
import NewLogin from "./pages/NewLogin/NewLogin";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import Subscription from "./pages/Subscription/Subscription";
import { SubscriptionDemo } from "./components/SubscriptionDemo";
import SubscriptionCallback from "./pages/SubscriptionCallback/SubscriptionCallback";
import ScheduleDemo from "./pages/ScheduleDemo/ScheduleDemo";
import Loading from "./components/Loading/Loading";

function App() {
  const { user, loading } = useNewAuth();
  console.log("Auth User:", user);
  const navigate = useNavigate();

  // Use the new auth system
  const currentUser = user;
  const isLoading = loading;

  useEffect(() => {
    if (!isLoading) {
      // Redirect to dashboard if user is logged in and tries to access auth pages
      if (
        currentUser &&
        (window.location.pathname === "/login" ||
          window.location.pathname === "/signup")
      ) {
        navigate("/dashboard");
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return <Loading message="Loading Fashion Tally..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/schedule-demo" element={<ScheduleDemo />} />
      <Route
        path="/login"
        element={!currentUser ? <NewLogin /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/signup"
        element={!currentUser ? <NewSignup /> : <Navigate to="/dashboard" />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard/*"
        element={currentUser ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/subscription"
        element={currentUser ? <Subscription /> : <Navigate to="/login" />}
      />
      <Route path="/subscription/callback" element={<SubscriptionCallback />} />
      <Route
        path="/subscription-demo"
        element={currentUser ? <SubscriptionDemo /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
