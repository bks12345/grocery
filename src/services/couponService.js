import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const defaultCoupons = [
  { id: "c1", code: "WELCOME10", type: "percent", value: 10, description: "10% off welcome discount", active: true },
  { id: "c2", code: "FREESHIP", type: "flat", value: 5, description: "Free standard shipping", active: true },
  { id: "c3", code: "DAALBHAT20", type: "percent", value: 20, description: "20% off festival discount", active: true },
];

const COUPONS_KEY = "daalbhat_mock_coupons";

function getStoredCoupons() {
  try {
    const data = localStorage.getItem(COUPONS_KEY);
    return data ? JSON.parse(data) : defaultCoupons;
  } catch {
    return defaultCoupons;
  }
}

function saveStoredCoupons(coupons) {
  try {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  } catch {}
}

export async function getActiveCoupons() {
  try {
    const snap = await getDocs(collection(db, "coupons"));
    if (!snap.empty) {
      return snap.docs
        .map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }))
        .filter((c) => c.active !== false);
    }
  } catch (err) {
    console.warn("[couponService] Firestore getActiveCoupons failed, using fallback:", err.message);
  }
  return getStoredCoupons().filter((c) => c.active !== false);
}

export async function validateCoupon(code) {
  const cleanCode = code.trim().toUpperCase();
  try {
    const docSnap = await getDoc(doc(db, "coupons", cleanCode));
    if (docSnap.exists()) {
      const coupon = { ...docSnap.data(), id: docSnap.id, firestoreId: docSnap.id };
      if (coupon.active !== false) {
        return coupon;
      }
    }
  } catch (err) {
    console.warn("[couponService] Firestore validateCoupon failed, using fallback:", err.message);
  }

  const coupons = getStoredCoupons();
  const found = coupons.find(
    (c) => c.code.toUpperCase() === cleanCode && c.active !== false
  );

  if (!found) {
    throw new Error("Invalid or expired promo code");
  }
  return found;
}

export async function getAllCoupons() {
  try {
    const snap = await getDocs(collection(db, "coupons"));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }));
    }
  } catch (err) {
    console.warn("[couponService] Firestore getAllCoupons failed, using fallback:", err.message);
  }
  return getStoredCoupons();
}

export async function createCoupon(coupon) {
  const cleanCode = coupon.code.trim().toUpperCase();
  const cleanCoupon = {
    ...coupon,
    code: cleanCode,
    active: coupon.active !== undefined ? coupon.active : true,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "coupons", cleanCode), cleanCoupon);
    return { id: cleanCode, ...cleanCoupon };
  } catch (err) {
    console.warn("[couponService] Firestore createCoupon failed, using fallback:", err.message);
  }

  const coupons = getStoredCoupons();
  coupons.push({ id: cleanCode, ...cleanCoupon });
  saveStoredCoupons(coupons);
  return cleanCoupon;
}

export async function updateCoupon(code, updates) {
  const cleanCode = code.trim().toUpperCase();
  try {
    const docRef = doc(db, "coupons", cleanCode);
    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() };
  } catch (err) {
    console.warn("[couponService] Firestore updateCoupon failed, using fallback:", err.message);
  }

  const coupons = getStoredCoupons();
  const index = coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
  if (index !== -1) {
    coupons[index] = { ...coupons[index], ...updates };
    saveStoredCoupons(coupons);
    return coupons[index];
  }
  return null;
}

export async function deleteCoupon(code) {
  const cleanCode = code.trim().toUpperCase();
  try {
    await deleteDoc(doc(db, "coupons", cleanCode));
    return true;
  } catch (err) {
    console.warn("[couponService] Firestore deleteCoupon failed, using fallback:", err.message);
  }

  let coupons = getStoredCoupons();
  coupons = coupons.filter((c) => c.code.toUpperCase() !== cleanCode);
  saveStoredCoupons(coupons);
  return true;
}
