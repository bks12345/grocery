import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

const defaultCoupons = [
  { id: 'c1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 50, active: true },
  { id: 'c2', code: 'FREESHIP', discountType: 'shipping', discountValue: 0, minPurchase: 30, active: true },
  { id: 'c3', code: 'DAALBHAT20', discountType: 'percentage', discountValue: 20, minPurchase: 100, active: true },
];

const COUPONS_KEY = 'daalbhat_mock_coupons';

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
    const res = await apiGet('/api/coupons');
    if (res) return res;
  } catch (err) {
    console.warn('[couponService] Active coupons API failed, using fallback:', err.message);
  }
  return getStoredCoupons().filter((c) => c.active !== false);
}

export async function validateCoupon(code) {
  try {
    const res = await apiPost('/api/coupons/validate', { code });
    if (res) return res;
  } catch (err) {
    console.warn('[couponService] Validate coupon API failed, using fallback:', err.message);
  }

  const coupons = getStoredCoupons();
  const found = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active !== false
  );

  if (!found) {
    throw new Error('Invalid or expired promo code');
  }
  return found;
}

export async function getAllCoupons() {
  try {
    const res = await apiGet('/api/admin/coupons');
    if (res) return res;
  } catch (err) {
    console.warn('[couponService] Admin coupons API failed, using fallback:', err.message);
  }
  return getStoredCoupons();
}

export async function createCoupon(coupon) {
  try {
    const res = await apiPost('/api/admin/coupons', coupon);
    if (res) return res;
  } catch (err) {
    console.warn('[couponService] Create coupon API failed, using fallback:', err.message);
  }

  const coupons = getStoredCoupons();
  const newCoupon = { id: `c_${Date.now()}`, active: true, ...coupon };
  coupons.push(newCoupon);
  saveStoredCoupons(coupons);
  return newCoupon;
}

export async function updateCoupon(code, updates) {
  try {
    const res = await apiPatch(`/api/admin/coupons/${code}`, updates);
    if (res) return res;
  } catch (err) {
    console.warn('[couponService] Update coupon API failed, using fallback:', err.message);
  }

  const coupons = getStoredCoupons();
  const index = coupons.findIndex((c) => c.code.toLowerCase() === code.toLowerCase());
  if (index !== -1) {
    coupons[index] = { ...coupons[index], ...updates };
    saveStoredCoupons(coupons);
    return coupons[index];
  }
  return null;
}

export async function deleteCoupon(code) {
  try {
    await apiDelete(`/api/admin/coupons/${code}`);
    return true;
  } catch (err) {
    console.warn('[couponService] Delete coupon API failed, using fallback:', err.message);
  }

  let coupons = getStoredCoupons();
  coupons = coupons.filter((c) => c.code.toLowerCase() !== code.toLowerCase());
  saveStoredCoupons(coupons);
  return true;
}
