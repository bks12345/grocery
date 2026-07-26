import { getEffectiveProducts, getEffectiveProduct } from "./productStore";

// Simulates real network latency so loading states are honest during
// development, instead of resolving instantly. Set to 0 (or remove the
// await) once a real API is providing genuine latency.
const SIMULATED_DELAY_MS = 250;
const delay = (ms = SIMULATED_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a paginated, filtered, sorted list of products — the shape a real
 * backend list endpoint (e.g. GET /api/products) would return.
 *
 * @param {object} params
 * @param {string} [params.category]
 * @param {string} [params.search]
 * @param {number} [params.minPrice]
 * @param {number} [params.maxPrice]
 * @param {string[]} [params.brands]
 * @param {number} [params.minRating]
 * @param {boolean} [params.inStockOnly]
 * @param {boolean} [params.bulkOnly]
 * @param {boolean} [params.comboOnly]
 * @param {boolean} [params.festivalSaleOnly]
 * @param {boolean} [params.bestSellerOnly]
 * @param {boolean} [params.newOnly]
 * @param {boolean} [params.featuredOnly]
 * @param {boolean} [params.discountOnly]
 * @param {string} [params.sort] - 'relevance' | 'price-low-high' | 'price-high-low' | 'popularity' | 'latest' | 'best-selling'
 * @param {number} [params.page] - 1-indexed
 * @param {number} [params.pageSize]
 * @returns {Promise<{items: object[], total: number, page: number, pageSize: number, totalPages: number}>}
 */
export async function queryProducts({
  category = "",
  search = "",
  minPrice = 0,
  maxPrice = Infinity,
  brands = [],
  minRating = 0,
  inStockOnly = false,
  bulkOnly = false,
  comboOnly = false,
  festivalSaleOnly = false,
  bestSellerOnly = false,
  newOnly = false,
  featuredOnly = false,
  discountOnly = false,
  sort = "relevance",
  page = 1,
  pageSize = 8,
} = {}) {
  await delay();

  let list = getEffectiveProducts().filter((p) => {
    if (category && p.category !== category) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (brands.length && !brands.includes(p.brand)) return false;
    if (minRating && p.rating < minRating) return false;
    if (inStockOnly && !p.inStock) return false;
    if (bulkOnly && !p.isBulk) return false;
    if (comboOnly && !p.isCombo) return false;
    if (festivalSaleOnly && !p.isFestivalSale) return false;
    if (bestSellerOnly && !p.isBestSeller) return false;
    if (newOnly && !p.isNew) return false;
    if (featuredOnly && !p.isFeatured) return false;
    if (discountOnly && !(p.oldPrice && p.oldPrice > p.price)) return false;
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      const haystack = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  switch (sort) {
    case "price-low-high":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-high-low":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      list = [...list].sort((a, b) => b.rating * b.reviewsCount - a.rating * a.reviewsCount);
      break;
    case "latest":
      list = [...list].sort((a, b) => (b.isNew === true) - (a.isNew === true));
      break;
    case "best-selling":
      list = [...list].sort((a, b) => (b.isBestSeller === true) - (a.isBestSeller === true));
      break;
    default:
      break;
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = list.slice((page - 1) * pageSize, page * pageSize);

  return { items, total, page, pageSize, totalPages };
}

/** GET /api/products/:id */
export async function getProduct(id) {
  await delay();
  const product = getEffectiveProduct(id);
  if (!product) throw new Error("Product not found");
  return product;
}

/** GET /api/products/:id/related */
export async function getRelatedProducts(product, limit = 4) {
  await delay();
  return getEffectiveProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

/** GET /api/products?featured=true */
export async function getFeaturedProducts() {
  await delay();
  return getEffectiveProducts().filter((p) => p.isFeatured);
}

/** GET /api/products?bestSeller=true */
export async function getBestSellers() {
  await delay();
  return getEffectiveProducts().filter((p) => p.isBestSeller);
}

/** GET /api/products?bulk=true */
export async function getBulkProducts() {
  await delay();
  return getEffectiveProducts().filter((p) => p.isBulk);
}

/** GET /api/products?combo=true */
export async function getComboDeals() {
  await delay();
  return getEffectiveProducts().filter((p) => p.isCombo);
}

/** GET /api/products?festivalSale=true */
export async function getFestivalSaleProducts() {
  await delay();
  return getEffectiveProducts().filter((p) => p.isFestivalSale);
}

/**
 * Resolves a combo product's `comboItems` (an array of product ids) into
 * the actual product records, so the details page can show what's
 * included. Missing/deleted items are silently skipped rather than
 * throwing, so an admin deleting a product doesn't break existing combos.
 */
export async function getComboItemDetails(product) {
  await delay(150);
  if (!product?.comboItems?.length) return [];
  const all = getEffectiveProducts();
  return product.comboItems
    .map((id) => all.find((p) => p.id === id))
    .filter(Boolean);
}

/** GET /api/products/brands — for populating the brand filter */
export async function getBrands() {
  await delay();
  return [...new Set(getEffectiveProducts().map((p) => p.brand))].sort();
}

/** GET /api/products/price-range — for the price filter's max bound */
export async function getMaxPrice() {
  await delay();
  const all = getEffectiveProducts();
  return all.length ? Math.max(...all.map((p) => p.price)) : 0;
}
