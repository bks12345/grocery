import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import * as store from './categoryStore';

export async function getAllCategories() {
  try {
    const res = await apiGet('/api/admin/categories');
    if (res) return res;
  } catch (err) {
    console.warn('[adminCategoryService] API failed, using fallback:', err.message);
  }
  return store.getEffectiveCategories();
}

export async function createCategory(category) {
  try {
    const res = await apiPost('/api/admin/categories', category);
    if (res) return res;
  } catch (err) {
    console.warn('[adminCategoryService] Create API failed, using fallback:', err.message);
  }
  return store.addCategory(category);
}

export async function editCategory(id, updates) {
  try {
    const res = await apiPatch(`/api/admin/categories/${id}`, updates);
    if (res) return res;
  } catch (err) {
    console.warn('[adminCategoryService] Edit API failed, using fallback:', err.message);
  }
  return store.updateCategory(id, updates);
}

export async function removeCategory(id) {
  try {
    await apiDelete(`/api/admin/categories/${id}`);
    return true;
  } catch (err) {
    console.warn('[adminCategoryService] Remove API failed, using fallback:', err.message);
  }
  store.deleteCategory(id);
  return true;
}
