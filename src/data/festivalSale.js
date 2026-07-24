// Controls the homepage Festival Sale section (components/ui/FestivalSale.jsx).
//
// The section only renders while `active` is true AND the current time is
// before `endDate` — once the sale ends (or you flip `active` to false),
// the section disappears entirely and "Shop by Category" moves up to take
// its place, no code changes needed elsewhere.
//
// To run a new sale: update these fields and set `isFestivalSale: true`
// (with a real `oldPrice`) on whichever products in data/products.js
// should appear in the carousel.

export const festivalSale = {
  active: true,
  emoji: "🎉",
  name: "Dashain Festival Sale",
  discountLabel: "Up to 30% OFF",
  subtitle: "Stock up on festival favorites before the celebration ends.",
  // ISO date-time the sale ends (local time). Countdown counts down to this.
  endDate: "2026-08-02T23:59:59",
};
