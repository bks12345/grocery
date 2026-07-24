// Master category list. `subcategories` doubles as the flat item list shown
// in nav menus and is also what each category's products (data/products.js)
// are named after, so the Category -> Product picker (components/ui/
// CategoryProductPicker.jsx) can filter products by these exact names.

export const categories = [
  {
    id: "grains-flour",
    name: "Grains & Flour",
    color: "bg-mango-100",
    subcategories: [
      "Rice",
      "Basmati Rice",
      "Wheat Flour (Atta)",
      "Maize Flour",
      "Millet Flour",
      "Beaten Rice (Chiura)",
    ],
  },
  {
    id: "cooking-essentials",
    name: "Cooking Essentials",
    color: "bg-tomato-100",
    subcategories: ["Cooking Oil", "Mustard Oil", "Salt", "Sugar", "Tea", "Coffee"],
  },
  {
    id: "spices",
    name: "Spices",
    color: "bg-basil-100",
    subcategories: [
      "Turmeric Powder",
      "Cumin Powder",
      "Coriander Powder",
      "Chili Powder",
      "Black Pepper",
      "Garam Masala",
    ],
  },
  {
    id: "packaged-foods",
    name: "Packaged Foods",
    color: "bg-mango-100",
    subcategories: [
      "Noodles",
      "Pasta",
      "Macaroni",
      "Biscuits",
      "Bread",
      "Oats",
    ],
  },
  {
    id: "dairy",
    name: "Dairy",
    color: "bg-tomato-100",
    subcategories: ["Milk", "Curd (Yogurt)", "Butter", "Cheese", "Paneer", "Ghee"],
  },
  {
    id: "pulses-beans",
    name: "Pulses & Beans",
    color: "bg-basil-100",
    subcategories: [
      "Lentil (Masoor Dal)",
      "Black Lentil (Maas)",
      "Chickpeas (Chana)",
      "Kidney Beans (Rajma)",
      "Green Gram (Moong)",
      "Soybeans",
      "Black-eyed Peas",
    ],
  },
  {
    id: "household-cleaning",
    name: "Household & Cleaning",
    color: "bg-mango-100",
    subcategories: [
      "Laundry Detergent",
      "Hand Wash",
      "Soap",
      "Shampoo",
      "Toothpaste",
      "Toilet Paper",
      "Tissue Paper",
    ],
  },
];
