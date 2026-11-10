import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Contact,
  FileText,
  Headphones,
  LayoutDashboard,
  Palette,
  HeartHandshake,
  ShieldCheck,
  Settings,
  ShoppingCart,
  UserPlus,
  Menu,
  MessageCircle,
  NotebookPen,
  Package,
  Plus,
  Receipt,
  Ruler,
  Scissors,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  IntroTitle,
  LandingCta,
  LandingFooter,
  LandingNav,
  SectionTag,
  SplitWords,
  StoreButtons,
} from "./landingKit.jsx";
import { prefersReducedMotion, useRevealOnScroll } from "./landingUtils.js";
import logo from "../../assets/Image/logog.png";
import pattern from "../../assets/Image/bg.png";
import photoStudio from "../../assets/Image/hero/designer-sewing.jpg";
import photoMeasuring from "../../assets/Image/hero/designer-measuring.jpg";
import photoPrintDress from "../../assets/Image/hero/model-print-dress.jpg";
import photoJacket from "../../assets/Image/hero/tailored-jacket.jpg";
import { SUBSCRIPTION_PRICING } from "../../config/subscriptionPricing.js";
import ummaImage from "../../assets/Image/umma_baffa.jpeg";
import fatiimahImage from "../../assets/Image/fatiimah-clothing.jpeg";
import muniraImage from "../../assets/Image/munira-nuhu.jpg";
import khadijahImage from "../../assets/Image/Khadijah-Labaran.png";

/* ───────────────────────── content ───────────────────────── */

/** Photo cards floating around the hero headline (free Unsplash photos, see assets/Image/hero/CREDITS.md). */
const HERO_PHOTOS = [
  { src: photoMeasuring, icon: Ruler, label: "14 measurements saved" },
  { src: photoStudio, icon: CalendarDays, label: "Fitting today · 10:30" },
  { src: photoJacket, icon: Scissors, label: "Order #2841 in progress" },
  { src: photoPrintDress, icon: Check, label: "Delivered · Paid ₦85,000" },
];

const PROBLEMS = [
  {
    icon: NotebookPen,
    title: "Measurements in notebooks",
    text: "Keep every client's sizes, styles and notes in one profile you can open anywhere.",
  },
  {
    icon: MessageCircle,
    title: "Orders lost in chats",
    text: "Turn scattered WhatsApp requests into tracked orders with clear due dates.",
  },
  {
    icon: Wallet,
    title: "Payments you forget to chase",
    text: "Send clean invoices and see at a glance who has paid and who still owes.",
  },
  {
    icon: Clock,
    title: "Fittings that slip by",
    text: "Get reminders before fittings and deliveries, not after the client calls.",
  },
];

const TOOLS = [
  {
    tag: "01 / CLIENTS & MEASUREMENTS",
    title: "Every client, perfectly measured",
    text: "Profiles with measurements, style notes, photos and full order history, ready before the client walks in.",
    widgetLabel: "CLIENT PROFILE",
    widgetTitle: "Aisha B. · 14 measurements",
    widgetNote: "Last updated at her fitting",
    icon: Ruler,
  },
  {
    tag: "02 / ORDERS",
    title: "Orders that move themselves forward",
    text: "Track every custom and bespoke order from fabric to delivery, with due dates you can't miss.",
    widgetLabel: "ORDER #2841",
    widgetTitle: "Agbada set · In production",
    widgetNote: "Due in 3 days",
    icon: Scissors,
  },
  {
    tag: "03 / INVOICES & PAYMENTS",
    title: "Get paid without the awkward chase",
    text: "Create branded invoices in seconds and see deposits, balances and overdue payments in one place.",
    widgetLabel: "INVOICE INV-0192",
    widgetTitle: "₦85,000 · Deposit received",
    widgetNote: "Balance due on delivery",
    icon: Receipt,
  },
  {
    tag: "04 / BUSINESS INSIGHTS",
    title: "Know exactly how your brand is doing",
    text: "Revenue, expenses and best-selling styles turned into a clear picture of what needs your attention.",
    widgetLabel: "THIS MONTH",
    widgetTitle: "Revenue up 18%",
    widgetNote: "Your top style: Bridal",
    icon: TrendingUp,
  },
];

