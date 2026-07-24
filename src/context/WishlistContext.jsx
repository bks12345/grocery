import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";

// Same pattern as CartContext: kept client-side for instant guest use,
// persisted to localStorage so a refresh doesn't lose it.
// When auth exists, sync on login (GET /api/wishlist) and fire a request
// from toggleWishlist (POST/DELETE /api/wishlist/:productId) without
// changing the isInWishlist/toggleWishlist API components already use.

const WishlistContext = createContext(null);
const STORAGE_KEY = "daalbhat_wishlist";

function loadInitialItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadInitialItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — wishlist still works for this session
    }
  }, [items]);

  const isInWishlist = useCallback(
    (productId) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback((product) => {
    setItems((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, isInWishlist, toggleWishlist, clearWishlist }),
    [items, isInWishlist, toggleWishlist, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
