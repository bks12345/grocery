# Adding your own photos

This site tries **your own local photo first**, and only uses the built-in
placeholder photo if yours isn't there yet. Nothing breaks in the meantime.

## Category photos

Save each photo as a **.jpg** file, named to match the category, directly in
this `categories/` folder:

| Category               | Expected filename                       |
|------------------------|-------------------------------------------|
| Grains & Flour          | `categories/grains-flour.jpg`             |
| Cooking Essentials      | `categories/cooking-essentials.jpg`       |
| Spices                  | `categories/spices.jpg`                   |
| Packaged Foods          | `categories/packaged-foods.jpg`           |
| Dairy                   | `categories/dairy.jpg`                    |
| Pulses & Beans          | `categories/pulses-beans.jpg`             |
| Household & Cleaning    | `categories/household-cleaning.jpg`       |

That's it — refresh the site and your photo appears everywhere that
category shows up (Home, Categories page, Shop filters, the mega menu).

**Using a .png or .webp instead of .jpg?** Open `src/data/images.js` and
change the file extension in the `categoryImages` object to match.

## Individual product photos (optional)

Product cards show their *category* photo by default. To give one specific
product its own distinct photo instead:

1. Save the photo as `products/<product-id>.jpg` in this folder
   (find product ids in `src/data/products.js`, e.g. `p001`, `b001`)
2. Open `src/data/products.js`, find that product, and add:
   ```js
   image: "/images/products/p001.jpg",
   ```

## Photo tips for a clean, consistent look

- **Aspect ratio:** roughly square or 4:3 works best — cards crop to fill their box
- **Size:** 600–800px on the longest side is plenty (smaller = faster loading)
- **Format:** `.jpg` for photos, `.webp` for smaller file sizes if your editor supports it
- **File size:** aim under ~200KB per image where possible
