/**
 * Fashion Refab API (backend /api/refab).
 * Public calls need no login; "my listings" calls use the signed-in user's token.
 */
const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/refab`;

const request = async (path, { method = "GET", body, auth = false } = {}) => {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${localStorage.getItem("authToken")}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const error = new Error(data.error || data.message || `Request failed (${res.status})`);
    error.fields = data.errors || null;
    throw error;
  }
  return data.data;
};

// ── Public ──
/** { q, fabric, city, price, sort, hideSold, page } → { listings, total, page, pages, stats } */
export const fetchPublicListings = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== false) qs.set(k, v === true ? "1" : String(v));
  });
  return request(`/listings?${qs}`);
};

/** Counts a view or a WhatsApp/phone contact (best effort, never throws) */
export const trackListing = (id, event) => request(`/listings/${id}/track`, { method: "POST", body: { event } }).catch(() => null);

export const reportListing = (id, reason = "") => request(`/listings/${id}/report`, { method: "POST", body: { reason } });

// ── The signed-in business's listings ──
export const getMyListings = () => request("/mine", { auth: true });
export const createListing = (listing) => request("/", { method: "POST", body: listing, auth: true });
export const updateListing = (id, listing) => request(`/${id}`, { method: "PUT", body: listing, auth: true });
export const setListingStatus = (id, status) => request(`/${id}/status`, { method: "PATCH", body: { status }, auth: true });
export const deleteListing = (id) => request(`/${id}`, { method: "DELETE", auth: true });