const FLOWS = [
  { icon: Ruler, title: "Client measurements", text: "Capture sizes once. Reuse them on every order." },
  { icon: ShoppingBag, title: "Custom orders", text: "From request to delivery, every step in view." },
  { icon: Receipt, title: "Invoices", text: "Professional invoices your clients take seriously." },
  { icon: Package, title: "Inventory alerts", text: "Know when fabric and materials are running low." },
  { icon: CalendarDays, title: "Appointments", text: "Fittings and pickups, synced to your calendar." },
  { icon: Bell, title: "Daily brief", text: "Your day's orders and payments, every morning." },
  { icon: Palette, title: "Custom designs", text: "Manage bespoke designs and tailor-made orders seamlessly." },
  { icon: Wallet, title: "Finance", text: "Monitor revenue, expenses, and business performance." },
  { icon: HeartHandshake, title: "CRM", text: "Strengthen customer relationships and engagement." },
  { icon: ShieldCheck, title: "Roles & permissions", text: "Control team access with role-based permissions." },
];

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    blurb: "For solo designers getting organised.",
    features: [
      "1 user",
      "Clients & measurements",
      "Custom & bespoke orders",
      "Invoicing & payments",
      "Inventory & finance reports",
      "Appointment scheduling",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    popular: true,
    blurb: "For growing brands with a small team.",
    features: [
      "Up to 3 users",
      "Everything in Starter",
      "Notifications",
      "Calendar sync",
      "Enhanced CRM",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    blurb: "For studios with structured teams.",
    features: [
      "Up to 10 users",
      "Everything in Growth",
      "Full workflow access",
      "Priority notifications",
      "Priority support",
    ],
  },
  {
    key: "custom",
    name: "Custom",
    blurb: "For large brands with special needs.",
    features: ["Unlimited users", "White label", "API integrations", "Enterprise workflow"],
  },
];

const TESTIMONIALS = [
  {
    name: "Fatiimah",
    business: "Fatiimah Clothing",
    headline: "Managing my records is so much easier.",
    quote:
      "Being one of the few designers chosen to test Fashion Tally before launch has been such a smooth experience. It has made managing my fashion records so much easier and more organised.",
    image: fatiimahImage,
  },
  {
    name: "Umma Baffa",
    business: "Closet Cloud Nigeria",
    headline: "A smoother way to run a fashion business.",
    quote:
      "Fashion Tally has opened my eyes to how much smoother fashion business operations can be. It helps me stay organised, track my workflow and manage things I used to do manually.",
    image: ummaImage,
  },
  {
    name: "Munira Nuhu",
    business: "MNM's Clothing",
    headline: "Everything in one place.",
    quote:
      "Fashion Tally has made it so much easier for me to stay organised, manage my client orders, and keep detailed records of all my business activities in one place.",
    image: muniraImage,
  },
  {
    name: "Khadijah Labaran",
    business: "Fashion Designer",
    headline: "Impressive and promising.",
    quote:
      "I really appreciate the opportunity to test it, and from what I've seen so far, it is impressive and promising. I'm excited to see how it grows.",
    image: khadijahImage,
  },
];

/** FAQ (the original Contact page questions). "All" shows every question; the rest are the categories. */
const FAQ_ITEMS = [
  {
    category: "Getting Started",
    q: "How quickly can I get started?",
    a: "You can start using FashionTally immediately after signing up. Our onboarding process takes less than 10 minutes, and we provide guided tutorials to help you set up your first clients and orders. Plus, our team offers free onboarding calls to ensure you're set up for success.",
  },
  {
    category: "Support",
    q: "Do you offer training and support?",
    a: "Absolutely! We provide comprehensive onboarding, video tutorials, documentation, live chat support, and ongoing customer success management. Our team includes former fashion designers who understand your unique challenges and can provide industry-specific guidance.",
  },
  {
    category: "Data Migration",
    q: "Can I import my existing client data?",
    a: "Yes! We support importing client data from Excel/CSV files, and our team can help migrate data from other systems like spreadsheets, other CRMs, or manual records. We also offer free data migration assistance for all new customers.",
  },
  {
    category: "Security",
    q: "Is my data secure?",
    a: "Security is our top priority. We use enterprise-grade encryption, secure cloud hosting with AWS, regular automated backups, and comply with international data protection standards. Your data is protected with the same security measures used by major financial institutions.",
  },
  {
    category: "Billing",
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, bank transfers, and mobile money payments including Paystack, Flutterwave, and other Nigerian payment providers. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    category: "Billing",
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time with no cancellation fees. Your data remains accessible for 30 days after cancellation, giving you time to export your information if needed.",
  },
];

