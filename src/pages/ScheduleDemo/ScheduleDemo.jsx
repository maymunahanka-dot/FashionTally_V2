import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Clock3,
  LoaderCircle,
  MessageCircle,
  Ruler,
  Receipt,
  Users,
} from "lucide-react";
import { LandingFooter, LandingNav, SectionTag, SplitWords } from "../Home/landingKit.jsx";
import { useRevealOnScroll, useScrollToTopOnMount } from "../Home/landingUtils.js";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  businessName: "",
  businessType: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
};

const REQUIRED = ["fullName", "email", "phoneNumber", "businessName", "preferredDate", "preferredTime"];

const TIMES = [
  ["09:00", "9:00 AM"],
  ["10:00", "10:00 AM"],
  ["11:00", "11:00 AM"],
  ["12:00", "12:00 PM"],
  ["13:00", "1:00 PM"],
  ["14:00", "2:00 PM"],
  ["15:00", "3:00 PM"],
  ["16:00", "4:00 PM"],
  ["17:00", "5:00 PM"],
];

const WHAT_YOU_SEE = [
  { icon: Users, text: "Setting up clients and saving their measurements" },
  { icon: Ruler, text: "Taking a custom order from request to delivery" },
  { icon: Receipt, text: "Sending invoices and tracking payments" },
  { icon: CalendarCheck, text: "Booking fittings and getting reminders" },
];

const ScheduleDemo = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useRevealOnScroll(rootRef);
  useScrollToTopOnMount();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Earliest bookable day is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (REQUIRED.some((field) => !form[field])) {
      setStatus({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/demo-request/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to submit");

      setForm(EMPTY_FORM);
      setStatus({
        type: "ok",
        text: "Demo scheduled! We'll contact you soon to confirm your appointment. Taking you back home…",
      });
      setTimeout(() => navigate("/?demo=scheduled"), 2500);
    } catch (error) {
      console.error("Error scheduling demo:", error);
      setStatus({ type: "error", text: "Failed to schedule demo. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lx" ref={rootRef}>
      <LandingNav />

      {/* ── Form (first on the page, so it clears the floating menu bar) ── */}
      <section className="lx-section lx-dark lx-demo-page" id="book">
        <div className="lx-wrap">
          <SectionTag>SCHEDULE A DEMO</SectionTag>
          <SplitWords text="Let's schedule your demo." className="lx-h2" />
          <p className="lx-demo-intro" data-reveal>
            Book a personalised demo and see how FashionTally can transform your fashion business.
          </p>

          <div className="lx-contact-grid">
            <form className="lx-form" onSubmit={handleSubmit} data-reveal noValidate>
              <p className="lx-form-group">Your details</p>
              <div className="lx-form-row">
                <label>
                  <span>Full name *</span>
                  <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Your full name" required />
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
              <label>
                <span>Phone number *</span>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={onChange}
                  placeholder="+234 xxx xxx xxxx"
                  required
                />
              </label>

              <p className="lx-form-group">Your business</p>
              <div className="lx-form-row">
                <label>
                  <span>Business / brand name *</span>
                  <input
                    name="businessName"
                    value={form.businessName}
                    onChange={onChange}
                    placeholder="Your fashion brand"
                    required
                  />
                </label>
                <label>
                  <span>Business type</span>
                  <select name="businessType" value={form.businessType} onChange={onChange}>
                    <option value="">Select your business type</option>
                    <option value="fashion-designer">Fashion Designer</option>
                    <option value="tailor">Tailor/Seamstress</option>
                    <option value="fashion-retailer">Fashion Retailer</option>
                    <option value="fashion-brand">Fashion Brand</option>
                    <option value="boutique">Boutique Owner</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <p className="lx-form-group">When suits you</p>
              <div className="lx-form-row">
                <label>
                  <span>Preferred date *</span>
                  <input
                    name="preferredDate"
                    type="date"
                    min={minDate}
                    value={form.preferredDate}
                    onChange={onChange}
                    required
                  />
                </label>
                <label>
                  <span>Preferred time *</span>
                  <select name="preferredTime" value={form.preferredTime} onChange={onChange} required>
                    <option value="">Select time</option>
                    {TIMES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Message (optional)</span>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell us about your specific needs or questions about FashionTally…"
                />
              </label>

              {status && (
                <p className={`lx-form-status is-${status.type}`} role="status">
                  {status.type === "ok" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
                  {status.text}
                </p>
              )}

              <button type="submit" className="lx-btn lx-btn-accent lx-btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="lx-spin" /> Scheduling demo…
                  </>
                ) : (
                  <>
                    Schedule my demo <CalendarCheck size={16} />
                  </>
                )}
              </button>
            </form>

            <aside className="lx-office" data-reveal style={{ transitionDelay: "0.1s" }}>
              <h3>What to expect</h3>
              <p className="lx-office-lead">A friendly walkthrough, built around your business.</p>
              <div className="lx-office-item">
                <Clock3 size={18} />
                <div>
                  <b>30–45 minutes</b>
                  <span>Our demo sessions cover all the key features of FashionTally.</span>
                </div>
              </div>
              <div className="lx-office-item">
                <MessageCircle size={18} />
                <div>
                  <b>We confirm within 24 hours</b>
                  <span>We'll reach out to confirm your date and time.</span>
                </div>
              </div>
              <div className="lx-office-item lx-demo-list">
                <CalendarCheck size={18} />
                <div>
                  <b>What you'll see</b>
                  {WHAT_YOU_SEE.map((item) => (
                    <span key={item.text}>· {item.text}</span>
                  ))}
                </div>
              </div>
              <button type="button" className="lx-btn lx-btn-light lx-btn-block" onClick={() => navigate("/contact")}>
                <span className="lx-btn-roll" data-text="Have questions? Contact us">
                  Have questions? Contact us
                </span>
              </button>
            </aside>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ScheduleDemo;
