/**
 * Shared layout for the legal pages (Privacy Policy, Terms of Service, Cookie Policy)
 * in the same dark style as the landing pages. Each page passes its own policy text.
 */
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { IntroTitle, LandingFooter, LandingNav } from "./landingKit.jsx";
import { useRevealOnScroll, useScrollToTopOnMount } from "./landingUtils.js";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Main sections start with a number ("1. …"); the rest are short notes that belong to the section above. */
const isMain = (title) => /^\d+\./.test(title);

export default function LegalPage({ eyebrow, titleLines, lastUpdated, intro, sections, badgeFor, children }) {
  const { t: tx } = useTranslation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useRevealOnScroll(rootRef);
  useScrollToTopOnMount();

  const toc = sections.filter((s) => isMain(s.title));

  return (
    <div className="lx" ref={rootRef}>
      <LandingNav />

      <section className="lx-section lx-dark lx-legal">
        <div className="lx-wrap">
          <p className="lx-tag lx-fade">{tl(eyebrow)}</p>
          <IntroTitle className="lx-legal-title" lines={titleLines} startDelay={0.1} />
          <div className="lx-legal-meta lx-fade" style={{ animationDelay: "0.5s" }}>
            <span>
              <CalendarDays size={15} />{" "}{tx("auto.lastUpdated_583c")}{" "}{tl(lastUpdated)}
            </span>
          </div>
          <p className="lx-legal-intro lx-fade" style={{ animationDelay: "0.6s" }}>
            {tl(intro)}
          </p>

          <div className="lx-legal-grid">
            <nav className="lx-legal-toc" aria-label="On this page">
              <p>{tx("auto.onThisPage_7e43")}</p>
              {toc.map((s) => (
                <a key={s.title} href={`#${slug(s.title)}`}>
                  {tl(s.title)}
                </a>
              ))}
            </nav>

            <div className="lx-legal-body">
              {sections.map((s, i) =>
                // Unnumbered sections before the first numbered one (e.g. "Introduction") are full sections too.
                isMain(s.title) || !sections.slice(0, i).some((p) => isMain(p.title)) ? (
                  <article key={s.title} id={slug(s.title)} className="lx-legal-section" data-reveal>
                    <h2>
                      {tl(s.title)}
                      {badgeFor?.(s.title)}
                    </h2>
                    {s.content && <p>{tl(s.content)}</p>}
                    {s.list?.length > 0 && (
                      <ul>
                        {s.list.map((item) => (
                          <li key={item}>{tl(item)}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ) : (
                  <aside key={s.title} className="lx-legal-note" data-reveal>
                    <h3>
                      {tl(s.title)}
                      {badgeFor?.(s.title)}
                    </h3>
                    {s.content && <p>{tl(s.content)}</p>}
                    {s.list?.length > 0 && (
                      <ul>
                        {s.list.map((item) => (
                          <li key={item}>{tl(item)}</li>
                        ))}
                      </ul>
                    )}
                  </aside>
                ),
              )}

              {children}

              <div className="lx-legal-contact" data-reveal>
                <Mail size={20} />
                <div>
                  <b>{tx("auto.questionsAboutThisPage_8c04")}</b>
                  <span>{tx("auto.ourTeamIsHappyTo_5723")}</span>
                </div>
                <button type="button" className="lx-btn lx-btn-light lx-btn-sm" onClick={() => navigate("/contact")}>
                  {tx("auto.contactUs_4832")}{" "}<ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
