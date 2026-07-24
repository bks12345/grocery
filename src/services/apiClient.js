// Thin fetch wrapper for talking to a real backend later.
//
// Nothing in this app calls this directly yet — the service files in this
// folder (productService.js, categoryService.js, etc.) currently return
// mock data instead. When a real backend exists, those services swap their
// internals to call `apiGet` / `apiPost` etc. from here, and every
// component that already uses the service functions keeps working
// unchanged, because the function signatures and return shapes stay the same.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("authToken"); // set this after login, once auth exists

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null; // no content
  return response.json();
}

export const apiGet = (path) => request(path);
export const apiPost = (path, data) =>
  request(path, { method: "POST", body: JSON.stringify(data) });
export const apiPatch = (path, data) =>
  request(path, { method: "PATCH", body: JSON.stringify(data) });
export const apiDelete = (path) => request(path, { method: "DELETE" });
