import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { goatParts as defaultGoatParts } from "../data/goatParts";
import { uploadImageToStorage } from "./storageService";

const GOAT_PARTS_STORAGE_KEY = "daalbhat_mock_goat_parts";

function getStoredGoatParts() {
  try {
    const data = localStorage.getItem(GOAT_PARTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[goatService] Error reading local storage:", err);
  }
  // Default with inStock: true for all parts
  const initial = defaultGoatParts.map((p) => ({
    ...p,
    inStock: true,
    stockKg: 50,
  }));
  saveStoredGoatParts(initial);
  return initial;
}

function saveStoredGoatParts(parts) {
  try {
    localStorage.setItem(GOAT_PARTS_STORAGE_KEY, JSON.stringify(parts));
  } catch (err) {
    console.warn("[goatService] Error saving local storage:", err);
  }
}

/**
 * Retrieves all goat parts (both In Stock and Out of Stock).
 * Primarily used by the Admin Panel.
 */
export async function getAllGoatParts() {
  try {
    const snap = await getDocs(collection(db, "goatParts"));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }));
      saveStoredGoatParts(items);
      return items;
    }

    // Read-only defaults if Firestore collection is empty (never auto-seed to Firestore)
    const defaults = defaultGoatParts.map((p) => ({
      ...p,
      inStock: true,
      stockKg: 50,
    }));

    saveStoredGoatParts(defaults);
    return defaults;
  } catch (err) {
    console.warn("[goatService] Firestore query failed, using local storage fallback:", err.message);
    return getStoredGoatParts();
  }
}

/**
 * Retrieves only goat parts that are currently IN STOCK.
 * Used by the customer-facing /book-goat page (out of stock parts are not displayed).
 */
export async function getAvailableGoatParts() {
  const allParts = await getAllGoatParts();
  return allParts.filter((p) => p.inStock !== false && (p.stockKg === undefined || p.stockKg > 0));
}

/**
 * Updates a specific goat cut (pricePerKg, inStock, stockKg, etc.)
 */
export async function updateGoatPart(id, updates) {
  try {
    const docRef = doc(db, "goatParts", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[goatService] Firestore update failed, using local fallback:", err.message);
  }

  const stored = getStoredGoatParts();
  const index = stored.findIndex((p) => p.id === id);
  if (index !== -1) {
    stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
    saveStoredGoatParts(stored);
    return stored[index];
  }

  const newPart = { id, ...updates, updatedAt: new Date().toISOString() };
  stored.push(newPart);
  saveStoredGoatParts(stored);
  return newPart;
}

/**
 * 1-Click Toggle for In Stock / Out of Stock
 */
export async function toggleGoatPartStock(id, inStock) {
  return updateGoatPart(id, { inStock });
}

/**
 * Adds a new custom goat part
 */
export async function createGoatPart(data) {
  const id = data.id || `g_${Date.now()}`;
  const newPart = {
    id,
    name: data.name || "Custom Cut",
    pricePerKg: Number(data.pricePerKg) || 1000,
    defaultUnit: data.defaultUnit || "kg",
    minQty: Number(data.minQty) || 0.5,
    icon: data.icon || "beef",
    group: data.group || "cut",
    rotate: Number(data.rotate) || 0,
    image: data.image || "",
    inStock: data.inStock ?? true,
    stockKg: Number(data.stockKg) || 50,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "goatParts", id);
    await setDoc(docRef, newPart);
  } catch (err) {
    console.warn("[goatService] Firestore create failed, using local fallback:", err.message);
  }

  const stored = getStoredGoatParts();
  stored.push(newPart);
  saveStoredGoatParts(stored);
  return newPart;
}

/**
 * Deletes a goat part
 */
export async function deleteGoatPart(id) {
  try {
    await deleteDoc(doc(db, "goatParts", id));
  } catch (err) {
    console.warn("[goatService] Firestore delete failed, using local fallback:", err.message);
  }

  const stored = getStoredGoatParts();
  const filtered = stored.filter((p) => p.id !== id);
  saveStoredGoatParts(filtered);
  return true;
}

/**
 * Resets all goat parts back to the default 16 cuts with inStock: true
 */
export async function resetGoatPartsToDefaults() {
  const defaults = defaultGoatParts.map((p) => ({
    ...p,
    inStock: true,
    stockKg: 50,
  }));

  try {
    const snap = await getDocs(collection(db, "goatParts"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    defaults.forEach((part) => {
      batch.set(doc(db, "goatParts", part.id), part);
    });
    await batch.commit();
  } catch (err) {
    console.warn("[goatService] Firestore reset failed, using local fallback:", err.message);
  }

  saveStoredGoatParts(defaults);
  return defaults;
}

/**
 * Client-Side WebP Image Optimization & Firebase Cloud Storage Upload for Goat Cuts
 */
export async function uploadGoatPartImage(file) {
  return uploadImageToStorage(file, "goat", {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 0.85,
    allowFallback: true,
  });
}