const FAQ = {
  All: FAQ_ITEMS,
  ...FAQ_ITEMS.reduce((groups, item) => {
    (groups[item.category] ||= []).push(item);
    return groups;
  }, {}),
};

/* ───────────────────────── animation helpers ───────────────────────── */

/** Runs `onFrame(progress)` while the element passes through the viewport (0 → 1). */
function useScrollProgress(ref, onFrame) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.35)));
      onFrame(progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref, onFrame]);
}

/** Paragraph that lights up word by word as you scroll past it. */
function ScrollHighlight({ text, className = "" }) {
  const ref = useRef(null);
  const words = useMemo(() => text.split(" "), [text]);
  const [lit, setLit] = useState(prefersReducedMotion() ? words.length : 0);
  const onFrame = useMemo(
    () => (p) => {
      if (prefersReducedMotion()) return;
      const eased = Math.min(1, Math.max(0, (p - 0.15) / 0.55));
      setLit(Math.round(eased * words.length));
    },
    [words.length],
  );
  useScrollProgress(ref, onFrame);
  return (
    <p ref={ref} className={`lx-highlight ${className}`}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className={i < lit ? "is-lit" : ""}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

/** Number that counts up the first time it is seen. */
function CountUp({ to, prefix = "", suffix = "", duration = 1400, format }) {
  const ref = useRef(null);
  const [value, setValue] = useState(prefersReducedMotion() ? to : 0);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {format ? format(value) : value.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Text that types itself out, pauses, then moves to the next line. */
function Typewriter({ lines }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? lines[0] : ""));
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const full = lines[index];
    let i = 0;
    let timer;
    const type = () => {
      i += 1;
      setShown(full.slice(0, i));
      if (i < full.length) timer = setTimeout(type, 45);
      else timer = setTimeout(() => setIndex((n) => (n + 1) % lines.length), 2200);
    };
    timer = setTimeout(type, 400);
    return () => clearTimeout(timer);
  }, [index, lines]);
  return (
    <span className="lx-type">
      {shown}
      <span className="lx-caret" aria-hidden="true" />
    </span>
  );
}

/* ───────────────────────── product mock-ups ───────────────────────── */
/* These copy the real web dashboard and mobile app layouts, filled with sample data. */

const WEB_NAV = [
  [LayoutDashboard, "Dashboard Overview"],
  [Users, "Clients Management"],
  [Package, "Inventory"],
  [Palette, "Designs"],
  [ShoppingCart, "Order Management"],
  [FileText, "Invoice"],
  [CalendarDays, "Appointments"],
  [TrendingUp, "Finances"],
  [Contact, "CRM"],
  [Settings, "More Settings"],
];

/** ₦1,240,000 → "1.24M", like the app's compact money display. */
const millions = (n) => `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "")}M`;

const SAMPLE_STATS = [
  { icon: Wallet, value: <CountUp to={1240000} prefix="₦" format={millions} />, label: "Total Revenue", note: "+18.0% from last month", tone: "up" },
  { icon: Users, value: <CountUp to={48} />, unit: "clients", label: "Active Clients", note: "6 new this month", tone: "up" },
  { icon: ClipboardList, value: <CountUp to={12} />, unit: "orders", label: "Pending Orders", note: "3 due this week", tone: "warn" },
  { icon: Package, value: <CountUp to={2900000} prefix="₦" format={millions} />, label: "Inventory Value", note: "24 items in stock", tone: "up" },
];

