// Thin fetch wrapper for talking to a real backend later.
//
// Nothing in this app calls this directly yet — the service files in this
// folder (productService.js, categoryService.js, etc.) currently return
// mock data instead. When a real backend exists, those services swap their
// internals to call `apiGet` / `apiPost` etc. from here, and every
// component that already uses the service functions keeps working
// unchanged, because the function signatures and return shapes stay the same.

export const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.PROD ? "" : "http://localhost:3001");

async function request(path, options = {}) {
  // Tokens are now stored in HttpOnly cookies, so we don't need to manually read them
  const url = path.startsWith("http://") || path.startsWith("https://") 
    ? path 
    : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Send cookies with requests
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || `API request failed with HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) return null; // no content
    return response.json();
  } catch (err) {
    console.error(`[apiClient] Network request failed for '${path}':`, err.message);
    throw err;
  }
}

export const apiGet = (path) => request(path);
export const apiPost = (path, data) =>
  request(path, { method: "POST", body: JSON.stringify(data) });
export const apiPut = (path, data) =>
  request(path, { method: "PUT", body: JSON.stringify(data) });
export const apiPatch = (path, data) =>
  request(path, { method: "PATCH", body: JSON.stringify(data) });
export const apiDelete = (path) => request(path, { method: "DELETE" });

