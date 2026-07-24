// Single source of truth for "current" product data: the seed mock data
// from data/products.js, with admin add/edit/delete operations layered on
// top and persisted to localStorage. Both the customer-facing
// productService and the admin product management screens read/write
// through here, so an admin edit shows up on the storefront immediately —
// same way a real database would back both.

import { products as seedProducts } from "../data/products";

const OVERRIDES_KEY = "daalbhat_product_overrides";

function loadOverrides() {
  try {
    const saved = localStorage.getItem(OVERRIDES_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      added: parsed?.added || [],
      edited: parsed?.edited || {},
      deletedIds: parsed?.deletedIds || [],
    };
  } catch {
    return { added: [], edited: {}, deletedIds: [] };
  }
}

function saveOverrides(overrides) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Storage unavailable — changes still apply for this session
  }
}

export function getEffectiveProducts() {
  const { added, edited, deletedIds } = loadOverrides();
  return [...seedProducts, ...added]
    .filter((p) => !deletedIds.includes(p.id))
    .map((p) => (edited[p.id] ? { ...p, ...edited[p.id] } : p));
}

export function getEffectiveProduct(id) {
  return getEffectiveProducts().find((p) => p.id === id) || null;
}

export function addProduct(product) {
  const overrides = loadOverrides();
  const id = `p_${Date.now()}`;
  const newProduct = { ...product, id };
  overrides.added = [...overrides.added, newProduct];
  saveOverrides(overrides);
  return newProduct;
}

export function updateProduct(id, updates) {
  const overrides = loadOverrides();

  // If it's a product we added ourselves, edit it in place rather than
  // stacking a separate "edited" diff on top of it.
  const addedIndex = overrides.added.findIndex((p) => p.id === id);
  if (addedIndex !== -1) {
    overrides.added[addedIndex] = { ...overrides.added[addedIndex], ...updates };
  } else {
    overrides.edited = { ...overrides.edited, [id]: { ...overrides.edited[id], ...updates } };
  }
  saveOverrides(overrides);
  return getEffectiveProduct(id);
}

export function deleteProduct(id) {
  const overrides = loadOverrides();
  // If it was one we added, just remove it outright instead of also
  // tracking it as "deleted" forever.
  const wasAdded = overrides.added.some((p) => p.id === id);
  overrides.added = overrides.added.filter((p) => p.id !== id);
  if (!wasAdded) {
    overrides.deletedIds = [...overrides.deletedIds, id];
  }
  delete overrides.edited[id];
  saveOverrides(overrides);
}
