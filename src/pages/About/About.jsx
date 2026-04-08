import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TbUsersGroup, TbUserStar } from "react-icons/tb";
import { FaArrowTrendUp, FaHeart, FaAward } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "./About.css";
import second from "./../../assets/Image/logog.png";

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

const values = [
  {
    Icon: FaHeart,
    title: "Passion for Fashion",
    description:
      "We understand the unique challenges and opportunities in the fashion industry",
  },
  {
    Icon: TbUsersGroup,
    title: "Community First",
    description:
      "Building tools that bring fashion designers and their clients closer together",
  },
  {
    Icon: FaArrowTrendUp,
    title: "Growth Focused",
    description:
      "Every feature is designed to help fashion businesses scale and succeed",
  },
  {
    Icon: FaAward,
    title: "Quality Excellence",
    description:
      "Committed to delivering the highest quality tools and support",
  },
];

const About = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useScrollAnimation();

  return (
    <div className="about_landing-page">
      <nav className="about_nav-bar">
        <div className="about_nav-container">
          <div className="about_nav-content">
            <div className="about_nav-logo">
              <img src={second} alt="logo" className="about_logo-image" />
              <span className="about_logo-textt">FashionTally</span>
            </div>
            <div className="about_nav-links-desktop">
              <a href="/" className="about_nav-link">
                Home
              </a>
              <a href="/#featurees" className="about_nav-link">
                Features
              </a>
              <a href="/#pricing" className="about_nav-link">
                Pricing
              </a>
              <a href="/about" className="about_nav-link about_nav-link-active">
                About
              </a>
              <a href="/contact" className="about_nav-link">
                Contact
              </a>
              <div className="about_nav-buttons">
                <button
                  className="about_btn-outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="about_btn-primaryy"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="about_nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="about_menu-btn"
              >
                {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="about_nav-mobile-menu"
            style={{
              animation: isMenuOpen
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
          >
            <a
              href="/"
              className="about_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/#featurees"
              className="about_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="about_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/about"
              className="about_nav-mobile-link about_nav-mobile-link-active"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="about_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="about_nav-mobile-buttons">
              <button
                className="about_btn-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="about_btn-primaryy"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="about_hero-section">
        <div className="about_hero-container">
          <div className="about_hero-content scroll-animate">
            <div className="about_hero-badge">About FashionTally</div>
            <h1 className="about_hero-title">
              Empowering{" "}
              <span className="about_hero-title-gradient">
                Fashion Creators
              </span>{" "}
              Worldwide
            </h1>
            <p className="about_hero-subtitle">
              We're on a mission to transform how fashion designers and brands
              manage their business, connect with clients, and scale their
              operations. Built by fashion industry veterans who understand your
              unique challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about_story-section">
        <div className="about_story-container">
          <div className="about_story-grid">
            <div className="about_story-content scroll-animate">
              <h2 className="about_story-title">Our Story</h2>

              <div className="about_story-text">
                <p>
                  Fashion Tally was born from the real, everyday challenges
                  inside the African fashion industry — challenges that founder{" "}
                  <strong>Maimuna Anka</strong>
                  personally experienced while running her own fashion brand,
                  <strong> Malaabis-By-Maymz</strong>.
                </p>

                <p>
                  For years, Maimuna managed client measurements in notebooks,
                  tracked orders through scattered WhatsApp messages, monitored
                  inventory manually, and handled finances using spreadsheets
                  that rarely reflected the reality of production. She
                  understood the stress of missing measurements, losing client
                  details, delayed fittings, and the difficulty of maintaining
                  consistency as the brand grew.
                </p>

                <p>
                  She also realized that thousands of designers across Africa
                  faced the same problems — not due to lack of talent, but due
                  to lack of the right tools. Existing software was often too
                  complex, too expensive, or not built around the real workflows
                  of fashion designers.
                </p>

                <p>
                  This inspired the creation of Fashion Tally — a platform built
                  with deep understanding of how African fashion businesses
                  actually operate. Every feature, from client management and
                  measurements to invoicing, appointments, inventory, and CRM,
                  is shaped by real industry pain points and tested with real
                  designers.
                </p>

                <p>
                  The goal is simple but powerful: to bring structure,
                  professionalism, and digital growth to fashion entrepreneurs,
                  empowering them to run their businesses with confidence and
                  clarity.
                </p>

                <p className="about_story-highlight">
                  Fashion Tally is more than software — it is a digital partner
                  designed to help African designers stay organized, save time,
                  scale with ease, and grow into global fashion brands.
                </p>
              </div>
            </div>

            <div className="about_story-visual scroll-animate">
              <div className="about_stats-card">
                <div className="about_stats-grid">
                  <div className="about_stat-item">
                    <div className="about_stat-number">100+</div>
                    <div className="about_stat-label">Fashion Businesses</div>
                  </div>
                  <div className="about_stat-item">
                    <div className="about_stat-number">2,000+</div>
                    <div className="about_stat-label">Orders Managed</div>
                  </div>
                  <div className="about_stat-item">
                    <div className="about_stat-number">98%</div>
                    <div className="about_stat-label">Client Satisfaction</div>
                  </div>
                  <div className="about_stat-item">
                    <div className="about_stat-number">24/7</div>
                    <div className="about_stat-label">Support Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="about_values-section">
        <div className="about_values-container">
          <div className="about_values-header scroll-animate">
            <div className="about_values-badge">Our Values</div>
            <h2 className="about_values-title">
              What Drives{" "}
              <span className="about_text-gradient">Everything We Do</span>
            </h2>
          </div>

          <div className="about_values-grid">
            {values.map((value, index) => {
              const Icon = value.Icon;
              return (
                <div
                  key={index}
                  className="about_value-card scroll-animate"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="about_value-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="about_value-title">{value.title}</h3>
                  <p className="about_value-description">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about_team-section">
        <div className="about_team-container">
          <div className="about_team-content scroll-animate">
            <h3 className="about_team-title">A Founder-Led Startup</h3>
            <p className="about_team-description">
              Fashion Tally is built and led by a committed founder with support
              from engineers and advisors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about_cta-section">
        <div className="about_cta-container">
          <h2 className="about_cta-title">
            Ready to Transform Your Fashion Business?
          </h2>
          <p className="about_cta-subtitle">
            Join hundreds of fashion designers and brands who are already
            growing their business with FashionTally.
          </p>
          <div className="about_cta-buttons">
            <button
              className="about_btn-cta-primary"
              onClick={() => navigate("/signup")}
            >
              Start Your Free Trial<span className="about_btn-arrow">→</span>
            </button>
            <button className="about_btn-cta-outline">Schedule Demo</button>
          </div>
          <p className="about_cta-note">
            No credit card required • 7 days free trial • Cancel anytime
          </p>
        </div>
      </section>

      <footer className="about_footer">
        <div className="about_footer-container">
          <div className="about_footer-grid">
            <div className="about_footer-brand">
              <div className="about_footer-logo">
                <img src={second} alt="logo" className="about_logo-image" />
                <span className="about_logo-textt">FashionTally</span>
              </div>
              <p className="about_footer-description">
                The complete business management platform for fashion designers
                and brands.
              </p>
              <div className="about_social-links">
                <div className="about_social-icon">f</div>
                <div className="about_social-icon">t</div>
                <div className="about_social-icon">in</div>
              </div>
            </div>
            <div className="about_footer-column">
              <h3 className="about_footer-heading">Product</h3>
              <ul className="about_footer-links">
                <li>
                  <a href="/#featurees">Features</a>
                </li>
                <li>
                  <a href="/#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div className="about_footer-column">
              <h3 className="about_footer-heading">Company</h3>
              <ul className="about_footer-links">
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="about_footer-column">
              <h3 className="about_footer-heading">Support</h3>
              <ul className="about_footer-links">
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="about_footer-column">
              <h3 className="about_footer-heading">Contact Info</h3>
              <div className="about_contact-info">
                <div className="about_contact-item">
                  <span>+234 912 312 4709</span>
                </div>
                <div className="about_contact-item">
                  <span>+1 (332) 322-4202</span>
                </div>
                <div className="about_contact-item">
                  <span>info@fashiontally.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="about_footer-bottom">
            <p className="about_copyright">
              © 2025 FashionTally. All rights reserved.
            </p>
            <p className="about_powered_by">
              Powered by TALLY AFRICA LTD
            </p>
            <div className="about_footer-legal">
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

export default About;
