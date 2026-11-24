import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Eye, MessageCircle, MapPin, Pencil, Trash2, ExternalLink } from "lucide-react";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddScrapPanel from "../../../../pannel_pages/AddScrapPanel/AddScrapPanel";
import { deleteListing, getMyListings, setListingStatus } from "../../../../backend/services/refabService";
import RefabGallery from "../../../Scraps/RefabGallery";
import { imagesOf } from "../../../Scraps/refabImages";
import { tl } from "../../../../i18n";
import "../../../Scraps/swatches.css";
import "./MyScraps.css";

/**
 * Dashboard tab where a business posts and manages its Fashion Refab listings (leftover fabric).
 * Listings are saved in the backend (/api/refab) and show on the public /refab page.
 */

const TABS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "sold", label: "Sold" },
];

const STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" };

const naira = (n) => (n === 0 ? tl("Free") : `₦${Number(n).toLocaleString("en-NG")}`);

const timeAgo = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return tl("Today");
  if (days === 1) return tl("Yesterday");
  return `${days} ${tl("days ago")}`;
};

function ScrapRow({ item, onEdit, onDelete, onStatus }) {
  return (
    <article className={`ms-card ${item.status === "sold" ? "is-sold" : ""}`}>
      <div className="ms-media">
        <RefabGallery images={imagesOf(item)} alt={item.title} compact>
          <span className={`ms-status ms-status-${item.status}`}>{tl(STATUS_LABEL[item.status])}</span>
        </RefabGallery>
      </div>

      <div className="ms-body">
        <div className="ms-top">
          <h3 className="ms-title">{item.title}</h3>
          <span className={`ms-price ${item.price === 0 ? "is-free" : ""}`}>{naira(item.price)}</span>
        </div>
        <p className="ms-meta">
          {tl(item.fabric)} · {item.quantity}
        </p>
        <p className="ms-meta ms-loc">
          <MapPin size={13} /> {item.area}, {item.city} · {timeAgo(item.postedAt)}
        </p>

        <div className="ms-stats">
          <span>
            <Eye size={14} /> {item.views} {tl("views")}
          </span>
          <span>
            <MessageCircle size={14} /> {item.enquiries} {tl("enquiries")}
          </span>
        </div>

        <div className="ms-actions">
          <label className="ms-status-select">
            <span className="sr-only">{tl("Status")}</span>
            <select value={item.status} onChange={(e) => onStatus(item.id, e.target.value)}>
              <option value="available">{tl("Available")}</option>
              <option value="reserved">{tl("Reserved")}</option>
              <option value="sold">{tl("Sold")}</option>
            </select>
          </label>
          <button type="button" className="ms-icon-btn" onClick={() => onEdit(item)} aria-label={tl("Edit listing")} title={tl("Edit")}>
            <Pencil size={16} />
          </button>
          <button type="button" className="ms-icon-btn is-danger" onClick={() => onDelete(item)} aria-label={tl("Delete listing")} title={tl("Delete")}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

const MyScraps = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => {
    const c = { all: listings.length, available: 0, reserved: 0, sold: 0 };
    listings.forEach((l) => (c[l.status] += 1));
    return c;
  }, [listings]);

  const totals = useMemo(
    () => ({
      views: listings.reduce((s, l) => s + (l.views || 0), 0),
      enquiries: listings.reduce((s, l) => s + (l.enquiries || 0), 0),
    }),
    [listings],
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings
      .filter((l) => tab === "all" || l.status === tab)
      .filter((l) => !q || `${l.title} ${l.fabric} ${l.area} ${l.city}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }, [listings, tab, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setListings(await getMyListings());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // First load (the retry button calls load())
  useEffect(() => {
    let alive = true;
    getMyListings()
      .then((rows) => alive && setListings(rows))
      .catch((error) => alive && setLoadError(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const flash = (msg) => {
    setNotice(msg);
    window.clearTimeout(flash.t);
    flash.t = window.setTimeout(() => setNotice(""), 3200);
  };

  const openNew = () => {
    setEditing(null);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setEditing(null);
  };

  // The panel has already saved the listing; just show it
  const handleSubmit = (listing, wasEdit) => {
    setListings((prev) => (prev.some((l) => l.id === listing.id) ? prev.map((l) => (l.id === listing.id ? listing : l)) : [listing, ...prev]));
    flash(tl(wasEdit ? "Listing updated" : "Listing posted. It's now on the public Fashion Refab page."));
    closePanel();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(tl("Delete this listing? Buyers will no longer see it."))) return;
    try {
      await deleteListing(item.id);
      setListings((prev) => prev.filter((l) => l.id !== item.id));
      flash(tl("Listing deleted"));
    } catch (error) {
      flash(error.message);
    }
  };

  const handleStatus = async (id, status) => {
    const before = listings;
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await setListingStatus(id, status);
    } catch (error) {
      setListings(before);
      flash(error.message);
    }
  };

  return (
    <div className="ms-page">
      <header className="ms-header">
        <div>
          <h1 className="ms-heading">{tl("Fashion Refab")}</h1>
          <p className="ms-sub">{tl("Sell or give away your leftover fabric to other designers and crafters.")}</p>
        </div>
        <div className="ms-header-actions">
          <Link to="/refab" target="_blank" rel="noopener" className="ms-public-link">
            <ExternalLink size={16} /> {tl("View public page")}
          </Link>
          <Button variant="primary" size="medium" icon={<Plus size={18} />} iconPosition="left" onClick={openNew} className="ms-add-btn">
            {tl("Post a listing")}
          </Button>
        </div>
      </header>

      <section className="ms-stats-row" aria-label={tl("Summary")}>
        <div className="ms-stat">
          <span>{tl("Live listings")}</span>
          <b>{counts.available + counts.reserved}</b>
        </div>
        <div className="ms-stat">
          <span>{tl("Sold / given away")}</span>
          <b>{counts.sold}</b>
        </div>
        <div className="ms-stat">
          <span>{tl("Total views")}</span>
          <b>{totals.views.toLocaleString()}</b>
        </div>
        <div className="ms-stat">
          <span>{tl("Enquiries")}</span>
          <b>{totals.enquiries}</b>
        </div>
      </section>

      <div className="ms-toolbar">
        <div className="ms-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`ms-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {tl(t.label)} <span>{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="ms-search">
          <Search size={18} />
          <input type="search" placeholder={tl("Search your listings")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && !listings.length ? (
        <div className="ms-empty is-small">
          <p>{tl("Loading your listings…")}</p>
        </div>
      ) : loadError ? (
        <div className="ms-empty is-small">
          <p>{tl("Couldn't load your listings.")} {loadError}</p>
          <Button variant="outline" size="medium" onClick={load}>{tl("Try again")}</Button>
        </div>
      ) : shown.length > 0 ? (
        <div className="ms-grid">
          {shown.map((item) => (
            <ScrapRow
              key={item.id}
              item={item}
              onEdit={(l) => {
                setEditing(l);
                setPanelOpen(true);
              }}
              onDelete={handleDelete}
              onStatus={handleStatus}
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="ms-empty">
          <div className="ms-empty-swatch sc-sw-ankara" aria-hidden="true" />
          <h3>{tl("Got leftover fabric?")}</h3>
          <p>{tl("Post your offcuts and leftover fabric. Other designers, students and crafters near you can buy them or collect them for free.")}</p>
          <Button variant="primary" size="medium" icon={<Plus size={18} />} iconPosition="left" onClick={openNew}>
            {tl("Post your first listing")}
          </Button>
        </div>
      ) : (
        <div className="ms-empty is-small">
          <p>{tl("No listings match. Try another tab or search.")}</p>
        </div>
      )}

      {notice && (
        <div className="ms-toast" role="status">
          {notice}
        </div>
      )}

      <SlideInMenu isShow={panelOpen} onClose={closePanel} position="rightt" width="440px">
        <AddScrapPanel onClose={closePanel} onSubmit={handleSubmit} initialData={editing} />
      </SlideInMenu>
    </div>
  );
};

export default MyScraps;
