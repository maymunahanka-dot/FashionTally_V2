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

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";
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
  const { t: tx } = useTranslation();
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
          <SectionTag>{tx("auto.scheduleADemo_680e")}</SectionTag>
          <SplitWords text={tx("auto.letSScheduleYourDemo_6537")} className="lx-h2" />
          <p className="lx-demo-intro" data-reveal>
            {tx("auto.bookAPersonalisedDemoAnd_23aa")}
          </p>

          <div className="lx-contact-grid">
            <form className="lx-form" onSubmit={handleSubmit} data-reveal noValidate>
              <p className="lx-form-group">{tx("auto.yourDetails_a625")}</p>
              <div className="lx-form-row">
                <label>
                  <span>{tx("auto.fullName_ca27")}</span>
                  <input name="fullName" value={form.fullName} onChange={onChange} placeholder={tx("auto.yourFullName_d904")} required />
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
              <label>
                <span>{tx("auto.phoneNumber_f6fa")}</span>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={onChange}
                  placeholder={tx("auto.234XxxXxxXxxx_61ff")}
                  required
                />
              </label>

              <p className="lx-form-group">{tx("auto.yourBusiness_d8f3")}</p>
              <div className="lx-form-row">
                <label>
                  <span>{tx("auto.businessBrandName_b80d")}</span>
                  <input
                    name="businessName"
                    value={form.businessName}
                    onChange={onChange}
                    placeholder={tx("auto.yourFashionBrand_3e80")}
                    required
                  />
                </label>
                <label>
                  <span>{tx("auto.businessType_9e77")}</span>
                  <select name="businessType" value={form.businessType} onChange={onChange}>
                    <option value="">{tx("auto.selectYourBusinessType_2b48")}</option>
                    <option value="fashion-designer">{tx("auto.fashionDesigner_7d31")}</option>
                    <option value="tailor">{tx("auto.tailorSeamstress_ab54")}</option>
                    <option value="fashion-retailer">{tx("auto.fashionRetailer_ced4")}</option>
                    <option value="fashion-brand">{tx("auto.fashionBrand_6cea")}</option>
                    <option value="boutique">{tx("auto.boutiqueOwner_2111")}</option>
                    <option value="other">{tx("auto.other_6e6a")}</option>
                  </select>
                </label>
              </div>

              <p className="lx-form-group">{tx("auto.whenSuitsYou_7776")}</p>
              <div className="lx-form-row">
                <label>
                  <span>{tx("auto.preferredDate_130d")}</span>
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
                  <span>{tx("auto.preferredTime_13a0")}</span>
                  <select name="preferredTime" value={form.preferredTime} onChange={onChange} required>
                    <option value="">{tx("auto.selectTime_3d7f")}</option>
                    {TIMES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {tl(label)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>{tx("auto.messageOptional_e0de")}</span>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={onChange}
                  placeholder={tx("auto.tellUsAboutYourSpecific_513c")}
                />
              </label>

              {status && (
                <p className={`lx-form-status is-${status.type}`} role="status">
                  {status.type === "ok" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
                  {tl(status.text)}
                </p>
              )}

              <button type="submit" className="lx-btn lx-btn-accent lx-btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="lx-spin" />{" "}{tx("auto.schedulingDemo_c946")}
                  </>
                ) : (
                  <>
                    {tx("auto.scheduleMyDemo_0828")}{" "}<CalendarCheck size={16} />
                  </>
                )}
              </button>
            </form>

            <aside className="lx-office" data-reveal style={{ transitionDelay: "0.1s" }}>
              <h3>{tx("auto.whatToExpect_ed98")}</h3>
              <p className="lx-office-lead">{tx("auto.aFriendlyWalkthroughBuiltAround_3b65")}</p>
              <div className="lx-office-item">
                <Clock3 size={18} />
                <div>
                  <b>{tx("auto.3045Minutes_f1fa")}</b>
                  <span>{tx("auto.ourDemoSessionsCoverAll_c7ea")}</span>
                </div>
              </div>
              <div className="lx-office-item">
                <MessageCircle size={18} />
                <div>
                  <b>{tx("auto.weConfirmWithin24Hours_5420")}</b>
                  <span>{tx("auto.weLlReachOutTo_2049")}</span>
                </div>
              </div>
              <div className="lx-office-item lx-demo-list">
                <CalendarCheck size={18} />
                <div>
                  <b>{tx("auto.whatYouLlSee_cda6")}</b>
                  {WHAT_YOU_SEE.map((item) => (
                    <span key={item.text}>· {tl(item.text)}</span>
                  ))}
                </div>
              </div>
              <button type="button" className="lx-btn lx-btn-light lx-btn-block" onClick={() => navigate("/contact")}>
                <span className="lx-btn-roll" data-text="Have questions? Contact us">
                  {tx("auto.haveQuestionsContactUs_101d")}
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
