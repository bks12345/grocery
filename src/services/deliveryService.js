import {
  collection,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { deliveryZones as defaultDeliveryZones } from "../data/deliveryZones";

const DELIVERY_ZONES_STORAGE_KEY = "daalbhat_mock_delivery_zones";

function getStoredDeliveryZones() {
  try {
    const data = localStorage.getItem(DELIVERY_ZONES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[deliveryService] Error reading local storage:", err);
  }

  const initial = defaultDeliveryZones.map((zone) => ({
    ...zone,
    id: zone.id || zone.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
  }));
  saveStoredDeliveryZones(initial);
  return initial;
}

export function saveStoredDeliveryZones(zones) {
  try {
    localStorage.setItem(DELIVERY_ZONES_STORAGE_KEY, JSON.stringify(zones));
  } catch (err) {
    console.warn("[deliveryService] Error saving local storage:", err);
  }
}

/**
 * Fetches all delivery zones from Cloud Firestore with local storage fallback.
 * Never auto-seeds to Firestore during regular reads.
 */
export async function getDeliveryZones() {
  try {
    const snap = await getDocs(collection(db, "deliveryZones"));
    if (!snap.empty) {
      const zones = snap.docs.map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }));
      saveStoredDeliveryZones(zones);
      return zones;
    }

    // Read-only defaults if Firestore collection is empty (never auto-seed to Firestore)
    const defaults = defaultDeliveryZones.map((zone) => ({
      ...zone,
      id: zone.id || zone.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
    }));

    saveStoredDeliveryZones(defaults);
    return defaults;
  } catch (err) {
    console.warn("[deliveryService] Firestore query failed, using fallback:", err.message);
    return getStoredDeliveryZones();
  }
}

/**
 * Finds if a postal code belongs to any active delivery zone.
 */
export async function findZoneByPostcode(postcode) {
  const clean = String(postcode || "").trim();
  if (!clean) return null;

  const zones = await getDeliveryZones();
  return zones.find((zone) => zone.postcodes?.some((p) => String(p).trim() === clean)) || null;
}

/**
 * Returns featured postal codes to display in notifications or pop-ups.
 */
export async function getFeaturedPostcodes(limit = 6) {
  const zones = await getDeliveryZones();
  const codes = [];
  zones.forEach((zone) => {
    if (Array.isArray(zone.postcodes)) {
      zone.postcodes.forEach((pc) => {
        if (pc && !codes.includes(pc)) {
          codes.push(pc);
        }
      });
    }
  });
  return codes.slice(0, limit);
}
