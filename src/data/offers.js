export const offersMenu = [
  { label: "Best Sellers", to: "/shop?bestseller=true", badge: "HOT" },
  { label: "Combo Deals", to: "/shop?combo=true" },
  { label: "Family Bulk Packs", to: "/shop?bulk=true" },
  { label: "Latest Products", to: "/shop?new=true", badge: "NEW" },
  { label: "Featured Products", to: "/shop?featured=true" },
  { label: "Flash Sale", to: "/shop?discount=true&promo=flash-sale", badge: "SALE" },
  { label: "Festival Offers", to: "/shop?sale=true" },
  { label: "Limited-Time Deals", to: "/shop?discount=true&promo=limited-time" },
  { label: "Weekly Deals", to: "/shop?discount=true&promo=weekly-deals" },
  { label: "Clearance Sale", to: "/shop?discount=true&promo=clearance" },
];

export const offerBadgeStyles = {
  NEW: "bg-basil-600 text-white",
  HOT: "bg-tomato-500 text-white",
  SALE: "bg-mango-500 text-basil-900",
};

// An offer item is "active" when the current URL's path matches and it
// carries every query param the item specifies (extra params like a typed
// search term are fine — that's still "this offer, filtered further").
export function isOfferActive(item, pathname, search) {
  const [itemPath, itemQuery = ""] = item.to.split("?");
  if (pathname !== itemPath) return false;
  const itemParams = new URLSearchParams(itemQuery);
  const currentParams = new URLSearchParams(search);
  for (const [key, value] of itemParams) {
    if (currentParams.get(key) !== value) return false;
  }
  return true;
}
