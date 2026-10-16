/**
 * Central fetch wrapper.
 * - Attaches Authorization header automatically.
 * - On 401 (token expired / invalid) clears the session and redirects to /login.
 */

const handleUnauthorized = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('newAuthUser');
  // Use replace so the back-button won't return to the protected page
  window.location.replace('/login');
};

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    // Return a never-resolving promise so the caller's .then() never fires
    return new Promise(() => {});
  }

  return response;
};
