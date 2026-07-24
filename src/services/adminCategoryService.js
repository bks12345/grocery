import * as store from "./categoryStore";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** GET /api/admin/categories */
export async function getAllCategories() {
  await delay();
  return store.getEffectiveCategories();
}

/** POST /api/admin/categories */
export async function createCategory(category) {
  await delay(400);
  return store.addCategory(category);
}

/** PATCH /api/admin/categories/:id */
export async function editCategory(id, updates) {
  await delay(400);
  return store.updateCategory(id, updates);
}

/** DELETE /api/admin/categories/:id */
export async function removeCategory(id) {
  await delay(300);
  store.deleteCategory(id); // throws if products still reference this category
}
