import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TbUsersGroup, TbUserStar } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { FaArrowTrendUp } from "react-icons/fa6";
import { SiHackthebox } from "react-icons/si";
import { MdOutlineColorLens, MdEmail } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import "./Home.css";
import second from "./../../assets/Image/logog.png";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";
import { FiHome } from "react-icons/fi";

// Import testimonial images
import ummaImage from "../../assets/Image/umma_baffa.jpeg";
import fatiimahImage from "../../assets/Image/fatiimah-clothing.jpeg";
import muniraImage from "../../assets/Image/munira-nuhu.jpg";
import khadijahImage from "../../assets/Image/Khadijah-Labaran.png";

// Custom hook for scroll animations
const useScrollAnimation = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const features = [
  {
    Icon: TbUsersGroup,
    title: "Client Management",
    description: "Organize client profiles, measurements, and order history",
  },
  {
    Icon: SiHackthebox,
    title: "Inventory",
    description:
      "Track fabrics, materials, and stock availability in real time",
  },
  {
    Icon: MdOutlineColorLens,
    title: "Custom Designs",
    description: "Manage bespoke designs and tailor-made orders seamlessly",
  },
  {
    Icon: FaArrowTrendUp,
    title: "Finance",
    description: "Monitor revenue, expenses, and business performance",
  },
  {
    Icon: TbUserStar,
    title: "CRM",
    description: "Strengthen customer relationships and engagement",
  },
  {
    Icon: SlCalender,
    title: "Calendar Sync",
    description: "Sync fittings, deliveries, and appointments automatically",
  },
  {
    Icon: IoSettingsOutline,
    title: "Roles & Permissions",
    description: "Control team access with role-based permissions",
  },
];

