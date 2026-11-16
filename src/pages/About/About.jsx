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

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";


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
  const { t: tx } = useTranslation();
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
          {tx("auto.aboutFashiontally_8c18")}
        </p>
        <IntroTitle lines={["Empowering fashion", "creators worldwide."]} />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          {tx("auto.weReOnAMission_4ad6")}
        </p>
        <div className="lx-hero-ctas lx-fade" style={{ animationDelay: "0.9s" }}>
          <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/signup")}>
            <span className="lx-btn-roll" data-text="Start your free trial">
              {tx("auto.startYourFreeTrial_777c")}
            </span>
          </button>
          <button type="button" className="lx-btn lx-btn-ghost" onClick={() => navigate("/contact")}>
            {tx("auto.talkToUs_9021")}{" "}<ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 01 Story ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap lx-story-grid">
          <div className="lx-story-aside">
            <SectionTag>{tx("auto.01OurStory_7951")}</SectionTag>
            <SplitWords text={tx("auto.bornInsideARealFashion_6f1a")} className="lx-h2" />
            <figure className="lx-founder-photo" data-reveal>
              <img src={founderPhoto} alt="Maimuna Anka, founder of FashionTally" loading="lazy" />
              <figcaption>
                <b>{tx("auto.maimunaAnka_bed0")}</b>
                <span>{tx("auto.founderFashiontally_cf23")}</span>
              </figcaption>
            </figure>
          </div>
          <div className="lx-prose">
            <p data-reveal>
              {tx("auto.fashionTallyWasBornFrom_e51c")}{" "}<strong>{tx("auto.maimunaAnka_bed0")}</strong>{" "}{tx("auto.personallyExperiencedWhileRunnin_3ef2")}{" "}<strong>{tx("auto.malaabisByMaymz_e18a")}</strong>.
            </p>
            <p data-reveal>
              {tx("auto.forYearsMaimunaManagedClient_1241")}
            </p>
            <p data-reveal>
              {tx("auto.sheAlsoRealisedThatThousands_a934")}
            </p>
            <p data-reveal>
              {tx("auto.thisInspiredFashionTallyA_7cb9")}
            </p>
            <p data-reveal>
              {tx("auto.theGoalIsSimpleBut_3b31")}
            </p>
            <blockquote className="lx-quote" data-reveal>
              {tx("auto.fashionTallyIsMoreThan_8f25")}
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── 02 Shift ── */}
      <section className="lx-section lx-dark">
        <div className="lx-wrap">
          <SectionTag>{tx("auto.02WhatWeSetOut_63df")}</SectionTag>
          <SplitWords text={tx("auto.fromScatteredToStructured_076c")} className="lx-h2" />
          <div className="lx-shifts">
            {SHIFTS.map((item, i) => (
              <div key={item.before} className="lx-shift" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="lx-shift-icon">{tl(createElement(item.icon, { size: 20 }))}</span>
                <p className="lx-shift-before">{tl(item.before)}</p>
                <ArrowRight className="lx-shift-arrow" size={20} />
                <p className="lx-shift-after">{tl(item.after)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 Values ── */}
      <section className="lx-section lx-light">
        <div className="lx-wrap">
          <SectionTag>{tx("auto.03WhatDrivesUs_f206")}</SectionTag>
          <SplitWords text={tx("auto.theValuesBehindEveryFeature_15ef")} className="lx-h2" />
          <div className="lx-problems">
            {VALUES.map((v, i) => (
              <article key={v.title} className="lx-problem" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="lx-num">0{i + 1}</span>
                {tl(createElement(v.icon, { size: 22, strokeWidth: 1.6 }))}
                <h3>{tl(v.title)}</h3>
                <p>{tl(v.text)}</p>
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
              <p className="lx-tag">{tx("auto.04TheTeam_5262")}</p>
              <h3>{tx("auto.aFounderLedStartup_7822")}</h3>
              <p>
                {tx("auto.fashionTallyIsBuiltAnd_169e")}
              </p>
            </div>
            <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/contact")}>
              <span className="lx-btn-roll" data-text="Get in touch">
                {tx("auto.getInTouch_c49b")}
              </span>
            </button>
          </div>
        </div>
      </section>

      <LandingCta eyebrow="BUILT FOR DESIGNERS, BY A DESIGNER" title={tx("auto.readyToTransformYourFashion_741b")} />
      <LandingFooter />
    </div>
  );
};

export default About;
