/**
 * Photos of a Fashion Refab listing, for RefabGallery. An image is { url } (a real photo) or
 * { swatch, variant } (the CSS fabric pattern the demo data uses). Listings from the backend
 * have `images` as a list of photo URLs; the first one is the cover.
 */
export const imagesOf = (item) => {
  if (item?.images?.length) return item.images.map((img) => (typeof img === "string" ? { url: img } : img));
  return [{ swatch: item?.swatch || "cotton" }];
};
