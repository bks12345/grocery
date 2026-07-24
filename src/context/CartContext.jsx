import { createContext, useContext, useReducer, useMemo, useEffect } from "react";

// This context intentionally keeps cart state client-side rather than
// fetching it — a shopping cart needs to work instantly for guests who
// aren't logged in yet, so it shouldn't wait on a network request. It's
// persisted to localStorage so a page refresh doesn't wipe someone's cart.
//
// When a real backend/auth exists, this is where you'd sync it:
//   - On login: fetch the user's saved cart (GET /api/cart) and merge/replace
//     this state with dispatch({ type: "SET_CART", items }) — add that action
//     to the reducer below.
//   - After ADD_ITEM/REMOVE_ITEM/UPDATE_QUANTITY: fire a matching call
//     (e.g. POST /api/cart/items) from the functions in the `value` object
//     below, so the dispatch stays instant (optimistic UI) while the
//     request happens in the background.
// The component-facing API (addItem, removeItem, updateQuantity, clearCart)
// wouldn't need to change — only what happens inside them.

const CartContext = createContext(null);
const STORAGE_KEY = "daalbhat_cart";

const emptyState = { items: [] }; // items: { product, quantity }[]

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyState;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.items)) return emptyState;
    return parsed;
  } catch {
    // Corrupted or inaccessible storage (e.g. private browsing) — fall back silently
    return emptyState;
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + action.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { product: action.product, quantity: action.quantity },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: Math.max(0, action.quantity) }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    case "CLEAR_CART":
      return emptyState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — cart still works for this session,
      // it just won't survive a refresh.
    }
  }, [state]);

  const value = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: state.items,
      subtotal,
      itemCount,
      addItem: (product, quantity = 1) =>
        dispatch({ type: "ADD_ITEM", product, quantity }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
      updateQuantity: (productId, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
