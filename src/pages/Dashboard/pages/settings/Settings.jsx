import { useState } from "react";
import {
  User,
  Building,
  Bell,
  Palette,
  Shield,
  Users,
  CreditCard,
  HelpCircle,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useNewAuth } from "../../../../contexts/NewAuthContext";
import { useSubscription } from "../../../../hooks/use-subscription";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import ProfilePanel from "../../../../pannel_pages/ProfilePanel";
import BrandPanel from "../../../../pannel_pages/BrandPanel";
import NotificationPanel from "../../../../pannel_pages/NotificationPanel";
import AppearancePanel from "../../../../pannel_pages/AppearancePanel";
import SecurityPanel from "../../../../pannel_pages/SecurityPanel";
import TeamPanel from "../../../../pannel_pages/TeamPanel";
import SubscriptionPanel from "../../../../pannel_pages/SubscriptionPanel";
import HelpPanel from "../../../../pannel_pages/HelpPanel";
import "./Settings.css";

const Settings = () => {
  const { isDark, actualTheme } = useTheme();
  const { signOut, user } = useNewAuth();
  const subscription = useSubscription();
  const [activeSection, setActiveSection] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showAppearancePanel, setShowAppearancePanel] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  // Use the new auth system
  const currentUser = user;
  const currentSignOut = signOut;

  const handleProfileClick = () => {
    setShowProfilePanel(true);
  };

  const handleCloseProfile = () => {
    setShowProfilePanel(false);
  };

  const handleBrandClick = () => {
    setShowBrandPanel(true);
  };

  const handleCloseBrand = () => {
    setShowBrandPanel(false);
  };

  const handleNotificationClick = () => {
    setShowNotificationPanel(true);
  };

  const handleCloseNotification = () => {
    setShowNotificationPanel(false);
  };

  const handleAppearanceClick = () => {
    setShowAppearancePanel(true);
  };

  const handleCloseAppearance = () => {
    setShowAppearancePanel(false);
  };

  const handleSecurityClick = () => {
    setShowSecurityPanel(true);
  };

  const handleCloseSecurity = () => {
    setShowSecurityPanel(false);
  };

  const handleTeamClick = () => {
    setShowTeamPanel(true);
  };

  const handleCloseTeam = () => {
    setShowTeamPanel(false);
  };

  const handleSubscriptionClick = () => {
    setShowSubscriptionPanel(true);
  };

  const handleCloseSubscription = () => {
    setShowSubscriptionPanel(false);
  };

  const handleHelpClick = () => {
    setShowHelpPanel(true);
  };

  const handleCloseHelp = () => {
    setShowHelpPanel(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const result = await currentSignOut();
      if (result.success) {
        // Clear any local storage or session data
        localStorage.clear();
        sessionStorage.clear();

        // Small delay to show success state
        setTimeout(() => {
          // Navigate to login page
          window.location.href = "/login";
        }, 500);
      } else {
        setLogoutError(result.error || "Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError("An unexpected error occurred. Please try again.");
    } finally {
      // Keep loading state for a bit longer to show feedback
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }
  };

  // Custom SVG Icons
  const LocationIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const EmailIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="22,6 12,13 2,6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const PhoneIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Get user display name
  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (currentUser?.firstName) return currentUser.firstName;
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "------";
  };

  // Get user initials for logo
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === "------") return "??";

    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get subscription status text
  const getSubscriptionStatus = () => {
    if (subscription.loading) return "Loading...";
    if (subscription.isTrialActive) return `${subscription.planType} (Trial)`;
    if (subscription.isSubscribed) return subscription.planType;
    return "Free";
  };

  // Get user role/type
  const getUserRole = () => {
    if (currentUser?.role) return currentUser.role;
    if (currentUser?.businessType) return currentUser.businessType;
    return "------";
  };

  // Helper function to display data or dashes if no data
  const getDisplayValue = (value, fallback = "------") => {
    if (
      !value ||
      value === "user@fashionhub.com" ||
      value === "+234 800 000 0000" ||
      value === "Lagos, Nigeria"
    ) {
      return fallback;
    }
    return value;
  };

  // Settings data using JSON structure with theme-aware colors
  const settingsData = {
    businessInfo: {
      name: getUserDisplayName(),
      type: getUserRole(),
      address: getDisplayValue(currentUser?.address || currentUser?.location),
      email: getDisplayValue(currentUser?.email),
      phone: getDisplayValue(currentUser?.phone || currentUser?.phoneNumber),
      plan: getSubscriptionStatus(),
      joinedDate: currentUser?.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString()
        : "Recently",
      uid: currentUser?.uid || "N/A",
    },
    settingsSections: [
      {
        id: "profile",
        title: "Profile",
        description: "Personal details",
        icon: User,
        color: "var(--primary-color)",
      },
      {
        id: "brand",
        title: "Brand",
        description: "Business information",
        icon: Building,
        color: "var(--primary-color)",
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "Alerts & preferences",
        icon: Bell,
        color: "var(--primary-color)",
      },
      {
        id: "appearance",
        title: "Appearance",
        description: "Theme settings",
        icon: Palette,
        color: "var(--primary-color)",
      },
      {
        id: "security",
        title: "Security",
        description: "Password & authentication",
        icon: Shield,
        color: "var(--primary-color)",
      },
      {
        id: "team",
        title: "Team",
        description: "Manage team members",
        icon: Users,
        color: "var(--primary-color)",
      },
      {
        id: "subscription",
        title: "Subscription",
        description: "Plan & billing",
        icon: CreditCard,
        color: "var(--primary-color)",
      },
      {
        id: "help",
        title: "Help Center",
        description: "FAQs and documentation",
        icon: HelpCircle,
        color: "var(--primary-color)",
      },
    ],
  };

  return (
    <div className="sett_settings_management">
      {/* Header */}
      <div className="sett_settings_header">
        <div className="sett_header_content">
          <h1 className="sett_settings_title">Settings</h1>
          <div className="sett_header_actions">
            {logoutError && (
              <div className="sett_logout_error">{logoutError}</div>
            )}
            <Button
              variant="primary"
              size="medium"
              onClick={handleLogout}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              icon={<LogOut size={16} />}
              iconPosition="left"
              className="sett_logout_btn"
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      <div className="sett_business_info_card">
        <div className="sett_ipo">
          <div className="sett_ipols">
            <h1>Settings</h1>
            <p>Manage your settings</p>
          </div>
        </div>
        <div className="sett_business_logo">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="sett_logo_image"
            />
          ) : (
            <span className="sett_logo_text">{getUserInitials()}</span>
          )}
        </div>
        <div className="sett_business_details">
          <h2 className="sett_business_name">
            {settingsData.businessInfo.name}
          </h2>
          {/* <p className="sett_business_type">{settingsData.businessInfo.type}</p> */}

          <div className="sett_business_contact">
            <div className="sett_contact_row">
              <LocationIcon />
              <span className="sett_contact_text">
                {settingsData.businessInfo.address}
              </span>
            </div>
            <div className="sett_contact_row">
              <EmailIcon />
              <span className="sett_contact_text">
                {settingsData.businessInfo.email}
              </span>
            </div>
            <div className="sett_contact_row">
              <PhoneIcon />
              <span className="sett_contact_text">
                {settingsData.businessInfo.phone}
              </span>
            </div>
          </div>

          <div className="sett_current_plan">
            <span className="sett_plan_label">Current Plan</span>
            <span
              className={`sett_plan_value ${
                subscription.isTrialActive
                  ? "trial"
                  : subscription.isSubscribed
                  ? "active"
                  : "free"
              }`}
            >
              {settingsData.businessInfo.plan}
            </span>
          </div>
        </div>
        <div className="sett_business_actions">
          <Button
            variant="primary"
            size="small"
            onClick={handleLogout}
            loading={isLoggingOut}
            disabled={isLoggingOut}
            icon={<LogOut size={14} />}
            iconPosition="left"
            className="sett_mobile_logout_btn"
          >
            {isLoggingOut ? "Signing out..." : "Logout"}
          </Button>
          {logoutError && (
            <div className="sett_mobile_logout_error">{logoutError}</div>
          )}
        </div>
      </div>

      <div className="sett_jkj">
        {/* Settings Grid */}
        <div className="sett_settings_grid">
          {settingsData.settingsSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
                className="sett_settings_card"
                onClick={() => {
                  if (section.id === "profile") {
                    handleProfileClick();
                  } else if (section.id === "brand") {
                    handleBrandClick();
                  } else if (section.id === "notifications") {
                    handleNotificationClick();
                  } else if (section.id === "appearance") {
                    handleAppearanceClick();
                  } else if (section.id === "security") {
                    handleSecurityClick();
                  } else if (section.id === "team") {
                    handleTeamClick();
                  } else if (section.id === "subscription") {
                    handleSubscriptionClick();
                  } else if (section.id === "help") {
                    handleHelpClick();
                  } else {
                    setActiveSection(section.id);
                  }
                }}
              >
                <div className="sett_settings_card_content">
                  <div className="sett_settings_icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="sett_settings_info">
                    <h3 className="sett_settings_card_title">
                      {section.title}
                    </h3>
                    <p className="sett_settings_card_description">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="sett_settings_arrow" size={20} />
              </div>
            );
          })}
        </div>

        {/* Profile Panel */}
        <SlideInMenu
          isShow={showProfilePanel}
          onClose={handleCloseProfile}
          position="rightt"
          width="480px"
        >
          <ProfilePanel onClose={handleCloseProfile} />
        </SlideInMenu>

        {/* Brand Panel */}
        <SlideInMenu
          isShow={showBrandPanel}
          onClose={handleCloseBrand}
          position="rightt"
          width="480px"
        >
          <BrandPanel onClose={handleCloseBrand} />
        </SlideInMenu>

        {/* Notification Panel */}
        <SlideInMenu
          isShow={showNotificationPanel}
          onClose={handleCloseNotification}
          position="rightt"
          width="480px"
        >
          <NotificationPanel onClose={handleCloseNotification} />
        </SlideInMenu>

        {/* Appearance Panel */}
        <SlideInMenu
          isShow={showAppearancePanel}
          onClose={handleCloseAppearance}
          position="rightt"
          width="480px"
        >
          <AppearancePanel onClose={handleCloseAppearance} />
        </SlideInMenu>

        {/* Security Panel */}
        <SlideInMenu
          isShow={showSecurityPanel}
          onClose={handleCloseSecurity}
          position="rightt"
          width="480px"
        >
          <SecurityPanel onClose={handleCloseSecurity} />
        </SlideInMenu>

        {/* Team Panel */}
        <SlideInMenu
          isShow={showTeamPanel}
          onClose={handleCloseTeam}
          position="rightt"
          width="480px"
        >
          <TeamPanel onClose={handleCloseTeam} />
        </SlideInMenu>

        {/* Subscription Panel */}
        <SlideInMenu
          isShow={showSubscriptionPanel}
          onClose={handleCloseSubscription}
          position="rightt"
          width="480px"
        >
          <SubscriptionPanel onClose={handleCloseSubscription} />
        </SlideInMenu>

        {/* Help Panel */}
        <SlideInMenu
          isShow={showHelpPanel}
          onClose={handleCloseHelp}
          position="rightt"
          width="480px"
        >
          <HelpPanel onClose={handleCloseHelp} />
        </SlideInMenu>
      </div>
    </div>
  );
};

export default Settings;
