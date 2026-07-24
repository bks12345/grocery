// Mimics a real "estimate my grocery" endpoint (e.g. POST /api/grocery-estimate).
// Given a family size + food/dietary preferences, returns a projected 30-day
// staples list. The per-person baseline quantities below are illustrative
// mock data — swap this function's body for a real apiPost() call once a
// backend/recommendation engine exists; callers already treat it as async.

const delay = (ms = 900) => new Promise((r) => setTimeout(r, ms));

const STORAGE_KEY = "daalbhat_grocery_preferences";

// Baseline monthly quantity per adult (children count as 0.6x an adult).
const staplesCatalog = [
  { key: "rice", name: "Rice", unit: "kg", perAdult: 2.5, price: 120, category: "Grains & Cereals", diets: ["all"] },
  { key: "atta", name: "Wheat Flour (Atta)", unit: "kg", perAdult: 2, price: 110, category: "Grains & Cereals", diets: ["all"] },
  { key: "lentils", name: "Lentils (Dal)", unit: "kg", perAdult: 0.5, price: 180, category: "Grains & Cereals", diets: ["all"] },
  { key: "oil", name: "Cooking Oil", unit: "L", perAdult: 0.5, price: 240, category: "Cooking Essentials", diets: ["all"] },
  { key: "sugar", name: "Sugar", unit: "kg", perAdult: 0.5, price: 80, category: "Cooking Essentials", diets: ["all"] },
  { key: "potato", name: "Potato", unit: "kg", perAdult: 1.25, price: 50, category: "Vegetables", diets: ["all"] },
  { key: "onion", name: "Onion", unit: "kg", perAdult: 0.75, price: 60, category: "Vegetables", diets: ["all"] },
  { key: "tea", name: "Tea", unit: "g", perAdult: 62.5, price: 0.48, category: "Beverages", diets: ["all"] },
  { key: "salt", name: "Salt", unit: "kg", perAdult: 0.25, price: 20, category: "Cooking Essentials", diets: ["all"] },
  { key: "milkpowder", name: "Milk Powder", unit: "g", perAdult: 125, price: 0.64, category: "Dairy", diets: ["all"] },
  { key: "eggs", name: "Eggs", unit: "pcs", perAdult: 7.5, price: 15, category: "Protein", diets: ["eggetarian", "non-vegetarian"] },
  { key: "chicken", name: "Chicken", unit: "kg", perAdult: 0.75, price: 380, category: "Protein", diets: ["non-vegetarian"] },
  { key: "soyachunks", name: "Soya Chunks", unit: "kg", perAdult: 0.25, price: 260, category: "Protein", diets: ["vegetarian", "vegan"] },
  { key: "paneer", name: "Paneer", unit: "kg", perAdult: 0.25, price: 420, category: "Dairy", diets: ["vegetarian", "eggetarian"] },
  { key: "tofu", name: "Tofu", unit: "kg", perAdult: 0.25, price: 300, category: "Protein", diets: ["vegan"] },
];

function round(n, step = 0.5) {
  return Math.round(n / step) * step;
}

/**
 * @param {object} prefs
 * @param {number} prefs.adults
 * @param {number} prefs.children
 * @param {string} prefs.foodCategory - 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan'
 * @param {string[]} prefs.dietaryPreferences - e.g. ['low-oil','gluten-free']
 * @param {string} prefs.notes
 * @param {number} [prefs.durationDays]
 * @returns {Promise<{items: object[], summary: object}>}
 */
export async function estimateGrocery(prefs) {
  await delay();

  const { adults = 1, children = 0, foodCategory = "vegetarian", dietaryPreferences = [], notes = "", durationDays = 30 } = prefs;

  const weightedFamily = adults + children * 0.6;
  const durationFactor = durationDays / 30;

  let items = staplesCatalog
    .filter((s) => s.diets.includes("all") || s.diets.includes(foodCategory))
    .map((s) => {
      let qty = round(s.perAdult * weightedFamily * durationFactor, s.unit === "pcs" ? 1 : s.unit === "g" ? 10 : 0.25);
      // Light adjustments for optional dietary preferences (mock heuristics)
      if (dietaryPreferences.includes("Low Oil") && s.key === "oil") qty = round(qty * 0.7, 0.25);
      if (dietaryPreferences.includes("Low Salt") && s.key === "salt") qty = round(qty * 0.7, 0.25);
      if (qty <= 0) return null;
      return {
        key: s.key,
        name: s.name,
        unit: s.unit,
        quantity: qty,
        estimatedPrice: Math.round(qty * s.price),
        category: s.category,
      };
    })
    .filter(Boolean);

  const totalCost = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

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

/** Persist the last submitted preferences so "Edit Preferences" can prefill the modal again. */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable — form just won't prefill next time
  }
}

export function loadPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
