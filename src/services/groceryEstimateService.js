import { getCustomizedGroceryItems } from "./customizedGroceryService";

const STORAGE_KEY = "daalbhat_grocery_estimate_prefs";

function round(n, step = 0.5) {
  return Math.round(n / step) * step;
}

export async function estimateGrocery(prefs = {}) {
  const {
    adults = 1,
    children = 0,
    foodCategory = "vegetarian",
    dietaryPreferences = [],
    notes = "",
    durationDays = 30,
  } = prefs;

  const weightedFamily = adults + children * 0.6;
  const durationFactor = durationDays / 30;

  // Dynamically load items configured by the store admin
  const configuredCatalog = await getCustomizedGroceryItems();

  const activeCatalog = (configuredCatalog || []).filter(
    (item) => item.isActive !== false
  );

  const items = activeCatalog
    .filter((s) => {
      if (!Array.isArray(s.diets) || s.diets.includes("all")) return true;
      return s.diets.includes(foodCategory);
    })
    .map((s) => {
      const step =
        s.unit === "pcs" || s.unit === "pack" ? 1 : s.unit === "g" ? 10 : 0.25;
      let qty = round(s.perAdult * weightedFamily * durationFactor, step);

      // Apply Dietary Preferences
      const isOil =
        s.dietaryTag === "oil" ||
        s.id?.includes("oil") ||
        s.name?.toLowerCase().includes("oil");
      const isSalt =
        s.dietaryTag === "salt" ||
        s.id?.includes("salt") ||
        s.name?.toLowerCase().includes("salt");

      if (dietaryPreferences.includes("Low Oil") && isOil) {
        qty = round(qty * 0.7, 0.25);
      }
      if (dietaryPreferences.includes("Low Salt") && isSalt) {
        qty = round(qty * 0.7, 0.25);
      }

      if (qty <= 0) return null;

      const unitPrice = Number(s.price) || 0;
      const estimatedPrice = Math.round(qty * unitPrice);

      return {
        id: s.id,
        key: s.id,
        productId: s.productId || null,
        name: s.name,
        unit: s.unit,
        quantity: qty,
        unitPrice,
        estimatedPrice,
        category: s.category || "General",
        image: s.image || "",
        inStock: s.inStock !== false,
      };
    })
    .filter(Boolean);

  const totalCost = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  savePreferences(prefs);

  return {
    items,
    notes,
    summary: {
      familyMembers: adults + children,
      adults,
      children,
      foodCategory,
      dietaryPreferences,
      durationDays,
      totalItems: items.length,
      totalQuantity,
      totalCost,
    },
  };
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function loadPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
