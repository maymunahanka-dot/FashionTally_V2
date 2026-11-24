/**
 * Shared pieces of the public marketing pages (Home, About, Contact):
 * the floating menu bar, the footer, the closing call-to-action and the
 * scroll-reveal helpers. Styles live in Landing.css (all scoped under .lx).
 */
import { createElement, Fragment, useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_URL } from "./landingUtils.js";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Instagram, Linkedin, Mail, MapPin, Menu, Phone, Twitter, X } from "lucide-react";
import logo from "../../assets/Image/logog.png";
import "./legacyShared.css";
import "./Landing.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


/** Links in the top menu. Section links point at the home page from other pages. */
const NAV = [
  { label: "Features", section: "workflows" },
  { label: "Pricing", section: "pricing" },
  { label: "Reviews", section: "stories" },
  { label: "Fashion Refab", href: "/refab" },
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

/** FashionTally's social accounts (same links as the Contact page). */
const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/fashiontallyapp?igsh=Yzc2bjE3N3FwMXpj&utm_source=qr", icon: Instagram },
  { label: "X (Twitter)", href: "https://x.com/fashion_tally?s=11", icon: Twitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/fashion-tally/", icon: Linkedin },
];

const linkFor = (item, onHome) => item.href ?? (onHome ? `#${item.section}` : `/#${item.section}`);

/** Heading whose words rise in one after another. */
export function SplitWords({ text, as = "h2", className = "", delay = 0 }) {
  useTranslation(); // re-render when the language changes
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={`lx-split ${className}`} data-reveal aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && " "}
          <span className="lx-split-mask" aria-hidden="true">
            <span className="lx-split-word" style={{ transitionDelay: `${delay + i * 0.06}s` }}>
              {tl(word)}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/** Big headline that rises in word by word as the page loads (used at the top of a page). */
export function IntroTitle({ lines, className = "lx-hero-title", startDelay = 0.2 }) {
  useTranslation(); // re-render when the language changes
  let n = 0;
  return (
    <h1 className={className} aria-label={lines.map((l) => tl(l)).join(" ")}>
      {lines.map((line, li) => (
        <span className="lx-hero-line" key={li}>
          {tl(line).split(" ").map((w, i) => {
            const delay = startDelay + n++ * 0.08;
            return (
              <Fragment key={`${w}-${i}`}>
                {i > 0 && " "}
                <span className="lx-split-mask" aria-hidden="true">
                  <span className="lx-rise" style={{ animationDelay: `${delay}s` }}>
                    {tl(w)}
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

export const StoreButtons = () => {
  const { t: tx } = useTranslation();
  return (
  <div className="lx-stores">
    <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className="lx-store">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35Zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27Zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31ZM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49Z" />
      </svg>
      <span>
        <small>{tx("auto.getItOn_bd8e")}</small>{tx("auto.googlePlay_da68")}
      </span>
    </a>
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="lx-store">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span>
        <small>{tx("auto.downloadOnThe_aa63")}</small>{tx("auto.appStore_c3e0")}
      </span>
    </a>
  </div>
);
};

/** Floating black pill menu bar. */
export function LandingNav({ onHome = false }) {
  const { t: tx } = useTranslation();
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
              {tl(item.label)}
            </a>
          ))}
        </nav>
        <div className="lx-nav-actions">
          <button type="button" className="lx-link-btn" onClick={() => navigate("/login")}>
            {tx("auto.logIn_f7c4")}
          </button>
          <button type="button" className="lx-btn lx-btn-light lx-btn-sm" onClick={() => navigate("/signup")}>
            <span className="lx-btn-roll" data-text="Get started">
              {tx("auto.getStarted_90e4")}
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
            {tx("auto.home_70f8")}
          </a>
        )}
        {NAV.map((item) => (
          <a key={item.label} href={linkFor(item, onHome)} onClick={() => setMenuOpen(false)}>
            {tl(item.label)}
          </a>
        ))}
        <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/login")}>
          {tx("auto.logIn_f7c4")}
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
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="lx-cta">
      <div className="lx-hero-glow lx-cta-glow" aria-hidden="true" />
      <p className="lx-eyebrow" data-reveal>
        {tl(eyebrow)}
      </p>
      <SplitWords text={tl(title)} as="h2" className="lx-cta-title" />
      <div className="lx-hero-ctas" data-reveal>
        <button type="button" className="lx-btn lx-btn-light" onClick={() => navigate("/signup")}>
          <span className="lx-btn-roll" data-text="Start your free trial">
            {tx("auto.startYourFreeTrial_777c")}
          </span>
        </button>
        <button type="button" className="lx-btn lx-btn-ghost lx-on-dark" onClick={() => navigate("/schedule-demo")}>
          {tx("auto.bookADemo_a83d")}{" "}<ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}

export function LandingFooter({ onHome = false }) {
  const { t: tx } = useTranslation();
  return (
    <footer className="lx-footer">
      <div className="lx-wrap">
        <div className="lx-footer-grid">
          <div className="lx-footer-brand">
            <a href={onHome ? "#top" : "/"} className="lx-brand">
              <img src={logo} alt="" />
              <span>FashionTally</span>
            </a>
            <p>{tx("auto.theCompleteBusinessManagementPla_7dea")}</p>
            <StoreButtons />
            <div className="lx-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={tl(s.label)}>
                  {tl(createElement(s.icon, { size: 18 }))}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>{tx("auto.product_dd3b")}</h4>
            {SECTIONS.map((item) => (
              <a key={item.label} href={linkFor(item, onHome)}>
                {tl(item.label)}
              </a>
            ))}
          </div>
          <div>
            <h4>{tx("auto.company_7a19")}</h4>
            <a href="/about">{tx("auto.about_6b21")}</a>
            <a href="/contact">{tx("auto.contact_b374")}</a>
            <a href="/refab">{tl("Fashion Refab")}</a>
            <a href="/schedule-demo">{tx("auto.bookADemo_a83d")}</a>
            <a href="/login">{tx("auto.logIn_f7c4")}</a>
          </div>
          <div>
            <h4>{tx("auto.contact_b374")}</h4>
            <p className="lx-footer-line">
              <Phone size={14} /> +234 912 312 4709
            </p>
            <p className="lx-footer-line">
              <Phone size={14} /> +1 (332) 322-4202
            </p>
            <p className="lx-footer-line">
              <Mail size={14} />{" "}{tx("auto.infoFashiontallyCom_1864")}
            </p>
            <p className="lx-footer-line">
              <MapPin size={14} />{" "}{tx("auto.no1GidadoRoadKano_4ceb")}
            </p>
          </div>
        </div>
        <p className="lx-wordmark" data-reveal aria-label="FashionTally">
          {"FashionTally".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ transitionDelay: `${i * 0.045}s` }}>
              {tl(ch)}
            </span>
          ))}
        </p>
        <div className="lx-footer-bottom">
          <p>© {new Date().getFullYear()}{" "}{tx("auto.fashiontallyAllRightsReserved_bfc2")}</p>
          <div>
            <a href="/privacy-policy">{tx("auto.privacyPolicy_9db1")}</a>
            <a href="/terms-of-service">{tx("auto.termsOfService_0c8a")}</a>
            <a href="/cookie-policy">{tx("auto.cookiePolicy_e6e1")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
