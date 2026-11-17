import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import * as store from "./productStore";

export async function queryProducts(params = {}) {
  try {
    const snap = await getDocs(collection(db, "products"));
    let items = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      firestoreId: d.id,
    }));

    if (params.category && params.category !== "all") {
      items = items.filter(
        (p) =>
          p.category === params.category ||
          p.categoryId === params.category ||
          (p.category && (p.category.slug === params.category || p.category.id === params.category))
      );
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s)
      );
    }
    if (params.featuredOnly) items = items.filter((p) => p.isFeatured || p.featured);
    if (params.bestSellerOnly) items = items.filter((p) => p.isBestSeller || p.bestSeller);
    if (params.bulkOnly) items = items.filter((p) => p.isBulk);
    if (params.comboOnly) items = items.filter((p) => p.isCombo);
    if (params.festivalSaleOnly) items = items.filter((p) => p.isFestivalSale || p.onFestivalSale);
    if (params.discountOnly) {
      items = items.filter(
        (p) =>
          (p.discountPercent && Number(p.discountPercent) > 0) ||
          p.isHalfPrice ||
          (p.oldPrice && Number(p.oldPrice) > Number(p.price))
      );
    }

    if (params.brand && params.brand !== "all") {
      items = items.filter((p) => p.brand === params.brand);
    }
    if (params.minPrice !== undefined && params.minPrice !== "") {
      items = items.filter((p) => Number(p.price) >= Number(params.minPrice));
    }
    if (params.maxPrice !== undefined && params.maxPrice !== "") {
      items = items.filter((p) => Number(p.price) <= Number(params.maxPrice));
    }

    return { items, total: items.length };
  } catch (err) {
    console.warn("[productService] Firestore query failed:", err.message);
    return { items: [], total: 0 };
  }
}

export async function getProduct(id) {
  if (!id) return null;
  try {
    const docSnap = await getDoc(doc(db, "products", String(id)));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id, firestoreId: docSnap.id };
    }
    return null;
  } catch (err) {
    console.warn("[productService] Get product from Firestore failed:", err.message);
    return null;
  }
}

export const getProductById = getProduct;

export async function getFeaturedProducts(limitCount = 8) {
  const { items } = await queryProducts({ featuredOnly: true });
  return items.slice(0, limitCount);
}

export async function getBestSellers(limitCount = 8) {
  const { items } = await queryProducts({ bestSellerOnly: true });
  return items.slice(0, limitCount);
}

export async function getFestivalSaleProducts(limitCount = 8) {
  const { items } = await queryProducts({ festivalSaleOnly: true });
  return items.slice(0, limitCount);
}

export async function getBulkProducts(limitCount = 8) {
  const { items } = await queryProducts({ bulkOnly: true });
  return items.slice(0, limitCount);
}

export async function getComboProducts(limitCount = 8) {
  const { items } = await queryProducts({ comboOnly: true });
  return items.slice(0, limitCount);
}

export const getComboDeals = getComboProducts;

export async function getComboItemDetails(product) {
  if (!product?.comboItems?.length) return [];
  const { items } = await queryProducts();
  return product.comboItems
    .map((itemIdentifier) =>
      items.find(
        (p) =>
          String(p.id) === String(itemIdentifier) ||
          p.name?.toLowerCase() === String(itemIdentifier).toLowerCase()
      )
    )
    .filter(Boolean);
}

export async function getRelatedProducts(productId, categoryId, limitCount = 4) {
  const { items } = await queryProducts({ category: categoryId });
  return items.filter((p) => p.id !== productId).slice(0, limitCount);
}

export async function getBrands() {
  const { items } = await queryProducts();
  const brands = new Set(items.map((p) => p.brand).filter(Boolean));
  return Array.from(brands).sort();
}

export async function getMaxPrice() {
  const { items } = await queryProducts();
  if (!items.length) return 100;
  return Math.ceil(Math.max(...items.map((p) => p.price || 0)));
}
