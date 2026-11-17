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
import { deliveryZones as defaultDeliveryZones } from "../data/deliveryZones";
import { getDeliveryZones, saveStoredDeliveryZones } from "./deliveryService";

const DELIVERY_ZONES_STORAGE_KEY = "daalbhat_mock_delivery_zones";

function getLocalZones() {
  try {
    const data = localStorage.getItem(DELIVERY_ZONES_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return defaultDeliveryZones.map((z) => ({
    ...z,
    id: z.id || z.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
  }));
}

/**
 * Retrieves all delivery zones for admin management.
 */
export async function getAllDeliveryZones() {
  return getDeliveryZones();
}

/**
 * Creates a new delivery zone.
 */
export async function createDeliveryZone(zoneData) {
  const zoneId =
    zoneData.id ||
    zoneData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") ||
    `zone_${Date.now()}`;

  const cleanZone = {
    id: zoneId,
    name: zoneData.name || "New Area",
    postcodes: Array.isArray(zoneData.postcodes)
      ? zoneData.postcodes.map((p) => String(p).trim()).filter(Boolean)
      : [],
    freeAbove: zoneData.freeAbove || "$50",
    reducedCharge: zoneData.reducedCharge || "$1",
    belowRange: zoneData.belowRange || "$0 – $49.99",
    standardCharge: zoneData.standardCharge || "$4.99",
    days: zoneData.days || "Sunday to Friday",
    time: zoneData.time || "4pm – 9pm",
    highlight: Boolean(zoneData.highlight),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "deliveryZones", zoneId), cleanZone);
  } catch (err) {
    console.warn("[adminDeliveryService] Firestore create failed, using local fallback:", err.message);
  }

  const stored = getLocalZones();
  stored.push(cleanZone);
  saveStoredDeliveryZones(stored);
  return cleanZone;
}

/**
 * Updates a delivery zone's metadata or pricing.
 */
export async function updateDeliveryZone(id, updates) {
  const cleanUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "deliveryZones", id);
    await updateDoc(docRef, cleanUpdates);
  } catch (err) {
    console.warn("[adminDeliveryService] Firestore update failed, using local fallback:", err.message);
  }

  const stored = getLocalZones();
  const index = stored.findIndex((z) => z.id === id);
  if (index !== -1) {
    stored[index] = { ...stored[index], ...cleanUpdates };
    saveStoredDeliveryZones(stored);
    return stored[index];
  }

  return { id, ...cleanUpdates };
}

/**
 * Adds one or more postal codes to a specific delivery zone.
 */
export async function addPostcodesToZone(id, newPostcodes) {
  const zones = await getDeliveryZones();
  const target = zones.find((z) => z.id === id);
  if (!target) throw new Error("Delivery zone not found");

  const currentCodes = new Set(target.postcodes || []);
  const incoming = Array.isArray(newPostcodes) ? newPostcodes : [newPostcodes];

  incoming.forEach((code) => {
    const trimmed = String(code || "").trim();
    if (trimmed) currentCodes.add(trimmed);
  });

  const updatedCodes = Array.from(currentCodes);
  return updateDeliveryZone(id, { postcodes: updatedCodes });
}

/**
 * Removes a postal code from a specific delivery zone.
 */
export async function removePostcodeFromZone(id, postcodeToRemove) {
  const zones = await getDeliveryZones();
  const target = zones.find((z) => z.id === id);
  if (!target) throw new Error("Delivery zone not found");

  const updatedCodes = (target.postcodes || []).filter(
    (code) => String(code).trim() !== String(postcodeToRemove).trim()
  );

  return updateDeliveryZone(id, { postcodes: updatedCodes });
}

/**
 * Deletes a delivery zone.
 */
export async function deleteDeliveryZone(id) {
  try {
    await deleteDoc(doc(db, "deliveryZones", id));
  } catch (err) {
    console.warn("[adminDeliveryService] Firestore delete failed, using local fallback:", err.message);
  }

  const stored = getLocalZones();
  const filtered = stored.filter((z) => z.id !== id);
  saveStoredDeliveryZones(filtered);
  return true;
}

/**
 * Resets all delivery zones to the default configuration.
 */
export async function resetDeliveryZonesToDefaults() {
  const defaults = defaultDeliveryZones.map((z) => ({
    ...z,
    id: z.id || z.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
    updatedAt: new Date().toISOString(),
  }));

  try {
    const snap = await getDocs(collection(db, "deliveryZones"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    defaults.forEach((zone) => {
      batch.set(doc(db, "deliveryZones", zone.id), zone);
    });
    await batch.commit();
  } catch (err) {
    console.warn("[adminDeliveryService] Firestore reset failed, using local fallback:", err.message);
  }

  saveStoredDeliveryZones(defaults);
  return defaults;
}
