/**
 * Discount utility functions for Daalbhat Grocery.
 * Provides unified, bidirectional percentage-off calculations
 * across the storefront and admin panel.
 */

/**
 * Computes the integer discount percentage for a product (0 to 100).
 * Handles explicit discountPercent, isHalfPrice flag, or computes from (oldPrice - price).
 *
 * @param {Object} product
 * @returns {number} Integer between 0 and 100
 */
export function getDiscountPercent(product) {
  if (!product) return 0;

  // 1. Explicit discount percentage set on product
  if (
    product.discountPercent !== undefined &&
    product.discountPercent !== null &&
    product.discountPercent !== ""
  ) {
    const parsed = Math.round(Number(product.discountPercent));
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      return parsed;
    }
  }

  // 2. Legacy / half-price flag
  if (product.isHalfPrice) {
    return 50;
  }

  // 3. Calculated from oldPrice vs current price
  const oldPrice = Number(product.oldPrice);
  const currentPrice = Number(product.price);

  if (oldPrice > 0 && currentPrice >= 0 && oldPrice > currentPrice) {
    const calculated = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    return Math.min(100, Math.max(0, calculated));
  }

  return 0;
}

/**
 * Calculates discounted selling price from original price and discount percentage.
 *
 * @param {number|string} originalPrice
 * @param {number|string} discountPercent
 * @returns {number} Rounded to 2 decimal places
 */
export function calculateDiscountedPrice(originalPrice, discountPercent) {
  const orig = Number(originalPrice);
  const pct = Number(discountPercent);
  if (isNaN(orig) || orig <= 0) return 0;
  if (isNaN(pct) || pct <= 0) return orig;
  const discounted = orig * (1 - Math.min(100, pct) / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculates discount percentage from original price and selling price.
 *
 * @param {number|string} originalPrice
 * @param {number|string} salePrice
 * @returns {number} Integer between 0 and 100
 */
export function calculateDiscountPercent(originalPrice, salePrice) {
  const orig = Number(originalPrice);
  const sale = Number(salePrice);
  if (isNaN(orig) || isNaN(sale) || orig <= 0 || orig <= sale) return 0;
  return Math.round(((orig - sale) / orig) * 100);
}
