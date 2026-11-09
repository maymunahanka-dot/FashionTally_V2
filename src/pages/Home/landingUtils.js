/** Non-component helpers shared by the marketing pages (kept apart so fast refresh works). */
import { useEffect } from "react";

export const PLAY_URL = "https://play.google.com/store/apps/details?id=com.fashion.fashiontally";
export const APP_STORE_URL = "https://apps.apple.com/gb/app/fashion-tally/id6769135696";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Adds `is-in` to every [data-reveal] element when it scrolls into view. */
export function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll("[data-reveal]");
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/** Start each page at the top (the router keeps the old scroll position otherwise). */
export function useScrollToTopOnMount() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
}
