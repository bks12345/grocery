import * as store from "./productStore";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** GET /api/admin/products */
export async function getAllProducts() {
  await delay();
  return store.getEffectiveProducts();
}

/** POST /api/admin/products */
export async function createProduct(product) {
  await delay(400);
  return store.addProduct(product);
}

/** PATCH /api/admin/products/:id */
export async function editProduct(id, updates) {
  await delay(400);
  return store.updateProduct(id, updates);
}

/** DELETE /api/admin/products/:id */
export async function removeProduct(id) {
  await delay(300);
  store.deleteProduct(id);
}
