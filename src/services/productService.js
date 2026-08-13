import { apiGet } from './apiClient';
import * as store from './productStore';

export async function queryProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query.append(key, value.join(','));
        } else {
          query.append(key, value);
        }
      }
    }
    const res = await apiGet(`/api/products?${query.toString()}`);
    if (res && (res.items || Array.isArray(res))) {
      return {
        items: Array.isArray(res) ? res : res.items,
        total: Array.isArray(res) ? res.length : (res.total || res.items.length),
      };
    }
  } catch (err) {
    console.warn('[productService] API request failed, using local store fallback:', err.message);
  }

  // Resilient fallback using productStore
  let items = store.getEffectiveProducts();

  if (params.category && params.category !== 'all') {
    items = items.filter((p) => p.category === params.category);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }
  if (params.featuredOnly) items = items.filter((p) => p.featured);
  if (params.bestSellerOnly) items = items.filter((p) => p.bestSeller);
  if (params.bulkOnly) items = items.filter((p) => p.isBulk);
  if (params.comboOnly) items = items.filter((p) => p.isCombo);
  if (params.festivalSaleOnly) items = items.filter((p) => p.onFestivalSale);

  if (params.brand && params.brand !== 'all') {
    items = items.filter((p) => p.brand === params.brand);
  }
  if (params.minPrice !== undefined && params.minPrice !== '') {
    items = items.filter((p) => p.price >= Number(params.minPrice));
  }
  if (params.maxPrice !== undefined && params.maxPrice !== '') {
    items = items.filter((p) => p.price <= Number(params.maxPrice));
  }

  return { items, total: items.length };
}

export async function getProduct(id) {
  try {
    const res = await apiGet(`/api/products/${id}`);
    if (res) return res;
  } catch (err) {
    console.warn('[productService] API request failed for product id, using fallback:', err.message);
  }
  return store.getEffectiveProduct(id);
}

export async function getRelatedProducts(product, limit = 4) {
  try {
    const res = await apiGet(`/api/products/${product.id}/related?limit=${limit}`);
    if (res) return res;
  } catch (err) {
    console.warn('[productService] Related products API failed, using fallback:', err.message);
  }
  const all = store.getEffectiveProducts();
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export async function getFeaturedProducts() {
  const res = await queryProducts({ featuredOnly: true });
  return res.items || [];
}

export async function getBestSellers() {
  const res = await queryProducts({ bestSellerOnly: true });
  return res.items || [];
}

export async function getBulkProducts() {
  const res = await queryProducts({ bulkOnly: true });
  return res.items || [];
}

export async function getComboDeals() {
  const res = await queryProducts({ comboOnly: true });
  return res.items || [];
}

export async function getFestivalSaleProducts() {
  const res = await queryProducts({ festivalSaleOnly: true });
  return res.items || [];
}

export async function getComboItemDetails(product) {
  try {
    const res = await apiGet(`/api/products/${product.id}/combo-items`);
    if (res) return res;
  } catch (err) {
    console.warn('[productService] Combo details API failed, using fallback:', err.message);
  }
  if (!product.comboItemIds) return [];
  const all = store.getEffectiveProducts();
  return product.comboItemIds
    .map((itemId) => all.find((p) => p.id === itemId))
    .filter(Boolean);
}

export async function getBrands() {
  try {
    const res = await apiGet('/api/products/brands');
    if (res) return res;
  } catch (err) {
    console.warn('[productService] Brands API failed, using fallback:', err.message);
  }
  const all = store.getEffectiveProducts();
  const brands = Array.from(new Set(all.map((p) => p.brand).filter(Boolean))).sort();
  return brands;
}

export async function getMaxPrice() {
  try {
    const res = await apiGet('/api/products/price-range');
    if (res && res.maxPrice) return res.maxPrice;
  } catch (err) {
    console.warn('[productService] Max price API failed, using fallback:', err.message);
  }
  const all = store.getEffectiveProducts();
  return Math.ceil(Math.max(...all.map((p) => p.price), 100));
}
