import { apiGet, apiPost, apiPatch, apiDelete, BASE_URL } from './apiClient';
import * as store from './productStore';

export async function getAllProducts() {
  try {
    const res = await apiGet('/api/admin/products');
    if (res) return Array.isArray(res) ? res : res.items || res;
  } catch (err) {
    console.warn('[adminProductService] API failed, using fallback:', err.message);
  }
  return store.getEffectiveProducts();
}

export async function createProduct(product) {
  try {
    const res = await apiPost('/api/admin/products', product);
    if (res) return res;
  } catch (err) {
    console.warn('[adminProductService] Create API failed, using fallback:', err.message);
  }
  return store.addProduct(product);
}

export async function editProduct(id, updates) {
  try {
    const res = await apiPatch(`/api/admin/products/${id}`, updates);
    if (res) return res;
  } catch (err) {
    console.warn('[adminProductService] Edit API failed, using fallback:', err.message);
  }
  return store.updateProduct(id, updates);
}

export async function removeProduct(id) {
  try {
    await apiDelete(`/api/admin/products/${id}`);
    return true;
  } catch (err) {
    console.warn('[adminProductService] Remove API failed, using fallback:', err.message);
  }
  store.deleteProduct(id);
  return true;
}

export async function uploadProductImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // We let the browser set the boundary by omitting Content-Type.
    // However, our backend requires credentials (cookies) for authenticate middleware.
    const res = await fetch(`${BASE_URL}/api/admin/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }
    return await res.json();
  } catch (err) {
    console.error('[adminProductService] uploadProductImage failed:', err.message);
    throw err;
  }
}
