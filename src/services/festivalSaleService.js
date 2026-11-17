import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { festivalSale as defaultFestivalSale } from "../data/festivalSale";
import * as productStore from "./productStore";

const FESTIVAL_SALE_STORAGE_KEY = "daalbhat_mock_festival_sale";

function getStoredFestivalSaleConfig() {
  try {
    const data = localStorage.getItem(FESTIVAL_SALE_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[festivalSaleService] Error reading local storage:", err);
  }
  return defaultFestivalSale;
}

function saveStoredFestivalSaleConfig(config) {
  try {
    localStorage.setItem(FESTIVAL_SALE_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("[festivalSaleService] Error saving local storage:", err);
  }
}

/**
 * Fetches the active festival sale configuration from Cloud Firestore.
 * Automatically seeds the document with defaults if not present.
 */
export async function getFestivalSaleConfig() {
  try {
    const docRef = doc(db, "settings", "festivalSale");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      saveStoredFestivalSaleConfig(data);
      return data;
    }

    // Return default settings without auto-seeding to Firestore
    saveStoredFestivalSaleConfig(defaultFestivalSale);
    return defaultFestivalSale;
  } catch (err) {
    console.warn("[festivalSaleService] Firestore get failed, using fallback:", err.message);
    return getStoredFestivalSaleConfig();
  }
}

/**
 * Updates festival sale configuration (active, name, emoji, discountLabel, subtitle, endDate).
 */
export async function updateFestivalSaleConfig(updates) {
  const cleanUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "settings", "festivalSale");
    await setDoc(docRef, cleanUpdates, { merge: true });
  } catch (err) {
    console.warn("[festivalSaleService] Firestore update failed, using local fallback:", err.message);
  }

  const current = getStoredFestivalSaleConfig();
  const merged = { ...current, ...cleanUpdates };
  saveStoredFestivalSaleConfig(merged);
  return merged;
}

/**
 * 1-Click toggle to add or remove a product from the Festival Sale.
 */
export async function toggleProductFestivalSale(productId, isFestivalSale) {
  const updates = {
    isFestivalSale: Boolean(isFestivalSale),
    onFestivalSale: Boolean(isFestivalSale),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "products", String(productId));
    await updateDoc(docRef, updates);
  } catch (err) {
    console.warn("[festivalSaleService] Firestore product update failed, updating local store:", err.message);
  }

  try {
    productStore.updateProduct(productId, updates);
  } catch {}

  return true;
}

/**
 * Bulk updates multiple products to be included or excluded from Festival Sale.
 */
export async function bulkSetFestivalSale(productIds, isFestivalSale) {
  const updates = {
    isFestivalSale: Boolean(isFestivalSale),
    onFestivalSale: Boolean(isFestivalSale),
    updatedAt: new Date().toISOString(),
  };

  try {
    const batch = writeBatch(db);
    productIds.forEach((id) => {
      const ref = doc(db, "products", String(id));
      batch.update(ref, updates);
    });
    await batch.commit();
  } catch (err) {
    console.warn("[festivalSaleService] Batch update failed, updating local store:", err.message);
  }

  try {
    productIds.forEach((id) => {
      productStore.updateProduct(id, updates);
    });
  } catch {}

  return true;
}
