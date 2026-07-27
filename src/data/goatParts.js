// Mock data for the "Book a Goat" feature. Mirrors the shape of products.js
// (id, name, price/unit) so the selection can be pushed into the same
// CartContext as regular products once quantities are confirmed.
//
// `icon` + `group` drive the fallback illustration rendered on each part
// card (see GoatPartIllustration in pages/BookGoat.jsx). Where a real,
// freely-licensed, appropriately-labeled photo exists on Wikimedia Commons,
// `image` is set and the card shows that instead — the icon still renders
// underneath as a graceful fallback if the photo ever fails to load.
//
// Not every part has a photo: several (brain, head, trotters, intestine,
// fat, lung, kidney, tail) don't have a clean, correctly-licensed,
// goat-specific photo available online that isn't either a graphic
// dissection/anatomy shot or mislabeled as a different animal — so those
// stay as illustrations rather than risk showing something wrong or
// unappetizing. Drop a photo into public/images/goat-parts/<id>.jpg and set
// `image` below to replace any of these once you have your own.

const wikimedia = (filename, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;

export const goatParts = [
  { id: "g_whole", name: "Whole Goat", pricePerKg: 1100, defaultUnit: "kg", minQty: 1, icon: "beef", group: "cut", rotate: 0, image: wikimedia("Goat 01.jpg") },
  { id: "g_leg", name: "Leg", pricePerKg: 1200, defaultUnit: "kg", minQty: 0.5, icon: "drumstick", group: "cut", rotate: 0, image: wikimedia("Raw lamb cutlets with shredded ginger and rosemary.jpg") },
  { id: "g_shoulder", name: "Shoulder", pricePerKg: 1050, defaultUnit: "kg", minQty: 0.5, icon: "beef", group: "cut", rotate: -18, image: wikimedia("Raw Meat.jpg") },
  { id: "g_ribs", name: "Ribs", pricePerKg: 950, defaultUnit: "kg", minQty: 0.5, icon: "beef", group: "cut", rotate: 18, image: wikimedia("FoodMeat.jpg") },
  { id: "g_loin", name: "Loin", pricePerKg: 1150, defaultUnit: "kg", minQty: 0.5, icon: "drumstick", group: "cut", rotate: -15, image: wikimedia("Raw Meat.jpg") },
  { id: "g_neck", name: "Neck", pricePerKg: 800, defaultUnit: "kg", minQty: 0.5, icon: "drumstick", group: "cut", rotate: 15, image: wikimedia("FoodMeat.jpg") },
  { id: "g_liver", name: "Liver", pricePerKg: 650, defaultUnit: "kg", minQty: 0.5, icon: "droplet", group: "organ", rotate: 0, image: wikimedia("Raw liver.jpg") },
  { id: "g_heart", name: "Heart", pricePerKg: 600, defaultUnit: "kg", minQty: 0.5, icon: "heart", group: "organ", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_kidney", name: "Kidney", pricePerKg: 600, defaultUnit: "kg", minQty: 0.5, icon: "bean", group: "organ", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_brain", name: "Brain", pricePerKg: 500, defaultUnit: "kg", minQty: 0.5, icon: "brain", group: "organ", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_head", name: "Head", pricePerKg: 700, defaultUnit: "kg", minQty: 0.5, icon: "skull", group: "extra", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_trotters", name: "Trotters", pricePerKg: 550, defaultUnit: "kg", minQty: 0.5, icon: "footprints", group: "extra", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_intestine", name: "Intestine", pricePerKg: 450, defaultUnit: "kg", minQty: 0.5, icon: "waves", group: "extra", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_fat", name: "Fat", pricePerKg: 400, defaultUnit: "kg", minQty: 0.5, icon: "droplets", group: "extra", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_lung", name: "Lung", pricePerKg: 450, defaultUnit: "kg", minQty: 0.5, icon: "wind", group: "organ", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
  { id: "g_tail", name: "Tail", pricePerKg: 300, defaultUnit: "kg", minQty: 0.5, icon: "shell", group: "extra", rotate: 0 , image: wikimedia("Raw Meat.jpg")},
];

export const goatQtyStep = 0.5;

export const goatHeroImage = wikimedia("Goat.jpg", 1400);

export const goatFeatureImages = [
  // {
  //   id: "healthy",
  //   title: "100% Healthy Goats",
  //   subtitle: "Vet-checked before every booking",
  //   image: wikimedia("Beautiful Goat (193265569).jpeg"),
  // },
  // {
  //   id: "farm",
  //   title: "Farm Raised",
  //   subtitle: "Open-grazed, free-range herds",
  //   image: wikimedia("Goat 01.jpg"),
  // },
  // {
  //   id: "fresh",
  //   title: "Fresh & Halal Cut",
  //   subtitle: "Prepared to order, same day",
  //   image: wikimedia("Goat.jpeg"),
  // },
];
