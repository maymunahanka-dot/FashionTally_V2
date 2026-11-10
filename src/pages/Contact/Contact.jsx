import { createElement, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Clock3,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  Phone,
  Plus,
  Send,
  Twitter,
} from "lucide-react";
import {
  IntroTitle,
  LandingCta,
  LandingFooter,
  LandingNav,
  SectionTag,
  SplitWords,
} from "../Home/landingKit.jsx";
import { useRevealOnScroll, useScrollToTopOnMount } from "../Home/landingUtils.js";

const METHODS = [
  {
    icon: Mail,
    title: "Email us",
    text: "Support, sales or general questions.",
    contact: "support@fashiontally.com",
    meta: "Replies within 24 hours",
    href: "mailto:support@fashiontally.com",
  },
  {
    icon: Phone,
    title: "Call our office",
    text: "Speak directly with our team.",
    contact: "+234 912 312 4709",
    meta: "Mon – Fri, 9am – 5pm",
    href: "tel:+2349123124709",
  },
  {
    icon: Twitter,
    title: "X (Twitter)",
    text: "Product updates, tips and news.",
    contact: "@fashion_tally",
    meta: "Follow along",
    href: "https://x.com/fashion_tally?s=11",
  },
  {
    icon: Instagram,
    title: "Instagram",
    text: "Community stories and inspiration.",
    contact: "@fashiontallyapp",
    meta: "DMs open",
    href: "https://www.instagram.com/fashiontallyapp?igsh=Yzc2bjE3N3FwMXpj&utm_source=qr",
  },
  {
    icon: Linkedin,
    title: "LinkedIn",
    text: "Company and business updates.",
    contact: "Fashion Tally",
    meta: "Connect with us",
    href: "https://www.linkedin.com/company/fashion-tally/",
  },
];

const FAQS = [
  {
    category: "Getting started",
    q: "How quickly can I get started?",
    a: "Right away. Sign up, add your first client and order, and you're running. If you'd like a walkthrough, book a demo and we'll show you around.",
  },
  {
    category: "Getting started",
    q: "Can I bring in my existing client records?",
    a: "Yes. Get in touch and our team will help you move your existing client details and measurements into FashionTally.",
  },
  {
    category: "Support",
    q: "Do you offer training and support?",
    a: "Yes. We help you get set up, and our team is reachable by email, phone and the support tickets inside the app.",
  },
  {
    category: "Billing",
    q: "How do I pay?",
    a: "Plans are paid securely in Naira through Flutterwave, monthly or yearly.",
  },
  {
    category: "Billing",
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can cancel whenever you like from your subscription settings, with no cancellation fee.",
  },
  {
    category: "Security",
    q: "Is my data secure?",
    a: "Your data is private to your business, protected by your login, sent over encrypted connections, and only shared with team members you invite.",
  },
];

const EMPTY_FORM = { name: "", email: "", company: "", phone: "", subject: "", message: "", priority: "medium" };