function WebDashboardMock() {
  return (
    <div className="lx-dash">
      <aside className="lx-dash-side">
        <div className="lx-dash-brand">
          <img src={logo} alt="" />
          <span>FashionTally</span>
        </div>
        <div className="lx-dash-profile">
          <span className="lx-dash-avatar">FA</span>
          <div>
            <b>Fatima Atelier</b>
            <small>Designer</small>
            <small>hello@fatima.ng</small>
          </div>
        </div>
        <nav className="lx-dash-nav">
          {WEB_NAV.map(([icon, label], i) => (
            <span key={label} className={i === 0 ? "is-active" : ""} style={i === 0 ? { backgroundImage: `url(${pattern})` } : undefined}>
              {createElement(icon)} {label}
            </span>
          ))}
        </nav>
        <span className="lx-dash-support">
          <Headphones /> Expert Support
        </span>
      </aside>

      <div className="lx-dash-main">
        <div className="lx-dash-banner" style={{ backgroundImage: `url(${pattern})` }}>
          <div>
            <div className="lx-dash-hello">
              <span className="lx-dash-avatar lx-dash-avatar-lg">F</span>
              <h4>Welcome back, Fatima!</h4>
            </div>
            <p>Here's an overview of your fashion business</p>
          </div>
          <span className="lx-dash-bell">
            <Bell />
            <i>3</i>
          </span>
        </div>

        <h5 className="lx-dash-title">Quick Actions</h5>
        <div className="lx-dash-actions">
          {[
            [ClipboardList, "New Order"],
            [UserPlus, "New Client"],
            [Plus, "Add Inventory"],
            [Contact, "CRM"],
          ].map(([icon, label]) => (
            <div key={label} className="lx-dash-action">
              <span>
                {createElement(icon)}
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="lx-dash-row">
          <h5 className="lx-dash-title">Today's Schedule</h5>
          <small>See more</small>
        </div>
        <div className="lx-dash-schedule">
          <div>
            <b>10:30 AM</b>
            <span>
              <Users /> Aisha Bello
            </span>
            <small>Bridal gown: final fitting</small>
          </div>
          <em>Confirmed</em>
        </div>

        <div className="lx-dash-stats">
          {SAMPLE_STATS.map(({ icon, value, unit, label, note, tone }) => (
            <div key={label} className="lx-dash-stat">
              <div className="lx-dash-stat-top">
                <span>
                  {createElement(icon)}
                </span>
                <strong>{value}</strong>
                {unit && <small>{unit}</small>}
              </div>
              <p>{label}</p>
              <em className={`is-${tone}`}>{note}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="lx-phone" aria-hidden="true">
      <div className="lx-phone-screen">
        <div className="lx-phone-head" style={{ backgroundImage: `url(${pattern})` }}>
          <div className="lx-phone-status">
            <b>9:41</b>
            <span />
          </div>
          <div className="lx-phone-bar">
            <Menu />
            <b>Dashboard</b>
            <Bell />
          </div>
          <div className="lx-phone-hello">
            <span className="lx-dash-avatar">F</span>
            <p>
              Welcome back,
              <br />
              Fatima
            </p>
          </div>
        </div>
        <div className="lx-phone-sheet">
          <h6>Quick Actions</h6>
          <div className="lx-phone-actions">
            {[
              [ClipboardList, "New Order"],
              [UserPlus, "New Client"],
              [Plus, "Add Inventory"],
            ].map(([icon, label]) => (
              <div key={label}>
                <span>
                  {createElement(icon)}
                </span>
                {label}
              </div>
            ))}
          </div>
          <h6>Today's Schedule</h6>
          <div className="lx-phone-sched">
            <b>10:30</b>
            <div>
              <strong>Aisha Bello</strong>
              <small>Final fitting</small>
            </div>
          </div>
          <div className="lx-phone-date">
            <b>Friday, Nov 6</b>
            <small>Updated now</small>
          </div>
          <div className="lx-phone-stats">
            {SAMPLE_STATS.map(({ icon, value, unit, label, note, tone }) => (
              <div key={label}>
                <div className="lx-phone-stat-top">
                  {createElement(icon)}
                  <strong>{value}</strong>
                  {unit && <small>{unit}</small>}
                </div>
                <p>{label}</p>
                <em className={`is-${tone}`}>{note}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

const Home = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const mockRef = useRef(null);
  const [cycle, setCycle] = useState("monthly");
  const [story, setStory] = useState(0);
  const [faqTab, setFaqTab] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  useRevealOnScroll(rootRef);

  // Arriving from another page via /#pricing etc.: jump to that section once it exists.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return undefined;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView(), 60);
    return () => clearTimeout(t);
  }, []);

  // Hero dashboard tilts flat as you scroll into it.
  const onMockFrame = useMemo(
    () => (p) => {
      const el = mockRef.current;
      if (!el || prefersReducedMotion()) return;
      const t = Math.min(1, p / 0.6);
      el.style.setProperty("--tilt", `${(1 - t) * 22}deg`);
      el.style.setProperty("--lift", `${(1 - t) * 60}px`);
      el.style.setProperty("--zoom", `${0.9 + t * 0.1}`);
    },
    [],
  );
  useScrollProgress(mockRef, onMockFrame);

  // Stories rotate on their own until the visitor uses the arrows.
  const [autoplay, setAutoplay] = useState(true);
  useEffect(() => {
    if (!autoplay || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setStory((s) => (s + 1) % TESTIMONIALS.length), 6500);
    return () => clearInterval(id);
  }, [autoplay]);
  const goStory = (dir) => {
    setAutoplay(false);
    setStory((s) => (s + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const yearlySaving = Math.round(
    (1 - SUBSCRIPTION_PRICING.growth.yearly / (SUBSCRIPTION_PRICING.growth.monthly * 12)) * 100,
  );

  const choosePlan = (plan) => {
    if (plan.key === "custom") navigate("/contact");
    else navigate(`/signup?plan=${plan.key}&cycle=${cycle}`);
  };

  const current = TESTIMONIALS[story];

  return (
    <div className="lx" ref={rootRef}>
      <LandingNav onHome />

      {/* ── Hero ── */}
      <section className="lx-hero" id="top">
        <div className="lx-hero-glow" aria-hidden="true" />
        <p className="lx-eyebrow lx-fade" style={{ animationDelay: "0.1s" }}>
          FASHION BUSINESS MANAGEMENT
        </p>
        <IntroTitle
          className="lx-hero-title lx-hero-title-long"
          lines={["Smart Business Management", "for Fashion Entrepreneurs."]}
        />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          Clients, measurements, orders, invoices and finances in one calm workspace for your fashion business.
        </p>
        <div className="lx-hero-ctas lx-fade" style={{ animationDelay: "0.9s" }}>
          <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/signup")}>
            <span className="lx-btn-roll" data-text="Start your free trial">
              Start your free trial
            </span>
          </button>
          <button type="button" className="lx-btn lx-btn-ghost" onClick={() => navigate("/schedule-demo")}>
            Book a demo <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="lx-fade" style={{ animationDelay: "1.05s" }}>
          <StoreButtons />
        </div>

        {/* Dashboard mock-up */}
        <div className="lx-mock-stage">
          <div className="lx-mock" ref={mockRef}>
            <div className="lx-mock-bar">
              <span />
              <span />
              <span />
              <p>app.fashiontally.com</p>
            </div>
            <WebDashboardMock />
          </div>
          <PhoneMock />
        </div>
      </section>

      {/* ── 01 Platform ── */}
      <section className="lx-section lx-light" id="platform">
        <div className="lx-wrap">
          <div className="lx-platform-top">
            <div>
              <SectionTag>01 / THE PLATFORM</SectionTag>
              <ScrollHighlight
                className="lx-statement"
                text="Great fashion feels effortless. FashionTally brings your clients, orders and money into one calm, connected flow."
              />
              <p className="lx-lead" data-reveal>
                Less flipping through notebooks. Fewer forgotten balances. A connected way to handle the work behind
                every outfit, with you in control.
              </p>
            </div>

            {/* Designer photos */}
            <div className="lx-platform-photos" aria-hidden="true" data-reveal>
              {HERO_PHOTOS.map((photo, i) => (
                <figure key={photo.src} className={`lx-pp lx-pp-${i + 1}`}>
                  <img src={photo.src} alt="" loading="lazy" />
                  <figcaption>
                    {createElement(photo.icon, { size: 14 })}
                    {photo.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="lx-stats">
            <div data-reveal>
              <p>TOOLS IN ONE WORKSPACE</p>
              <strong>
                <CountUp to={7} suffix="" />
              </strong>
            </div>
            <div data-reveal style={{ transitionDelay: "0.1s" }}>
              <p>WEB, ANDROID & iOS</p>
              <strong>
                <CountUp to={3} />
              </strong>
            </div>
            <div data-reveal style={{ transitionDelay: "0.2s" }}>
              <p>YOUR DATA, YOUR BUSINESS</p>
              <strong>
                <CountUp to={100} suffix="%" />
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 Problems ── */}
      <section className="lx-section lx-light lx-tight-top">
        <div className="lx-wrap">
          <SectionTag>02 / A BETTER WAY TO WORK</SectionTag>
          <SplitWords text="You have better things to do than chase loose ends." className="lx-h2" />
          <div className="lx-problems">
            {PROBLEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="lx-problem" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className="lx-num">0{i + 1}</span>
                  <Icon size={22} strokeWidth={1.6} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 03 In sync ── */}
      <section className="lx-section lx-dark">
        <div className="lx-wrap lx-center">
          <SectionTag>03 / EVERYTHING IN SYNC</SectionTag>
          <SplitWords text="One quiet engine. Your entire fashion business." className="lx-h2" />
          <div className="lx-orbit" data-reveal>
            <div className="lx-orbit-ring lx-orbit-ring-1">
              {[Users, Ruler, ShoppingBag, Receipt].map((Icon, i) => (
                <span key={i} className="lx-orbit-node" style={{ "--i": i, "--n": 4 }}>
                  <Icon size={18} />
                </span>
              ))}
            </div>
            <div className="lx-orbit-ring lx-orbit-ring-2">
              {[Package, CalendarDays, Wallet, TrendingUp, Bell, Scissors].map((Icon, i) => (
                <span key={i} className="lx-orbit-node" style={{ "--i": i, "--n": 6 }}>
                  <Icon size={18} />
                </span>
              ))}
            </div>
            <div className="lx-orbit-core">
              <img src={logo} alt="" />
            </div>
          </div>
          <div className="lx-ask" data-reveal>
            <Search size={18} />
            <Typewriter
              lines={[
                "Which orders are due this week?",
                "Who still owes me a balance?",
                "When is Aisha's next fitting?",
                "What fabric is running low?",
              ]}
            />
            <span className="lx-ask-btn">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </section>

      {/* ── 04 Tools (stacking cards) ── */}
      <section className="lx-section lx-dark lx-tight-top" id="tools">
        <div className="lx-wrap">
          <SectionTag>04 / MEET YOUR NEW TOOLS</SectionTag>
          <SplitWords text="A little order. At every step of the outfit." className="lx-h2" />
          <div className="lx-stack">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <article key={tool.tag} className="lx-stack-card" style={{ "--i": i }}>
                  <div className="lx-stack-copy">
                    <p className="lx-tag lx-tag-muted">{tool.tag}</p>
                    <h3>{tool.title}</h3>
                    <p>{tool.text}</p>
                  </div>
                  <div className="lx-widget">
                    <div className="lx-widget-icon">
                      <Icon size={22} />
                    </div>
                    <small>{tool.widgetLabel}</small>
                    <strong>{tool.widgetTitle}</strong>
                    <span>
                      <Check size={14} /> {tool.widgetNote}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 05 Workflows ── */}
      <section className="lx-section lx-light" id="workflows">
        <div className="lx-wrap">
          <SectionTag>05 / SMALL STARTS. BIG POSSIBILITIES.</SectionTag>
          <SplitWords text="Start with the work you do every day." className="lx-h2" />
          <div className="lx-flows">
            {FLOWS.map((flow, i) => {
              const Icon = flow.icon;
              return (
                <article key={flow.title} className="lx-flow" data-reveal style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
                  <p className="lx-flow-tag">FLOW / {String(i + 1).padStart(2, "0")}</p>
                  <div className="lx-flow-icon">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <h3>{flow.title}</h3>
                  <p>{flow.text}</p>
                  <span className="lx-flow-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 06 Pricing ── */}
      <section className="lx-section lx-light lx-tight-top" id="pricing">
        <div className="lx-wrap">
          <SectionTag>06 / ROOM TO GROW</SectionTag>
          <div className="lx-pricing-head">
            <SplitWords text="A plan for your next collection." className="lx-h2" />
            <div className="lx-toggle" role="tablist" aria-label="Billing cycle" data-reveal>
              <span className={`lx-toggle-pill ${cycle === "yearly" ? "is-right" : ""}`} aria-hidden="true" />
              <button
                type="button"
                role="tab"
                aria-selected={cycle === "monthly"}
                className={cycle === "monthly" ? "is-active" : ""}
                onClick={() => setCycle("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={cycle === "yearly"}
                className={cycle === "yearly" ? "is-active" : ""}
                onClick={() => setCycle("yearly")}
              >
                Yearly <em>Save {yearlySaving}%</em>
              </button>
            </div>
          </div>
          <div className="lx-plans">
            {PLANS.map((plan, i) => {
              const price = SUBSCRIPTION_PRICING[plan.key]?.[cycle];
              return (
                <article
                  key={plan.key}
                  className={`lx-plan ${plan.popular ? "is-popular" : ""}`}
                  data-reveal
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="lx-plan-top">
                    <h3>{plan.name}</h3>
                    {plan.popular && <span className="lx-badge">Most popular</span>}
                  </div>
                  <div className="lx-price">
                    {price ? (
                      <>
                        <strong key={`${plan.key}-${cycle}`} className="lx-price-num">
                          ₦{price.toLocaleString()}
                        </strong>
                        <span>/ {cycle === "monthly" ? "month" : "year"}</span>
                      </>
                    ) : (
                      <strong className="lx-price-num">Let's talk</strong>
                    )}
                  </div>
                  <p className="lx-plan-note">
                    {price
                      ? cycle === "monthly"
                        ? "Billed monthly. Cancel anytime."
                        : "Billed once a year."
                      : "Pricing built around your brand."}
                  </p>
                  <p className="lx-plan-blurb">{plan.blurb}</p>
                  <ul>
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={15} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`lx-btn ${plan.popular ? "lx-btn-accent" : "lx-btn-dark"} lx-btn-block`}
                    onClick={() => choosePlan(plan)}
                  >
                    <span
                      className="lx-btn-roll"
                      data-text={plan.key === "custom" ? "Contact us" : `Choose ${plan.name}`}
                    >
                      {plan.key === "custom" ? "Contact us" : `Choose ${plan.name}`}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 07 Stories ── */}
      <section className="lx-section lx-dark" id="stories">
        <div className="lx-wrap">
          <div className="lx-stories-head">
            <div>
              <SectionTag>07 / REVIEWS</SectionTag>
              <SplitWords text="Less stress. More room to create." className="lx-h2" />
            </div>
            <div className="lx-arrows">
              <button type="button" aria-label="Previous story" onClick={() => goStory(-1)}>
                <ArrowLeft size={18} />
              </button>
              <button type="button" aria-label="Next story" onClick={() => goStory(1)}>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="lx-story" data-reveal>
            <div className="lx-story-photo" key={`p-${story}`}>
              <img src={current.image} alt={current.name} loading="lazy" />
            </div>
            <div className="lx-story-copy" key={`c-${story}`}>
              <p className="lx-tag lx-tag-muted">{current.headline.toUpperCase()}</p>
              <blockquote>“{current.quote}”</blockquote>
              <div className="lx-story-who">
                <strong>{current.name}</strong>
                <span>{current.business}</span>
              </div>
              <div className="lx-dots">
                {TESTIMONIALS.map((t, i) => (
                  <button
                    type="button"
                    key={t.name}
                    aria-label={`Show story ${i + 1}`}
                    className={i === story ? "is-active" : ""}
                    onClick={() => {
                      setAutoplay(false);
                      setStory(i);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Floating reviews: an endless, slowly drifting row (pauses on hover) */}
          <div className="lx-review-marquee" data-reveal>
            <div className="lx-review-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <figure className="lx-review-card" key={`${t.name}-${i}`} aria-hidden={i >= TESTIMONIALS.length}>
                  <div className="lx-review-stars" aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption>
                    <img src={t.image} alt="" loading="lazy" />
                    <span>
                      <b>{t.name}</b>
                      <small>{t.business}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 FAQ ── */}
      <section className="lx-section lx-light" id="faq">
        <div className="lx-wrap lx-faq">
          <div>
            <SectionTag>08 / A LITTLE MORE CLARITY</SectionTag>
            <SplitWords text="Answers to the questions we hear most." className="lx-h2" />
            <div className="lx-faq-tabs" data-reveal>
              {Object.keys(FAQ).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  className={tab === faqTab ? "is-active" : ""}
                  onClick={() => {
                    setFaqTab(tab);
                    setOpenFaq(0);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="lx-faq-list" data-reveal>
            {FAQ[faqTab].map(({ q, a }, i) => {
              const open = openFaq === i;
              return (
                <div key={q} className={`lx-faq-item ${open ? "is-open" : ""}`}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}>
                    <span>{q}</span>
                    <Plus size={18} />
                  </button>
                  <div className="lx-faq-answer">
                    <p>{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingCta />
      <LandingFooter onHome />
    </div>
  );
};

export default Home;
