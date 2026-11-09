/**
 * Shared pieces of the public marketing pages (Home, About, Contact):
 * the floating menu bar, the footer, the closing call-to-action and the
 * scroll-reveal helpers. Styles live in Landing.css (all scoped under .lx).
 */
import { Fragment, useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_URL } from "./landingUtils.js";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, Menu, Phone, Sparkles, X } from "lucide-react";
import logo from "../../assets/Image/logog.png";
import "./legacyShared.css";
import "./Landing.css";

/** Links in the top menu. Section links point at the home page from other pages. */
const NAV = [
  { label: "Pricing", section: "pricing" },
  { label: "Reviews", section: "stories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Home page sections, listed in the footer. */
const SECTIONS = [
  { label: "Platform", section: "platform" },
  { label: "Tools", section: "tools" },
  { label: "Workflows", section: "workflows" },
  { label: "Pricing", section: "pricing" },
  { label: "Reviews", section: "stories" },
  { label: "FAQ", section: "faq" },
];

const linkFor = (item, onHome) => item.href ?? (onHome ? `#${item.section}` : `/#${item.section}`);

/** Heading whose words rise in one after another. */
export function SplitWords({ text, as = "h2", className = "", delay = 0 }) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={`lx-split ${className}`} data-reveal aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && " "}
          <span className="lx-split-mask" aria-hidden="true">
            <span className="lx-split-word" style={{ transitionDelay: `${delay + i * 0.06}s` }}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/** Big headline that rises in word by word as the page loads (used at the top of a page). */
export function IntroTitle({ lines, className = "lx-hero-title", startDelay = 0.2 }) {
  let n = 0;
  return (
    <h1 className={className} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span className="lx-hero-line" key={li}>
          {line.split(" ").map((w, i) => {
            const delay = startDelay + n++ * 0.08;
            return (
              <Fragment key={`${w}-${i}`}>
                {i > 0 && " "}
                <span className="lx-split-mask" aria-hidden="true">
                  <span className="lx-rise" style={{ animationDelay: `${delay}s` }}>
                    {w}
                  </span>
                </span>
              </Fragment>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export const SectionTag = ({ children }) => (
  <p className="lx-tag" data-reveal>
    {children}
  </p>
);

export const StoreButtons = () => (
  <div className="lx-stores">
    <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className="lx-store">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35Zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27Zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31ZM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49Z" />
      </svg>
      <span>
        <small>Get it on</small>Google Play
      </span>
    </a>
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="lx-store">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span>
        <small>Download on the</small>App Store
      </span>
    </a>
  </div>
);

/** Floating black pill menu bar. */
export function LandingNav({ onHome = false }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <header className={`lx-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="lx-nav-pill">
        <a href={onHome ? "#top" : "/"} className="lx-brand" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="" />
          <span>
            FashionTally<sup>®</sup>
          </span>
        </a>
        <nav className="lx-nav-links" aria-label="Main">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={linkFor(item, onHome)}
              className={item.href === path ? "is-current" : ""}
              aria-current={item.href === path ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="lx-nav-actions">
          <button type="button" className="lx-link-btn" onClick={() => navigate("/login")}>
            Log in
          </button>
          <button type="button" className="lx-btn lx-btn-light lx-btn-sm" onClick={() => navigate("/signup")}>
            <span className="lx-btn-roll" data-text="Start free">
              Start free
            </span>
          </button>
          <button
            type="button"
            className="lx-menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className={`lx-mobile-menu ${menuOpen ? "is-open" : ""}`}>
        {!onHome && (
          <a href="/" onClick={() => setMenuOpen(false)}>
            Home
          </a>
        )}
        {NAV.map((item) => (
          <a key={item.label} href={linkFor(item, onHome)} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/login")}>
          Log in
        </button>
      </div>
    </header>
  );
}

/** Dark closing call-to-action band. */
export function LandingCta({
  eyebrow = "LESS CHAOS. MORE CREATING.",
  title = "Your next collection. Already in order.",
}) {
  const navigate = useNavigate();
  return (
    <section className="lx-cta">
      <div className="lx-hero-glow lx-cta-glow" aria-hidden="true" />
      <p className="lx-eyebrow" data-reveal>
        {eyebrow}
      </p>
      <SplitWords text={title} as="h2" className="lx-cta-title" />
      <div className="lx-hero-ctas" data-reveal>
        <button type="button" className="lx-btn lx-btn-light" onClick={() => navigate("/signup")}>
          <span className="lx-btn-roll" data-text="Start your free trial">
            Start your free trial
          </span>
        </button>
        <button type="button" className="lx-btn lx-btn-ghost lx-on-dark" onClick={() => navigate("/schedule-demo")}>
          Book a demo <ArrowUpRight size={16} />
        </button>
      </div>
      <Sparkles className="lx-cta-spark" size={22} aria-hidden="true" />
    </section>
  );
}

export function LandingFooter({ onHome = false }) {
  return (
    <footer className="lx-footer">
      <div className="lx-wrap">
        <div className="lx-footer-grid">
          <div className="lx-footer-brand">
            <a href={onHome ? "#top" : "/"} className="lx-brand">
              <img src={logo} alt="" />
              <span>FashionTally</span>
            </a>
            <p>The complete business management platform for fashion designers and brands.</p>
            <StoreButtons />
          </div>
          <div>
            <h4>Product</h4>
            {SECTIONS.map((item) => (
              <a key={item.label} href={linkFor(item, onHome)}>
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/schedule-demo">Book a demo</a>
            <a href="/login">Log in</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p className="lx-footer-line">
              <Phone size={14} /> +234 912 312 4709
            </p>
            <p className="lx-footer-line">
              <Phone size={14} /> +1 (332) 322-4202
            </p>
            <p className="lx-footer-line">
              <Mail size={14} /> info@fashiontally.com
            </p>
            <p className="lx-footer-line">
              <MapPin size={14} /> No 1 Gidado Road, Kano
            </p>
          </div>
        </div>
        <p className="lx-wordmark" data-reveal aria-label="FashionTally">
          {"FashionTally".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ transitionDelay: `${i * 0.045}s` }}>
              {ch}
            </span>
          ))}
        </p>
        <div className="lx-footer-bottom">
          <p>© {new Date().getFullYear()} FashionTally. All rights reserved.</p>
          <div>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/cookie-policy">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