const Contact = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useRevealOnScroll(rootRef);
  useScrollToTopOnMount();

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }
  const [faqTab, setFaqTab] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  const categories = ["All", ...new Set(FAQS.map((f) => f.category))];
  const visibleFaqs = faqTab === "All" ? FAQS : FAQS.filter((f) => f.category === faqTab);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm(EMPTY_FORM);
        setStatus({ type: "ok", text: "Message sent! We'll get back to you within 24 hours." });
      } else {
        setStatus({ type: "error", text: data.error || "Failed to send message. Please try again." });
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus({ type: "error", text: "Failed to send message. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lx" ref={rootRef}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className="lx-hero lx-page-hero">
        <div className="lx-hero-glow" aria-hidden="true" />
        <p className="lx-eyebrow lx-fade" style={{ animationDelay: "0.1s" }}>
          CONTACT US
        </p>
        <IntroTitle lines={["We're here to help", "you succeed."]} />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          Questions about FashionTally? Want a demo, or help getting started? Our team is ready to support you on
          your fashion business journey.
        </p>
        <div className="lx-hero-ctas lx-fade" style={{ animationDelay: "0.9s" }}>
          <a href="#message" className="lx-btn lx-btn-dark">
            <span className="lx-btn-roll" data-text="Send a message">
              Send a message
            </span>
          </a>
          <button type="button" className="lx-btn lx-btn-ghost" onClick={() => navigate("/schedule-demo")}>
            Book a demo <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 01 Ways to reach us ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap">
          <SectionTag>01 / WAYS TO REACH US</SectionTag>
          <SplitWords text="Pick whatever is easiest for you." className="lx-h2" />
          <div className="lx-methods">
            {METHODS.map((m, i) => (
              <a
                key={m.title}
                href={m.href}
                target={m.href.startsWith("http") ? "_blank" : undefined}
                rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="lx-flow lx-method"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="lx-flow-icon">{createElement(m.icon, { size: 22, strokeWidth: 1.6 })}</div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
                <strong className="lx-method-contact">{m.contact}</strong>
                <small className="lx-method-meta">{m.meta}</small>
                <span className="lx-flow-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 Form + office ── */}
      <section className="lx-section lx-dark" id="message">
        <div className="lx-wrap">
          <SectionTag>02 / SEND US A MESSAGE</SectionTag>
          <SplitWords text="Tell us what you need." className="lx-h2" />
          <div className="lx-contact-grid">
            <form className="lx-form" onSubmit={handleSubmit} data-reveal>
              <div className="lx-form-row">
                <label>
                  <span>Full name *</span>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your full name" required />
                </label>
                <label>
                  <span>Email *</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@email.com"
                    required
                  />
                </label>
              </div>
              <div className="lx-form-row">
                <label>
                  <span>Brand / company</span>
                  <input name="company" value={form.company} onChange={onChange} placeholder="Your fashion brand" />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+234 xxx xxx xxxx" />
                </label>
              </div>
              <div className="lx-form-row">
                <label>
                  <span>Subject</span>
                  <input name="subject" value={form.subject} onChange={onChange} placeholder="What can we help with?" />
                </label>
                <label>
                  <span>Priority</span>
                  <select name="priority" value={form.priority} onChange={onChange}>
                    <option value="low">Low – general question</option>
                    <option value="medium">Medium – need assistance</option>
                    <option value="high">High – urgent issue</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Message *</span>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell us how we can help — include any details about your fashion business."
                  required
                />
              </label>
              {status && (
                <p className={`lx-form-status is-${status.type}`} role="status">
                  {status.type === "ok" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
                  {status.text}
                </p>
              )}
              <button type="submit" className="lx-btn lx-btn-accent lx-btn-block" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={18} className="lx-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={16} />
                  </>
                )}
              </button>
            </form>

            <aside className="lx-office" data-reveal style={{ transitionDelay: "0.1s" }}>
              <h3>Visit our office</h3>
              <p className="lx-office-lead">We'd love to meet you in person.</p>
              <div className="lx-office-item">
                <Building2 size={18} />
                <div>
                  <b>FashionTally Headquarters</b>
                  <span>No 1 Gidado Road, Kano, Kano State, Nigeria</span>
                </div>
              </div>
              <div className="lx-office-item">
                <Clock3 size={18} />
                <div>
                  <b>Business hours</b>
                  <span>Mon – Fri: 9:00 AM – 6:00 PM WAT</span>
                  <span>Saturday: 10:00 AM – 2:00 PM WAT</span>
                  <span>Sunday: Closed</span>
                </div>
              </div>
              <div className="lx-office-item">
                <Phone size={18} />
                <div>
                  <b>Direct line</b>
                  <a href="tel:+2349123124709">0912 312 4709</a>
                </div>
              </div>
              <div className="lx-office-item">
                <Mail size={18} />
                <div>
                  <b>Email</b>
                  <a href="mailto:fashiontallyy@gmail.com">fashiontallyy@gmail.com</a>
                </div>
              </div>
              <div className="lx-office-visit">
                <CalendarCheck size={20} />
                <div>
                  <b>See FashionTally in action</b>
                  <span>Book a personalised demo with our team.</span>
                </div>
              </div>
              <button type="button" className="lx-btn lx-btn-light lx-btn-block" onClick={() => navigate("/schedule-demo")}>
                <span className="lx-btn-roll" data-text="Book a demo">
                  Book a demo
                </span>
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 03 FAQ ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap lx-faq">
          <div>
            <SectionTag>03 / QUICK ANSWERS</SectionTag>
            <SplitWords text="Questions we hear most." className="lx-h2" />
            <div className="lx-faq-tabs" data-reveal>
              {categories.map((tab) => (
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
            {visibleFaqs.map(({ q, a }, i) => {
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

      <LandingCta eyebrow="STILL DECIDING?" title="Try it free. See the difference." />
      <LandingFooter />
    </div>
  );
};

export default Contact;
