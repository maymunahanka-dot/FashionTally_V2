import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";

import { TbUsersGroup } from "react-icons/tb";
import { SiHackthebox } from "react-icons/si";
import { MdOutlineColorLens } from "react-icons/md";
import { CiDeliveryTruck } from "react-icons/ci";
import { TbInvoice } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { FaArrowTrendUp } from "react-icons/fa6";
import { TbUserStar } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { RiApps2AiLine } from "react-icons/ri";
import { MdSupportAgent } from "react-icons/md";
// FASHION REFAB (paused): uncomment to turn it back on
// import { GiRolledCloth } from "react-icons/gi";

import "./Sidebar.css";
import logo from "../../assets/Image/logog.png";

import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const Sidebar = () => {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useNewAuth();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Brand data state
  const [brandData, setBrandData] = useState({
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    logoUrl: "",
  });

  const menuItems = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: <RiApps2AiLine className="sidebar-icon" />,
      path: "/dashboard",
    },
    {
      id: "clients",
      label: t("nav.clients"),
      icon: <TbUsersGroup className="sidebar-icon" />,
      path: "/dashboard/clients",
    },
    {
      id: "inventory",
      label: t("nav.inventory"),
      icon: <SiHackthebox className="sidebar-icon" />,
      path: "/dashboard/inventory",
    },
    {
      id: "designs",
      label: t("nav.designs"),
      icon: <MdOutlineColorLens className="sidebar-icon" />,
      path: "/dashboard/designs",
    },
    {
      id: "orders",
      label: t("nav.orders"),
      icon: <CiDeliveryTruck className="sidebar-icon" />,
      path: "/dashboard/orders",
    },
    {
      id: "invoice",
      label: t("nav.invoice"),
      icon: <TbInvoice className="sidebar-icon" />,
      path: "/dashboard/invoice",
    },
    {
      id: "appointments",
      label: t("nav.appointments"),
      icon: <SlCalender className="sidebar-icon" />,
      path: "/dashboard/appointments",
    },
    {
      id: "finances",
      label: t("nav.finances"),
      icon: <FaArrowTrendUp className="sidebar-icon" />,
      path: "/dashboard/finances",
    },
    {
      id: "crm",
      label: t("nav.crm"),
      icon: <TbUserStar className="sidebar-icon" />,
      path: "/dashboard/crm",
    },
    // FASHION REFAB (paused): uncomment to turn it back on
    // {
    //   id: "refab",
    //   label: tl("Fashion Refab"),
    //   icon: <GiRolledCloth className="sidebar-icon" />,
    //   path: "/dashboard/refab",
    // },
    {
      id: "settings",
      label: t("nav.settings"),
      icon: <IoSettingsOutline className="sidebar-icon" />,
      path: "/dashboard/settings",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    setIsMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Close sidebar on left swipe when open
    if (isLeftSwipe && isMobileOpen) {
      setIsMobileOpen(false);
    }
    // Open sidebar on right swipe from left edge when closed
    if (isRightSwipe && !isMobileOpen && touchStart < 50) {
      setIsMobileOpen(true);
    }
  };

  // Load brand data
  useEffect(() => {
    const loadBrandData = async () => {
      if (!user?.email) return;
      try {
        const effectiveEmail = getEffectiveUserEmail(user);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/brand-setting/get-by-email/${effectiveEmail}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          setBrandData({
            businessName:    d.businessName || "",
            businessAddress: d.businessAddress || "",
            businessPhone:   d.businessPhone || "",
            businessEmail:   d.businessEmail || "",
            logoUrl:         d.logoUrl || "",
          });
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
      }
    };
    loadBrandData();
  }, [user]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".sidebar-lever")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Draggable Lever Handle */}
      <div
        className={`sidebar-lever ${isMobileOpen ? "sidebar-lever-open" : ""}`}
        onClick={toggleMobileSidebar}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="lever-handle">
          <div className="lever-grip"></div>
          <div className="lever-grip"></div>
          <div className="lever-grip"></div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={`mobile-overlay ${isMobileOpen ? "active" : ""}`}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sidebar-header">
          <img src={logo} alt="FashionTally" className="sidebar-logo" />
          <h2 className="sidebar-title">FashionTally</h2>
        </div>

        {/* Brand Info Section */}
        {brandData.businessName && (
          <div className="sidebar-brand-info">
            <div className="brand-info-container">
              <div className="brand-logo-container">
                {brandData.logoUrl ? (
                  <img
                    src={brandData.logoUrl}
                    alt={brandData.businessName}
                    className="brand-logo-img"
                  />
                ) : (
                  <div className="brand-logo-placeholder">
                    {brandData.businessName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="brand-details">
                <h3 className="brand-name">{tl(brandData.businessName)}</h3>
                {brandData.businessAddress && (
                  <p className="brand-address">{tl(brandData.businessAddress)}</p>
                )}
                {brandData.businessPhone && (
                  <p className="brand-contact">{tl(brandData.businessPhone)}</p>
                )}
                {brandData.businessEmail && (
                  <p className="brand-contact">{tl(brandData.businessEmail)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  className={`sidebar-link ${
                    isActive(item.path) ? "sidebar-link-active" : ""
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {tl(item.icon)}
                  <span className="sidebar-label">{tl(item.label)}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Bottom Section */}
          <div className="sidebar-settings">
            {/* App Download Buttons */}
            <div className="sidebar-app-downloads">
              {/* Expert Support */}
              <a
                href="https://wa.me/2347070274857"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-support-btn"
              >
                <MdSupportAgent className="support-icon" />
                <span className="support-label">{t("nav.support")}</span>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.fashion.fashiontally&pli=1"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-download-btn"
              >
                {/* Google Play SVG */}
                <svg className="store-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M48 59.5v393c0 17 19.4 26.7 32.7 16.2l176-139.5-176-139.5L48.7 43.3C48.3 45.3 48 47.4 48 59.5z" fill="#32BBFF"/>
                  <path d="M400.3 240.5l-54.5-34.3-67.8 50.6 67.8 50.6 55.4-34.9c15.8-9.9 15.8-22.1-.9-32z" fill="#FFD400"/>
                  <path d="M80.7 475.7c4.7 3.7 10.5 5.5 16.3 5.5 6.2 0 12.4-1.9 17.8-5.7l218.2-137.3-67.8-50.6L80.7 475.7z" fill="#FF3333"/>
                  <path d="M114.8 36.5L333 173.8l-67.8 50.6L47 58.7c5.3-17.1 21-28.8 36.5-28.8 10.8 0 21.8 4.3 31.3 6.6z" fill="#00DB00"/>
                </svg>
                <div className="store-btn-text">
                  <span className="store-btn-sub">{tx("auto.getItOn_bd8e")}</span>
                  <span className="store-btn-main">{tx("auto.googlePlay_da68")}</span>
                </div>
              </a>
              <a
                href="https://apps.apple.com/gb/app/fashion-tally/id6769135696"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-download-btn"
              >
                {/* Apple SVG */}
                <svg className="store-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor"/>
                </svg>
                <div className="store-btn-text">
                  <span className="store-btn-sub">{tx("auto.downloadOnThe_aa63")}</span>
                  <span className="store-btn-main">{tx("auto.appStore_c3e0")}</span>
                </div>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
