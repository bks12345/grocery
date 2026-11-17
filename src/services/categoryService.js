import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import * as store from "./categoryStore";
import { queryProducts } from "./productService";

export async function getCategories() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }));
    }
  } catch (err) {
    console.warn("[categoryService] Firestore getCategories failed, using fallback:", err.message);
  }
  return store.getEffectiveCategories();
}

export const getAllCategories = getCategories;

export async function getCategory(id) {
  try {
    const docSnap = await getDoc(doc(db, "categories", id));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id, firestoreId: docSnap.id };
    }
  } catch (err) {
    console.warn("[categoryService] Firestore getCategory failed, using fallback:", err.message);
  }
  return store.getEffectiveCategory(id);
}

export async function getCategoryProductCounts() {
  try {
    const { items: products } = await queryProducts();
    const counts = {};
    products.forEach((p) => {
      const catKey = p.category?.slug || p.category || p.categoryId;
      if (catKey) {
        counts[catKey] = (counts[catKey] || 0) + 1;
      }
    });
    return counts;
  } catch (err) {
    console.warn("[categoryService] Product count calculation failed:", err.message);
    return {};
  }
}
