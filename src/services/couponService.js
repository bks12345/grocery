// Mimics real coupon endpoints. Seeded with a couple of default coupons so
// the Cart/Offers pages have something real to show; Admin → Coupons lets
// you add/edit/delete from there, all persisted to localStorage.

const COUPONS_KEY = "daalbhat_coupons";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const defaultCoupons = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    description: "10% off your order",
    expiresAt: null,
    active: true,
  },
  {
    code: "BULK50",
    type: "flat",
    value: 50,
    description: "$50 off bulk pack orders",
    expiresAt: null,
    active: true,
  },
];

function loadCoupons() {
  try {
    const saved = localStorage.getItem(COUPONS_KEY);
    if (!saved) {
      saveCoupons(defaultCoupons);
      return defaultCoupons;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultCoupons;
  } catch {
    return defaultCoupons;
  }
}

function saveCoupons(coupons) {
  try {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  } catch {
    // Storage unavailable — coupons still work for this session
  }
}

const isExpired = (coupon) =>
  coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

/** GET /api/coupons — active, non-expired coupons (for the Offers page) */
export async function getActiveCoupons() {
  await delay();
  return loadCoupons().filter((c) => c.active && !isExpired(c));
}

/** GET /api/coupons (admin) — everything, including inactive/expired */
export async function getAllCoupons() {
  await delay();
  return loadCoupons();
}

/** POST /api/coupons/validate */
export async function validateCoupon(code) {
  await delay(150);
  const coupon = loadCoupons().find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase()
  );
  if (!coupon) throw new Error("Invalid coupon code.");
  if (!coupon.active) throw new Error("This coupon is no longer active.");
  if (isExpired(coupon)) throw new Error("This coupon has expired.");
  return coupon;
}

/** POST /api/coupons (admin) */
export async function createCoupon(coupon) {
  await delay();
  const coupons = loadCoupons();
  if (coupons.some((c) => c.code.toUpperCase() === coupon.code.toUpperCase())) {
    throw new Error("A coupon with this code already exists.");
  }
  const next = [...coupons, { ...coupon, code: coupon.code.toUpperCase() }];
  saveCoupons(next);
  return next;
}

/** PATCH /api/coupons/:code (admin) */
export async function updateCoupon(code, updates) {
  await delay();
  const coupons = loadCoupons().map((c) =>
    c.code === code ? { ...c, ...updates } : c
  );
  saveCoupons(coupons);
  return coupons;
}

/** DELETE /api/coupons/:code (admin) */
export async function deleteCoupon(code) {
  await delay();
  const coupons = loadCoupons().filter((c) => c.code !== code);
  saveCoupons(coupons);
  return coupons;
}
