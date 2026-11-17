import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const STORE_FEATURES_STORAGE_KEY = "daalbhat_mock_store_features";
const FEATURES_UPDATED_EVENT = "daalbhat:features-updated";

export const DEFAULT_STORE_FEATURES = {
  goatBookingActive: true,
  nepalOrderActive: true,
  customizeGroceryActive: true,
  updatedAt: new Date().toISOString(),
};

function getStoredFeatures() {
  try {
    const raw = localStorage.getItem(STORE_FEATURES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_STORE_FEATURES, ...parsed };
      }
    }
  } catch (err) {
    console.warn("[storeFeaturesService] Error reading local storage:", err);
  }
  return { ...DEFAULT_STORE_FEATURES };
}

function saveStoredFeatures(features) {
  try {
    localStorage.setItem(STORE_FEATURES_STORAGE_KEY, JSON.stringify(features));
  } catch (err) {
    console.warn("[storeFeaturesService] Error saving local storage:", err);
  }
}

function notifySubscribers(features) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(FEATURES_UPDATED_EVENT, { detail: features })
    );
  }
}

/**
 * Fetches the current store feature flags (Goat Booking, Order from Nepal).
 * Syncs with Firestore settings/storeFeatures and falls back safely to localStorage.
 */
export async function getStoreFeatures() {
  try {
    const docRef = doc(db, "settings", "storeFeatures");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const merged = { ...DEFAULT_STORE_FEATURES, ...data };
      saveStoredFeatures(merged);
      return merged;
    }

    // Return default feature settings without auto-seeding to Firestore
    saveStoredFeatures(DEFAULT_STORE_FEATURES);
    return DEFAULT_STORE_FEATURES;
  } catch (err) {
    console.warn(
      "[storeFeaturesService] Firestore get failed, using fallback:",
      err.message
    );
    return getStoredFeatures();
  }
}

/**
 * Updates store feature toggles in Firestore and localStorage, then dispatches an update event.
 */
export async function updateStoreFeatures(updates) {
  const current = getStoredFeatures();
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "settings", "storeFeatures");
    await setDoc(docRef, merged, { merge: true });
  } catch (err) {
    console.warn(
      "[storeFeaturesService] Firestore update failed, using local fallback:",
      err.message
    );
  }

  saveStoredFeatures(merged);
  notifySubscribers(merged);
  return merged;
}

/**
 * Quick toggle for Goat Booking service.
 */
export async function toggleGoatBooking(activeState) {
  return updateStoreFeatures({ goatBookingActive: Boolean(activeState) });
}

/**
 * Quick toggle for Order from Nepal service.
 */
export async function toggleNepalOrder(activeState) {
  return updateStoreFeatures({ nepalOrderActive: Boolean(activeState) });
}

/**
 * Quick toggle for Customize Grocery service.
 */
export async function toggleCustomizeGrocery(activeState) {
  return updateStoreFeatures({ customizeGroceryActive: Boolean(activeState) });
}
