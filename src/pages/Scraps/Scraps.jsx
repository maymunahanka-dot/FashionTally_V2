import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Camera,
  Clock,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Recycle,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import { LandingCta, LandingFooter, LandingNav, IntroTitle, SectionTag } from "../Home/landingKit.jsx";
import { useRevealOnScroll, useScrollToTopOnMount } from "../Home/landingUtils.js";
import { tl } from "../../i18n";
import { CITIES, FABRICS } from "./scrapsDemo";
import { fetchPublicListings, reportListing, trackListing } from "../../backend/services/refabService";
import RefabGallery from "./RefabGallery";
import { imagesOf } from "./refabImages";
import "./swatches.css";
import "./Scraps.css";

const naira = (n) => (n === 0 ? tl("Free") : `₦${n.toLocaleString("en-NG")}`);

const timeAgo = (iso) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return tl("Today");
  if (days === 1) return tl("Yesterday");
  return `${days} ${tl("days ago")}`;
};

const STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" };

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function ListingCard({ item, onOpen }) {
  return (
    // No data-reveal: listings arrive from the backend after the page's scroll-reveal has started,
    // so they would stay hidden. They fade in with their own animation instead (.sc-card in Scraps.css).
    <article className={`sc-card ${item.status !== "available" ? "is-muted" : ""}`}>
      <div className="sc-card-media">
        <RefabGallery images={imagesOf(item)} alt={tl(item.title)} compact onOpen={() => onOpen(item)}>
          <span className="sc-chip sc-chip-fabric">{tl(item.fabric)}</span>
          {item.status !== "available" && <span className={`sc-status sc-status-${item.status}`}>{tl(STATUS_LABEL[item.status])}</span>}
        </RefabGallery>
      </div>
      <div className="sc-card-body">
        <div className="sc-card-top">
          <p className={`sc-price ${item.price === 0 ? "is-free" : ""}`}>{naira(item.price)}</p>
          <span className="sc-time"><Clock size={13} /> {timeAgo(item.postedAt)}</span>
        </div>
        <h3 className="sc-card-title">
          <button type="button" onClick={() => onOpen(item)}>{tl(item.title)}</button>
        </h3>
        <ul className="sc-meta">
          <li><Package size={14} /> {item.quantity}</li>
          <li><MapPin size={14} /> {item.area}, {item.city}</li>
        </ul>
        <div className="sc-card-foot">
          <span className="sc-seller">
            <span className="sc-avatar">{item.seller.charAt(0)}</span>
            {item.seller}
          </span>
          <button type="button" className="sc-link" onClick={() => onOpen(item)}>
            {tl("View")} <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ListingModal({ item, onClose }) {
  const [revealed, setRevealed] = useState(false);
  const [reported, setReported] = useState(false);
  useEffect(() => {
    trackListing(item.id, "view");
  }, [item.id]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const digits = item.phone.replace(/[^\d]/g, "");
  const canContact = item.status !== "sold";

  return (
    <div className="sc-modal-backdrop" onClick={onClose}>
      <div className="sc-modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sc-modal-close" onClick={onClose} aria-label={tl("Close")}>
          <X size={20} />
        </button>
        <div className="sc-modal-media">
          <RefabGallery images={imagesOf(item)} alt={tl(item.title)} keyboard>
            <span className="sc-chip sc-chip-fabric">{tl(item.fabric)}</span>
            {item.status !== "available" && <span className={`sc-status sc-status-${item.status}`}>{tl(STATUS_LABEL[item.status])}</span>}
          </RefabGallery>
        </div>
        <div className="sc-modal-body">
          <p className={`sc-price sc-price-lg ${item.price === 0 ? "is-free" : ""}`}>{naira(item.price)}</p>
          <h2 className="sc-modal-title">{tl(item.title)}</h2>
          <p className="sc-modal-desc">{tl(item.description)}</p>

          <dl className="sc-facts">
            <div><dt>{tl("Quantity")}</dt><dd>{item.quantity}</dd></div>
            <div><dt>{tl("Location")}</dt><dd>{item.area}, {item.city}</dd></div>
            <div><dt>{tl("Colours")}</dt><dd>{item.colours.map(tl).join(", ")}</dd></div>
            <div><dt>{tl("Delivery")}</dt><dd>{item.pickupOnly ? tl("Pick-up only") : tl("Pick-up or delivery")}</dd></div>
            <div><dt>{tl("Posted")}</dt><dd>{timeAgo(item.postedAt)}</dd></div>
          </dl>

          <div className="sc-seller-box">
            <span className="sc-avatar sc-avatar-lg">{item.seller.charAt(0)}</span>
            <div>
              <p className="sc-seller-name">{item.seller}</p>
              <p className="sc-seller-sub">{tl("Fashion business on FashionTally")}</p>
            </div>
          </div>

          {canContact ? (
            <div className="sc-contact">
              <a
                className="sc-btn sc-btn-wa"
                href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hi, I saw your "${item.title}" listing on FashionTally. Is it still available?`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackListing(item.id, "contact")}
              >
                <MessageCircle size={18} /> {tl("Chat on WhatsApp")}
              </a>
              {revealed ? (
                <a className="sc-btn sc-btn-outline" href={`tel:${digits}`}>
                  <Phone size={18} /> {item.phone}
                </a>
              ) : (
                <button
                  type="button"
                  className="sc-btn sc-btn-outline"
                  onClick={() => {
                    setRevealed(true);
                    trackListing(item.id, "contact");
                  }}
                >
                  <Phone size={18} /> {tl("Show phone number")}
                </button>
              )}
            </div>
          ) : (
            <p className="sc-sold-note">{tl("This listing has been sold.")}</p>
          )}

          {reported ? (
            <p className="sc-report">{tl("Thanks, we'll take a look at this listing.")}</p>
          ) : (
            <button
              type="button"
              className="sc-report"
              onClick={async () => {
                const reason = window.prompt(tl("What's wrong with this listing? (optional)"));
                if (reason === null) return;
                try {
                  await reportListing(item.id, reason);
                } finally {
                  setReported(true);
                }
              }}
            >
              <Flag size={14} /> {tl("Report this listing")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Fashion Refab: public marketplace for leftover fabric (UI with demo data for now) */
const Scraps = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useRevealOnScroll(rootRef);
  useScrollToTopOnMount();

  const [query, setQuery] = useState("");
  const [fabric, setFabric] = useState("All");
  const [city, setCity] = useState("All");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");
  const [hideSold, setHideSold] = useState(false);
  const [open, setOpen] = useState(null);

  const [data, setData] = useState({ listings: [], total: 0, page: 1, pages: 1, stats: { available: 0, free: 0, cities: 0 } });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);

  // Filters run on the server; the search box waits for typing to pause
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setLoading(true);
      setLoadError("");
      try {
        const next = await fetchPublicListings({ q: query.trim(), fabric, city, price, sort, hideSold, page });
        if (alive) setData((prev) => (page > 1 ? { ...next, listings: [...prev.listings, ...next.listings] } : next));
      } catch (error) {
        if (alive) setLoadError(error.message);
      } finally {
        if (alive) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, fabric, city, price, sort, hideSold, page]);

  const results = data.listings;

  const filtersOn = query || fabric !== "All" || city !== "All" || price !== "all" || hideSold;
  const clearFilters = () => {
    setPage(1);
    setQuery("");
    setFabric("All");
    setCity("All");
    setPrice("all");
    setHideSold(false);
  };

  const { available, free, cities } = data.stats;
  // Changing a filter starts again from the first page
  const filter = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  return (
    <div className="lx sc" ref={rootRef}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className="lx-hero lx-page-hero sc-hero">
        <div className="lx-hero-glow" aria-hidden="true" />
        <p className="lx-eyebrow lx-fade" style={{ animationDelay: "0.1s" }}>
          <Recycle size={14} className="sc-eyebrow-icon" /> {tl("FASHION REFAB · FABRIC MARKETPLACE")}
        </p>
        <IntroTitle lines={["Give leftover fabric", "a second life."]} />
        <p className="lx-hero-sub lx-fade" style={{ animationDelay: "0.75s" }}>
          {tl("Buy offcuts and remnants straight from tailors and fashion houses near you. Perfect for crafts, quilting, accessories and upcycling.")}
        </p>
        <div className="sc-hero-stats lx-fade" style={{ animationDelay: "0.9s" }}>
          <div><b>{available}</b><span>{tl("listings available")}</span></div>
          <div><b>{cities}</b><span>{cities === 1 ? tl("city") : tl("cities")}</span></div>
          <div><b>{free}</b><span>{tl("free to collect")}</span></div>
        </div>
      </section>

      {/* ── Browse ── */}
      <section className="lx-section lx-light sc-browse">
        <div className="lx-wrap">
          <div className="sc-toolbar">
            <label className="sc-search">
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => filter(setQuery)(e.target.value)}
                placeholder={tl("Search fabric, colour, city…")}
              />
            </label>
            <div className="sc-selects">
              <label className="sc-select">
                <MapPin size={16} />
                <select value={city} onChange={(e) => filter(setCity)(e.target.value)} aria-label={tl("City")}>
                  <option value="All">{tl("All cities")}</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="sc-select">
                <Tag size={16} />
                <select value={price} onChange={(e) => filter(setPrice)(e.target.value)} aria-label={tl("Price")}>
                  <option value="all">{tl("Any price")}</option>
                  <option value="free">{tl("Free only")}</option>
                  <option value="under10">{tl("Under ₦10,000")}</option>
                  <option value="over10">{tl("₦10,000 and above")}</option>
                </select>
              </label>
              <label className="sc-select">
                <SlidersHorizontal size={16} />
                <select value={sort} onChange={(e) => filter(setSort)(e.target.value)} aria-label={tl("Sort")}>
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{tl(s.label)}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="sc-chips" role="group" aria-label={tl("Fabric type")}>
            {["All", ...FABRICS].map((f) => (
              <button
                key={f}
                type="button"
                className={`sc-filter-chip ${fabric === f ? "is-on" : ""}`}
                onClick={() => filter(setFabric)(f)}
                aria-pressed={fabric === f}
              >
                {f === "All" ? tl("All fabrics") : tl(f)}
              </button>
            ))}
          </div>

          <div className="sc-results-bar">
            <p>
              <b>{data.total}</b> {data.total === 1 ? tl("listing") : tl("listings")}
              {filtersOn && (
                <button type="button" className="sc-clear" onClick={clearFilters}>{tl("Clear filters")}</button>
              )}
            </p>
            <label className="sc-toggle">
              <input type="checkbox" checked={hideSold} onChange={(e) => filter(setHideSold)(e.target.checked)} />
              <span className="sc-toggle-track" aria-hidden="true" />
              {tl("Hide sold")}
            </label>
          </div>

          {results.length ? (
            <>
              <div className="sc-grid">
                {results.map((item) => <ListingCard key={item.id} item={item} onOpen={setOpen} />)}
              </div>
              {data.page < data.pages && (
                <div className="sc-more">
                  <button type="button" className="lx-btn lx-btn-dark" onClick={() => setPage((p) => p + 1)} disabled={loading}>
                    {loading ? tl("Loading…") : tl("Show more")}
                  </button>
                </div>
              )}
            </>
          ) : loading ? (
            <div className="sc-empty">
              <p>{tl("Loading listings…")}</p>
            </div>
          ) : loadError ? (
            <div className="sc-empty">
              <h3>{tl("Couldn't load listings")}</h3>
              <p>{loadError}</p>
            </div>
          ) : filtersOn ? (
            <div className="sc-empty">
              <Search size={28} />
              <h3>{tl("No listings match your search")}</h3>
              <p>{tl("Try another fabric or city, or clear the filters.")}</p>
              <button type="button" className="lx-btn lx-btn-dark" onClick={clearFilters}>{tl("Clear filters")}</button>
            </div>
          ) : (
            <div className="sc-empty">
              <Recycle size={28} />
              <h3>{tl("No listings yet")}</h3>
              <p>{tl("Be the first to give leftover fabric a second life. Post from your FashionTally dashboard.")}</p>
              <button type="button" className="lx-btn lx-btn-dark" onClick={() => navigate("/dashboard/refab")}>{tl("Post a listing")}</button>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lx-section lx-dark sc-how">
        <div className="lx-wrap">
          <SectionTag>{tl("HOW IT WORKS")}</SectionTag>
          <h2 className="lx-h2 sc-how-title">{tl("Selling your leftover fabric takes a minute.")}</h2>
          <div className="sc-steps">
            {[
              { icon: Camera, title: "Snap and post", text: "Add photos, fabric type, quantity and your price, or list it for free." },
              { icon: MessageCircle, title: "Buyers reach out", text: "Crafters, quilters and recyclers contact you on WhatsApp or by phone." },
              { icon: Recycle, title: "Less waste, more income", text: "Mark it sold and turn offcuts into extra money instead of rubbish." },
            ].map((s, i) => (
              <div key={s.title} className="sc-step" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="sc-step-num">0{i + 1}</span>
                <span className="sc-step-icon"><s.icon size={22} /></span>
                <h3>{tl(s.title)}</h3>
                <p>{tl(s.text)}</p>
              </div>
            ))}
          </div>
          <div className="sc-how-cta" data-reveal>
            <p>{tl("Got leftover fabric? List it on Fashion Refab from your FashionTally dashboard.")}</p>
            <button type="button" className="lx-btn lx-btn-light" onClick={() => navigate("/signup")}>
              <span className="lx-btn-roll" data-text={tl("Start selling")}>{tl("Start selling")}</span>
            </button>
          </div>
        </div>
      </section>

      <LandingCta eyebrow="BUILT FOR DESIGNERS, BY A DESIGNER" title={tl("Run your whole fashion business in one place.")} />
      <LandingFooter />

      {open && <ListingModal item={open} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default Scraps;
