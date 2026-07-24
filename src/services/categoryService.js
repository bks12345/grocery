import { getEffectiveCategories, getEffectiveCategory } from "./categoryStore";
import { getEffectiveProducts } from "./productStore";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/** GET /api/categories */
export async function getCategories() {
  await delay();
  return getEffectiveCategories();
}

/** GET /api/categories/:id */
export async function getCategory(id) {
  await delay();
  const category = getEffectiveCategory(id);
  if (!category) throw new Error("Category not found");
  return category;
}

/** GET /api/categories/:id/product-count — used on the Categories browse page */
export async function getCategoryProductCounts() {
  await delay();
  const products = getEffectiveProducts();
  const counts = {};
  for (const cat of getEffectiveCategories()) {
    counts[cat.id] = products.filter((p) => p.category === cat.id).length;
  }
  return counts;
}