const pricingPlans = [
  {
    name: "STARTER",
    monthlyPrice: SUBSCRIPTION_PRICING.starter.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.starter.yearly,
    description: "Best for solo designers",
    badge: "Starter",
    features: [
      "1 User",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "No Notifications",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "GROWTH",
    monthlyPrice: SUBSCRIPTION_PRICING.growth.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.growth.yearly,
    description: "Ideal for growing fashion brands",
    badge: "Popular",
    features: [
      "Up to 3 Users",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "Notifications",
      "Calendar Sync",
      "Enhanced CRM",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "PROFESSIONAL",
    monthlyPrice: SUBSCRIPTION_PRICING.professional.monthly,
    yearlyPrice: SUBSCRIPTION_PRICING.professional.yearly,
    description: "Best for studios with structured teams and higher volume",
    badge: "Pro",
    features: [
      "Up to 10 Users",
      "Client Management",
      "Inventory Tool",
      "Financial Reports",
      "Custom Orders",
      "CRM Tools",
      "Appointment Scheduling",
      "Detailed Measurements",
      "Invoicing",
      "Order Tracking",
      "Support",
      "Bespoke Orders",
      "Notifications",
      "Calendar Sync",
      "Enhanced CRM",
      "Full Workflow Access",
      "Priority Notifications",
      "Priority Support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "CUSTOM",
    description: "For large brands with custom operational needs",
    badge: "Enterprise",
    features: [
      "Unlimited Users",
      "White Label",
      "API Integrations",
      "Enterprise Workflow",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Umma Baffa",
    business: "Closet Cloud Nigeria",
    content:
      "Using the Fashion Tally app has really opened my eyes to how much smoother fashion business operations can be. It helps stay more organized, track key elements of workflow, and manage things I used to do manually. It's still early, but I already see the potential.",
    rating: 5,
    image: ummaImage,
    verified: true,
  },
  {
    name: "Fatiimah",
    business: "Fatiimah Clothing",
    content:
      "Being one of the few designers chosen to privately test Fashion Tally before launch has been such a smooth and exciting experience. It has made managing my fashion records so much easier and more organized. Fashion Tally is truly the future of fashion tech built to make life easier for designers.",
    rating: 5,
    image: fatiimahImage,
    verified: true,
    featured: true,
  },
  {
    name: "Munira Nuhu",
    business: "MNM's Clothing",
    content:
      "Fashion Tally has made it so much easier for me to stay organized, manage my client orders, and keep detailed records of all my business activities in one place.",
    rating: 5,
    image: muniraImage,
    verified: true,
  },
  {
    name: "Khadijah Labaran",
    business: "Fashion Designer",
    content:
      "I really appreciate the opportunity to test it, and from what I've seen so far, it is impressive and promising. I'm excited to see how it grows.",
    rating: 5,
    image: khadijahImage,
    verified: true,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useScrollAnimation();

  return (
    <div className="landing-page">
      <nav className="nav-bar">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-logo">
              <img src={second} alt="logo" className="logo-image" />
              <span className="logo-textt">FashionTally</span>
            </div>
            <div className="nav-links-desktop">
              <a href="#featurees" className="nav-link">
                Features
              </a>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
              <a href="#testimonials" className="nav-link">
                Reviews
              </a>
              <a href="/about" className="nav-link">
                About
              </a>
              <a href="/contact" className="nav-link">
                Contact
              </a>
              <div className="nav-buttons">
                <button
                  className="btn-outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="btn-primaryy"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="menu-btn"
              >
                {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="nav-mobile-menu"
            style={{
              animation: isMenuOpen
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
          >
            <a
              href="#featurees"
              className="nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </a>
            <a
              href="/about"
              className="nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="nav-mobile-buttons">
              <button
                className="btn-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn-primaryy"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="hero-sectionnn">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-icon">✨</span>
                <span>Fashion Business Management</span>
              </div>
              <h1 className="hero-title">
                <span className="hero-title-gradient">
                  Smart Business Management for Fashion Entrepreneurs.
                </span>
              </h1>
              <p className="hero-subtitle">
                All-in-one tool for managing clients, inventory, designs,
                finances, and appointments. Built for African fashion
                entrepreneurs.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn-primaryy btn-lg"
                  onClick={() => navigate("/login")}
                >
                  Login<span className="btn-arrow">→</span>
                </button>
                <button
                  className="btn-outline btn-lg"
                  onClick={() => navigate("/signup")}
                >
                  7 Days Free Trail
                </button>
              </div>
              <div className="hero-download">
                <div className="download-info">
                  <div className="download-info-icon">📱</div>
                  <p className="download-info-text">
                    Download and use the mobile app - Available now on Android!
                  </p>
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.fashion.fashiontally"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="playstore-button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="playstore-icon"
                  >
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="100%" x2="50%" y2="0%">
                        <stop offset="0%" stopColor="#00A0FF" />
                        <stop offset="100%" stopColor="#00D4FF" />
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D4AA" />
                        <stop offset="100%" stopColor="#00C853" />
                      </linearGradient>
                      <linearGradient id="yellowGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFD500" />
                        <stop offset="100%" stopColor="#FFAB00" />
                      </linearGradient>
                      <linearGradient id="redGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#FF3A44" />
                        <stop offset="100%" stopColor="#FF5252" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#blueGradient)"
                      d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z"
                    />
                    <path
                      fill="url(#greenGradient)"
                      d="M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12Z"
                    />
                    <path
                      fill="url(#yellowGradient)"
                      d="M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81Z"
                    />
                    <path
                      fill="url(#redGradient)"
                      d="M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                    />
                  </svg>
                  <div className="playstore-text">
                    <span className="playstore-label">GET IT ON</span>
                    <span className="playstore-name">Google Play</span>
                  </div>
                  <div className="playstore-shine"></div>
                </a>
              </div>
              <div className="hero-social-proof">
                <div className="social-proof-item">
                  <div className="avatar-group">
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                    <div className="avatar"></div>
                  </div>
                  <span className="social-proof-text">500+ designers</span>
                </div>
                <div className="social-proof-item">
                  <div className="rating-stars">
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                    <span className="star">★</span>
                  </div>
                  <span className="social-proof-text">4.9/5 rating</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="dashboardd-card">
                <div className="dashboardd-contentt">
                  <div className="dashboardd-header">
                    <h3 className="dashboardd-title">dashboardd Overview</h3>
                    <span className="live-badge">Live</span>
                  </div>
                  <div className="dashboardd-stats">
                    <div className="stat-carddd">
                      <div className="stat-valuee">100</div>
                      <div className="stat-labell">Active Orders</div>
                    </div>
                    <div className="stat-carddd">
                      <div className="stat-valuee">₦1M</div>
                      <div className="stat-labell">Monthly Revenue</div>
                    </div>
                  </div>
                  <div className="progress-sectionnn">
                    <div className="progress-header">
                      <span>Client Satisfaction</span>
                      <span className="progress-value">98%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                </div>
                <div className="decoration-circle decoration-1"></div>
                <div className="decoration-circle decoration-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featurees" className="featurees-sectionnn">
        <div className="sectionnn-container">
          <div className="sectionnn-header scroll-animate">
            <div className="sectionnn-badge">features</div>
            <h2 className="sectionnn-title">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="sectionnn-subtitle">
              Powerful tools designed specifically for fashion designers and
              brands to streamline operations and accelerate growth.
            </p>
          </div>
          <div className="featurees-grid">
            {features.map((featuree, index) => {
              const Icon = featuree.Icon;
              return (
                <div
                  key={index}
                  className="featuree-card scroll-animate"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="featuree-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="featuree-title">{featuree.title}</h3>
                  <p className="featuree-description">{featuree.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-sectionnn-new">
        <div className="sectionnn-container">
          <div className="sectionnn-header scroll-animate">
            <div className="sectionnn-badge">Pricing Plans</div>
            <h2 className="sectionnn-title">
              Choose Your <span className="text-gradient">Perfect Plan</span>
            </h2>
            <p className="sectionnn-subtitle">
              Flexible pricing options designed to scale with your fashion
              business.
            </p>
          </div>
          <div className="pricing-grid-new">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="pricing-card-wrapper scroll-animate"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="billing-toggle">
                  <button
                    className={`billing-btn ${
                      billingCycle === "monthly" ? "active" : ""
                    }`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`billing-btn ${
                      billingCycle === "yearly" ? "active" : ""
                    }`}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly <span className="save-badge">Save 20%</span>
                  </button>
                </div>
                <div
                  className={`pricinggg-card-new ${
                    plan.popular ? "popular" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="most-popular-badge">Most Popular</div>
                  )}
                  <div className="plan-header-new">
                    <div className="plan-title-row">
                      <h3 className="plan-name-new">{plan.name}</h3>
                      <span className="plan-badge-new">{plan.badge}</span>
                    </div>
                    {plan.monthlyPrice ? (
                      <div className="plan-price">
                        <span className="price-amount">
                          ₦
                          {billingCycle === "monthly"
                            ? plan.monthlyPrice.toLocaleString()
                            : plan.yearlyPrice.toLocaleString()}
                        </span>
                        <span className="price-period">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    ) : (
                      <span className="custom-price">Custom</span>
                    )}
                  </div>
                  <div className="plan-featurees-new">
                    {plan.features.map((featuree, featureeIndex) => (
                      <div key={featureeIndex} className="featuree-item-new">
                        <span className="featuree-check-new">✓</span>
                        <span className="featuree-text-new">{featuree}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`plan-cta-btn ${
                      plan.popular ? "primary" : "secondary"
                    }`}
                    onClick={() => {
                      if (plan.cta === "Contact Sales") {
                        alert(
                          "Contact sales functionality would be implemented here"
                        );
                      } else {
                        navigate(`/signup?plan=${plan.name.toLowerCase()}`);
                      }
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="landing_testimonials-section">
        <div className="landing_section-container">
          <div className="landing_section-header scroll-animate">
            <div className="landing_section-badge">Real Stories</div>
            <h2 className="landing_section-title">
              Trusted by{" "}
              <span className="text-gradient">Fashion Professionals</span>
            </h2>
            <p className="landing_section-subtitle">
              See how Fashion Tally is transforming businesses across Nigeria's
              fashion industry
            </p>
          </div>
          <div className="landing_testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`landing_testimonial-card scroll-animate ${
                  testimonial.featured ? "landing_featured" : ""
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {testimonial.featured && (
                  <div className="landing_featured-badge">
                    <span className="landing_badge-icon">✨</span>Beta Tester
                  </div>
                )}
                <div className="landing_testimonial-content">
                  <div className="landing_testimonial-header">
                    <div className="landing_rating-stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="landing_star filled">
                          ★
                        </span>
                      ))}
                    </div>
                    {testimonial.verified && (
                      <span className="landing_verified-badge">
                        <span className="landing_check-icon">✓</span>Verified
                      </span>
                    )}
                  </div>
                  <blockquote className="landing_testimonial-quote">
                    <span className="landing_quote-mark">"</span>
                    <p>{testimonial.content}</p>
                    <span className="landing_quote-mark end">"</span>
                  </blockquote>
                  <div className="landing_testimonial-author">
                    <div className="landing_author-avatar">
                      <div className="landing_avatar-fallback">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="landing_avatar-image"
                        onLoad={(e) => {
                          e.target.style.display = "block";
                          e.target.previousSibling.style.display = "none";
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.previousSibling.style.display = "flex";
                        }}
                      />
                      {testimonial.verified && (
                        <div className="landing_verified-icon">✓</div>
                      )}
                    </div>
                    <div className="landing_author-info">
                      <div className="landing_author-name">
                        {testimonial.name}
                      </div>
                      <div className="landing_author-business">
                        {testimonial.business}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="landing_social-proof-stats scroll-animate">
            <div className="landing_stats-card">
              <div className="landing_stat-item">
                <div className="landing_stat-number">
                  100<span className="landing_highlight">+</span>
                </div>
                <p className="landing_stat-label">Designers</p>
              </div>
              <div className="landing_stat-item">
                <div className="landing_stat-number">
                  2,000<span className="landing_highlight">+</span>
                </div>
                <p className="landing_stat-label">Orders Tracked</p>
              </div>
              <div className="landing_stat-item">
                <div className="landing_stat-number">
                  95<span className="landing_highlight">%</span>
                </div>
                <p className="landing_stat-label">Satisfaction</p>
              </div>
              <div className="landing_stat-item">
                <div className="landing_stat-number">
                  24<span className="landing_highlight">hrs</span>
                </div>
                <p className="landing_stat-label">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing_cta-section">
        <div className="landing_cta-container">
          <h2 className="landing_cta-title">
            Ready to Transform Your Fashion Business?
          </h2>
          <p className="landing_cta-subtitle">
            Join hundreds of fashion designers and brands who are already
            growing their business with FashionTally.
          </p>
          <div className="landing_cta-buttons">
            <button
              className="landing_btn-cta-primary"
              onClick={() => navigate("/signup")}
            >
              Start Your Free Trial<span className="landing_btn-arrow">→</span>
            </button>
            <button
              className="landing_btn-cta-outline"
              onClick={() => navigate("/schedule-demo")}
            >
              Schedule Demo
            </button>
          </div>
          <p className="landing_cta-note">
            No credit card required • 7 days free trial • Cancel anytime
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={second} alt="logo" className="logo-image" />
                <span className="logo-textt">FashionTally</span>
              </div>
              <p className="footer-description">
                The complete business management platform for fashion designers
                and brands.
              </p>
              <div className="social-links">
                <div className="social-icon">f</div>
                <div className="social-icon">t</div>
                <div className="social-icon">in</div>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Product</h3>
              <ul className="footer-links">
                <li>
                  <a href="#featurees">features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Support</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Contact Info</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">
                    <FiPhone size={16} />
                  </span>
                  <span>+234 912 312 4709</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <FiPhone size={16} />
                  </span>
                  <span>+1 (332) 322-4202</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <FiHome size={16} />
                  </span>
                  <span>No1 Gidado Road Kano, Kano State</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <MdEmail size={16} />
                  </span>
                  <span>info@fashiontally.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="copyright">
              © 2025 FashionTally. All rights reserved.
            </p>
            <p className="powered_by">
              Product of <span style={{ color: "#c9a227", fontWeight: 600 }}>TALLY</span> AFRICA LTD
            </p>
            <div className="footer-legal">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/cookie-policy">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
