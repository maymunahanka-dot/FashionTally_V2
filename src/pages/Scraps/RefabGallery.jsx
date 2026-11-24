import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tl } from "../../i18n";
import "./gallery.css";

const Slide = ({ image, alt }) =>
  image.url ? (
    <img className="rg-img" src={image.url} alt={alt} draggable="false" />
  ) : (
    <div className={`sc-swatch sc-sw-${image.swatch} ${image.variant ? `rg-v${image.variant}` : ""}`} aria-hidden="true" />
  );

/**
 * @param images   list from imagesOf()
 * @param compact  card version: arrows show on hover, dots instead of thumbnails
 * @param onOpen   clicking the photo (not the arrows) calls this, e.g. to open the listing
 * @param keyboard listen to ← / → keys (for the open listing)
 */
export default function RefabGallery({ images, alt = "", compact = false, onOpen, keyboard = false, children }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const touch = useRef(null);
  const go = (step) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    if (!keyboard || count < 2) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard, count]);

  const arrow = (step) => (e) => {
    e.stopPropagation();
    go(step);
  };

  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current == null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  return (
    <div className={`rg ${compact ? "rg-compact" : ""}`}>
      <div
        className={`rg-stage ${onOpen ? "is-clickable" : ""}`}
        onClick={onOpen}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={onOpen ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen()) : undefined}
        aria-label={onOpen ? alt : undefined}
      >
        <div className="rg-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {images.map((img, i) => (
            <div className="rg-slide" key={i} aria-hidden={i !== index}>
              <Slide image={img} alt={`${alt} (${i + 1}/${count})`} />
            </div>
          ))}
        </div>

        {children}

        {count > 1 && (
          <>
            <button type="button" className="rg-arrow rg-prev" onClick={arrow(-1)} aria-label={tl("Previous photo")}>
              <ChevronLeft size={compact ? 18 : 22} />
            </button>
            <button type="button" className="rg-arrow rg-next" onClick={arrow(1)} aria-label={tl("Next photo")}>
              <ChevronRight size={compact ? 18 : 22} />
            </button>
            <span className="rg-count">{index + 1} / {count}</span>
            {compact && (
              <span className="rg-dots" aria-hidden="true">
                {images.map((_, i) => <i key={i} className={i === index ? "is-on" : ""} />)}
              </span>
            )}
          </>
        )}
      </div>

      {!compact && count > 1 && (
        <div className="rg-thumbs" role="tablist" aria-label={tl("Photos")}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${tl("Photo")} ${i + 1}`}
              className={`rg-thumb ${i === index ? "is-on" : ""}`}
              onClick={() => setIndex(i)}
            >
              <Slide image={img} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
