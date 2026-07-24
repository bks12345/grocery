export const offersMenu = [
  {
    group: "Current Deals",
    items: [
      { label: "Flash Sales", to: "/offers?type=flash-sale", note: "Ends in hours" },
      { label: "Buy One Get One", to: "/offers?type=bogo", note: "Selected items" },
      { label: "Clearance", to: "/offers?type=clearance", note: "Up to 50% off" },
    ],
  },
  {
    group: "Savings",
    items: [
      { label: "Bulk Pack Deals", to: "/shop?bulk=true", note: "Family-size savings" },
      { label: "Coupon Codes", to: "/offers?type=coupons", note: "Apply at checkout" },
      { label: "Seasonal Discounts", to: "/offers?type=seasonal", note: "Limited time" },
    ],
  },
];
