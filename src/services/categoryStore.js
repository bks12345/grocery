import { categories as seedCategories } from "../data/categories";
import { getEffectiveProducts } from "./productStore";

const OVERRIDES_KEY = "daalbhat_category_overrides";

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

export function getEffectiveCategories() {
  const { added, edited, deletedIds } = loadOverrides();
  return [...seedCategories, ...added]
    .filter((c) => !deletedIds.includes(c.id))
    .map((c) => (edited[c.id] ? { ...c, ...edited[c.id] } : c));
}

export function getEffectiveCategory(id) {
  return getEffectiveCategories().find((c) => c.id === id) || null;
}

export function addCategory(category) {
  const overrides = loadOverrides();
  const id = category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newCategory = { ...category, id, subcategories: category.subcategories || [] };
  overrides.added = [...overrides.added, newCategory];
  saveOverrides(overrides);
  return newCategory;
}

export function updateCategory(id, updates) {
  const overrides = loadOverrides();
  const addedIndex = overrides.added.findIndex((c) => c.id === id);
  if (addedIndex !== -1) {
    overrides.added[addedIndex] = { ...overrides.added[addedIndex], ...updates };
  } else {
    overrides.edited = { ...overrides.edited, [id]: { ...overrides.edited[id], ...updates } };
  }
  saveOverrides(overrides);
  return getEffectiveCategory(id);
}

export function deleteCategory(id) {
  const inUse = getEffectiveProducts().some((p) => p.category === id);
  if (inUse) {
    throw new Error("Can't delete a category that still has products in it.");
  }
  const overrides = loadOverrides();
  const wasAdded = overrides.added.some((c) => c.id === id);
  overrides.added = overrides.added.filter((c) => c.id !== id);
  if (!wasAdded) {
    overrides.deletedIds = [...overrides.deletedIds, id];
  }
  delete overrides.edited[id];
  saveOverrides(overrides);
}
