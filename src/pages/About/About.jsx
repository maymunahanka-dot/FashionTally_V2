import { createElement, useRef } from "react";
import { useNavigate } from "react-router-dom";
import founderPhoto from "../../assets/Image/about/founder.png";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Heart,
  MessageCircle,
  NotebookPen,
  Sheet,
  TrendingUp,
  Users,
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

const VALUES = [
  {
    icon: Heart,
    title: "Passion for fashion",
    text: "We understand the unique challenges and opportunities in the fashion industry.",
  },
  {
    icon: Users,
    title: "Community first",
    text: "Building tools that bring fashion designers and their clients closer together.",
  },
  {
    icon: TrendingUp,
    title: "Growth focused",
    text: "Every feature is designed to help fashion businesses scale and succeed.",
  },
  {
    icon: Award,
    title: "Quality excellence",
    text: "Committed to delivering the highest quality tools and support.",
  },
];

const SHIFTS = [
  { icon: NotebookPen, before: "Measurements in notebooks", after: "Client profiles you can open anywhere" },
  { icon: MessageCircle, before: "Orders scattered across WhatsApp", after: "Tracked orders with clear due dates" },
  { icon: Sheet, before: "Spreadsheets that never match reality", after: "Live finances, invoices and inventory" },
];

const About = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useRevealOnScroll(rootRef);
  useScrollToTopOnMount();

  return (
    <div className="lx" ref={rootRef}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className="lx-hero lx-page-hero">
        <div className="lx-hero-glow" aria-hidden="true" />
        <p className="lx-eyebrow lx-fade" style={{ animationDelay: "0.1s" }}>
          ABOUT FASHIONTALLY
        </p>
        <IntroTitle lines={["Empowering fashion", "creators worldwide."]} />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          We're on a mission to transform how fashion designers and brands manage their business, connect with
          clients, and scale their operations, built by people who understand your challenges.
        </p>
        <div className="lx-hero-ctas lx-fade" style={{ animationDelay: "0.9s" }}>
          <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/signup")}>
            <span className="lx-btn-roll" data-text="Start your free trial">
              Start your free trial
            </span>
          </button>
          <button type="button" className="lx-btn lx-btn-ghost" onClick={() => navigate("/contact")}>
            Talk to us <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 01 Story ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap lx-story-grid">
          <div className="lx-story-aside">
            <SectionTag>01 / OUR STORY</SectionTag>
            <SplitWords text="Born inside a real fashion studio." className="lx-h2" />
            <figure className="lx-founder-photo" data-reveal>
              <img src={founderPhoto} alt="Maimuna Anka, founder of FashionTally" loading="lazy" />
              <figcaption>
                <b>Maimuna Anka</b>
                <span>Founder, FashionTally</span>
              </figcaption>
            </figure>
          </div>
          <div className="lx-prose">
            <p data-reveal>
              Fashion Tally was born from the real, everyday challenges inside the African fashion industry:
              challenges that founder <strong>Maimuna Anka</strong> personally experienced while running her own
              fashion brand, <strong>Malaabis-By-Maymz</strong>.
            </p>
            <p data-reveal>
              For years, Maimuna managed client measurements in notebooks, tracked orders through scattered WhatsApp
              messages, monitored inventory manually, and handled finances using spreadsheets that rarely reflected
              the reality of production. She understood the stress of missing measurements, losing client details,
              delayed fittings, and the difficulty of staying consistent as the brand grew.
            </p>
            <p data-reveal>
              She also realised that thousands of designers across Africa faced the same problems, not because of a
              lack of talent, but because of a lack of the right tools. Existing software was often too complex, too
              expensive, or not built around how fashion designers actually work.
            </p>
            <p data-reveal>
              This inspired Fashion Tally, a platform built with a deep understanding of how African fashion
              businesses operate. Every feature, from client management and measurements to invoicing, appointments,
              inventory and CRM, is shaped by real industry pain points and tested with real designers.
            </p>
            <p data-reveal>
              The goal is simple but powerful: to bring structure, professionalism and digital growth to fashion
              entrepreneurs, so they can run their businesses with confidence and clarity.
            </p>
            <blockquote className="lx-quote" data-reveal>
              “Fashion Tally is more than software. It is a digital partner designed to help African designers stay
              organised, save time, scale with ease, and grow into global fashion brands.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── 02 Shift ── */}
      <section className="lx-section lx-dark">
        <div className="lx-wrap">
          <SectionTag>02 / WHAT WE SET OUT TO FIX</SectionTag>
          <SplitWords text="From scattered to structured." className="lx-h2" />
          <div className="lx-shifts">
            {SHIFTS.map((item, i) => (
              <div key={item.before} className="lx-shift" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="lx-shift-icon">{createElement(item.icon, { size: 20 })}</span>
                <p className="lx-shift-before">{item.before}</p>
                <ArrowRight className="lx-shift-arrow" size={20} />
                <p className="lx-shift-after">{item.after}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 Values ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap">
          <SectionTag>03 / WHAT DRIVES US</SectionTag>
          <SplitWords text="The values behind every feature." className="lx-h2" />
          <div className="lx-problems">
            {VALUES.map((v, i) => (
              <article key={v.title} className="lx-problem" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="lx-num">0{i + 1}</span>
                {createElement(v.icon, { size: 22, strokeWidth: 1.6 })}
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 Team ── */}
      <section className="lx-section lx-light lx-tight-top">
        <div className="lx-wrap">
          <div className="lx-founder" data-reveal>
            <div>
              <p className="lx-tag">04 / THE TEAM</p>
              <h3>A founder-led startup.</h3>
              <p>
                Fashion Tally is built and led by a committed founder with support from engineers and advisors, and
                shaped every day by the designers who use it.
              </p>
            </div>
            <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/contact")}>
              <span className="lx-btn-roll" data-text="Get in touch">
                Get in touch
              </span>
            </button>
          </div>
        </div>
      </section>

      <LandingCta eyebrow="BUILT FOR DESIGNERS, BY A DESIGNER" title="Ready to transform your fashion business?" />
      <LandingFooter />
    </div>
  );
};

export default About;
