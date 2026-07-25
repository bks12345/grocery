// Image sources for categories and products.
//
// HOW TO ADD YOUR OWN PHOTOS (download & drag in — no code changes needed):
//   1. Download a photo for a category.
//   2. Rename it to match that category's id below (see `categoryImages`),
//      e.g. "grains-flour.jpg" for the Grains & Flour category.
//   3. Drop it into  public/images/categories/
//   4. Refresh the site — your photo now replaces the placeholder automatically.
//
// If your file isn't a .jpg (e.g. .png or .webp), update the extension in
// `categoryImages` below to match your file.
//
// For an individual PRODUCT photo (overrides its category photo):
//   1. Save the photo as  public/images/products/<product-id>.jpg
//      (product ids are visible in src/data/products.js, e.g. "p001")
//   2. Add an `image` field to that product in products.js, e.g.
//        image: "/images/products/p001.jpg"
//
// Nothing breaks if a file is missing — SafeImage automatically tries the
// backup photo below, then finally falls back to the emoji icon.

export const categoryImages = {
  "grains-flour": "/images/categories/grains-flour.jpg",
  "cooking-essentials": "/images/categories/cooking-essentials.jpg",
  spices: "/images/categories/spices.jpg",
  "packaged-foods": "/images/categories/packaged-foods.jpg",
  dairy: "/images/categories/dairy.jpg",
  "pulses-beans": "/images/categories/pulses-beans.jpg",
  "household-cleaning": "/images/categories/household-cleaning.jpg",
};

// Backup photos (hotlinked, freely-licensed) used automatically whenever a
// local file above hasn't been added yet. Once you drop in your own photo,
// this fallback is simply never reached for that category.
const wikimedia = (filename, width = 600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=${width}`;

const unsplash = (photoId, width = 600) =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80&fit=crop&auto=format`;

export const categoryImagesFallback = {
  "grains-flour": wikimedia("US long grain rice.jpg"),
  "cooking-essentials": wikimedia("Bottle of olive oil.jpg"),
  spices: wikimedia("Indian Spices.jpg"),
  "packaged-foods": wikimedia("Assorted bread.jpg"),
  dairy: unsplash("1601436423474-51738541c1b1"),
  "pulses-beans": wikimedia("Mix of 13 beans and lentils.jpg"),
  "household-cleaning": wikimedia("Afwasmiddel Una Aldi.JPG"),
};

export const getCategoryImage = (categoryId) => categoryImages[categoryId];
export const getCategoryImageFallback = (categoryId) =>
  categoryImagesFallback[categoryId];

// Products borrow their category's photo unless they have their own
// `image` field set in data/products.js.
export const getProductImage = (product) =>
  product.image || categoryImages[product.category];
export const getProductImageFallback = (product) =>
  categoryImagesFallback[product.category] || product.fallbackImage;
