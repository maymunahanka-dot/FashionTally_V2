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

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


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
  const { t: tx } = useTranslation();
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
          {tx("auto.contactUs_0384")}
        </p>
        <IntroTitle lines={["We're here to help", "you succeed."]} />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          {tx("auto.questionsAboutFashiontallyWantA_10b1")}
        </p>
        <div className="lx-hero-ctas lx-fade" style={{ animationDelay: "0.9s" }}>
          <a href="#message" className="lx-btn lx-btn-dark">
            <span className="lx-btn-roll" data-text="Send a message">
              {tx("auto.sendAMessage_dc26")}
            </span>
          </a>
          <button type="button" className="lx-btn lx-btn-ghost" onClick={() => navigate("/schedule-demo")}>
            {tx("auto.bookADemo_a83d")}{" "}<ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 01 Ways to reach us ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap">
          <SectionTag>{tx("auto.01WaysToReachUs_ac8b")}</SectionTag>
          <SplitWords text={tx("auto.pickWhateverIsEasiestFor_b4ae")} className="lx-h2" />
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
                <div className="lx-flow-icon">{tl(createElement(m.icon, { size: 22, strokeWidth: 1.6 }))}</div>
                <h3>{tl(m.title)}</h3>
                <p>{tl(m.text)}</p>
                <strong className="lx-method-contact">{tl(m.contact)}</strong>
                <small className="lx-method-meta">{tl(m.meta)}</small>
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
          <SectionTag>{tx("auto.02SendUsAMessage_b3a4")}</SectionTag>
          <SplitWords text={tx("auto.tellUsWhatYouNeed_90ea")} className="lx-h2" />
          <div className="lx-contact-grid">
            <form className="lx-form" onSubmit={handleSubmit} data-reveal>
              <div className="lx-form-row">
                <label>
                  <span>{tx("auto.fullName_ca27")}</span>
                  <input name="name" value={form.name} onChange={onChange} placeholder={tx("auto.yourFullName_d904")} required />
                </label>
                <label>
                  <span>{tx("auto.email_604e")}</span>
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
                  <span>{tx("auto.brandCompany_356e")}</span>
                  <input name="company" value={form.company} onChange={onChange} placeholder={tx("auto.yourFashionBrand_3e80")} />
                </label>
                <label>
                  <span>{tx("auto.phone_7706")}</span>
                  <input name="phone" type="tel" value={form.phone} onChange={onChange} placeholder={tx("auto.234XxxXxxXxxx_61ff")} />
                </label>
              </div>
              <div className="lx-form-row">
                <label>
                  <span>{tx("auto.subject_8d18")}</span>
                  <input name="subject" value={form.subject} onChange={onChange} placeholder={tx("auto.whatCanWeHelpWith_d3c4")} />
                </label>
                <label>
                  <span>{tx("auto.priority_886c")}</span>
                  <select name="priority" value={form.priority} onChange={onChange}>
                    <option value="low">{tx("auto.lowGeneralQuestion_adc3")}</option>
                    <option value="medium">{tx("auto.mediumNeedAssistance_77cc")}</option>
                    <option value="high">{tx("auto.highUrgentIssue_2a14")}</option>
                  </select>
                </label>
              </div>
              <label>
                <span>{tx("auto.message_8add")}</span>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                  placeholder={tx("auto.tellUsHowWeCan_beb6")}
                  required
                />
              </label>
              {status && (
                <p className={`lx-form-status is-${status.type}`} role="status">
                  {status.type === "ok" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
                  {tl(status.text)}
                </p>
              )}
              <button type="submit" className="lx-btn lx-btn-accent lx-btn-block" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={18} className="lx-spin" />{" "}{tx("auto.sending_cf76")}
                  </>
                ) : (
                  <>
                    {tx("auto.sendMessage_c70a")}{" "}<Send size={16} />
                  </>
                )}
              </button>
            </form>

            <aside className="lx-office" data-reveal style={{ transitionDelay: "0.1s" }}>
              <h3>{tx("auto.visitOurOffice_e41b")}</h3>
              <p className="lx-office-lead">{tx("auto.weDLoveToMeet_4277")}</p>
              <div className="lx-office-item">
                <Building2 size={18} />
                <div>
                  <b>{tx("auto.fashiontallyHeadquarters_7c4f")}</b>
                  <span>{tx("auto.no1GidadoRoadKano_5064")}</span>
                </div>
              </div>
              <div className="lx-office-item">
                <Clock3 size={18} />
                <div>
                  <b>{tx("auto.businessHours_026d")}</b>
                  <span>{tx("auto.monFri900Am_0a12")}</span>
                  <span>{tx("auto.saturday1000Am2_861f")}</span>
                  <span>{tx("auto.sundayClosed_ad59")}</span>
                </div>
              </div>
              <div className="lx-office-item">
                <Phone size={18} />
                <div>
                  <b>{tx("auto.directLine_01e4")}</b>
                  <a href="tel:+2349123124709">0912 312 4709</a>
                </div>
              </div>
              <div className="lx-office-item">
                <Mail size={18} />
                <div>
                  <b>{tx("auto.email_84ad")}</b>
                  <a href="mailto:fashiontallyy@gmail.com">{tx("auto.fashiontallyyGmailCom_f97f")}</a>
                </div>
              </div>
              <div className="lx-office-visit">
                <CalendarCheck size={20} />
                <div>
                  <b>{tx("auto.seeFashiontallyInAction_590c")}</b>
                  <span>{tx("auto.bookAPersonalisedDemoWith_57f1")}</span>
                </div>
              </div>
              <button type="button" className="lx-btn lx-btn-light lx-btn-block" onClick={() => navigate("/schedule-demo")}>
                <span className="lx-btn-roll" data-text="Book a demo">
                  {tx("auto.bookADemo_a83d")}
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
            <SectionTag>{tx("auto.03QuickAnswers_88af")}</SectionTag>
            <SplitWords text={tx("auto.questionsWeHearMost_9768")} className="lx-h2" />
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
                  {tl(tab)}
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
                    <span>{tl(q)}</span>
                    <Plus size={18} />
                  </button>
                  <div className="lx-faq-answer">
                    <p>{tl(a)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingCta eyebrow="STILL DECIDING?" title={tx("auto.tryItFreeSeeThe_dd25")} />
      <LandingFooter />
    </div>
  );
};

export default Contact;
