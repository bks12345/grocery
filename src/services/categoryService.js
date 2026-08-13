import { apiGet } from './apiClient';
import * as store from './categoryStore';
import { getEffectiveProducts } from './productStore';

export async function getCategories() {
  try {
    const res = await apiGet('/api/categories');
    if (res) return res;
  } catch (err) {
    console.warn('[categoryService] API failed, using fallback:', err.message);
  }
  return store.getEffectiveCategories();
}

export async function getCategory(id) {
  try {
    const res = await apiGet(`/api/categories/${id}`);
    if (res) return res;
  } catch (err) {
    console.warn('[categoryService] API failed for category id, using fallback:', err.message);
  }
  return store.getEffectiveCategory(id);
}

export async function getCategoryProductCounts() {
  try {
    const res = await apiGet('/api/categories/product-count');
    if (res) return res;
  } catch (err) {
    console.warn('[categoryService] Product count API failed, using fallback:', err.message);
  }
  const products = getEffectiveProducts();
  const counts = {};
  products.forEach((p) => {
    if (p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  });
  return counts;
}
