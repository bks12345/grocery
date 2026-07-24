# Adding your own goat part photos

Just like category and product photos, this page **tries your own local
photo first**, and only falls back to a placeholder if yours isn't there
yet. Nothing breaks in the meantime.

## How to add a photo

1. Save your photo as a **.jpg** file.
2. Name it to match the part's id below.
3. Drop it into this `goat-parts/` folder.
4. Refresh the site — your photo replaces the placeholder automatically,
   both in the part-selection grid and in the "Your Selection" summary.

| Part        | Expected filename          |
|-------------|-----------------------------|
| Whole Goat  | `goat-parts/g_whole.jpg`     |
| Leg         | `goat-parts/g_leg.jpg`       |
| Shoulder    | `goat-parts/g_shoulder.jpg`  |
| Ribs        | `goat-parts/g_ribs.jpg`      |
| Loin        | `goat-parts/g_loin.jpg`      |
| Neck        | `goat-parts/g_neck.jpg`      |
| Liver       | `goat-parts/g_liver.jpg`     |
| Heart       | `goat-parts/g_heart.jpg`     |
| Kidney      | `goat-parts/g_kidney.jpg`    |
| Brain       | `goat-parts/g_brain.jpg`     |
| Head        | `goat-parts/g_head.jpg`      |
| Trotters    | `goat-parts/g_trotters.jpg`  |
| Intestine   | `goat-parts/g_intestine.jpg` |
| Fat         | `goat-parts/g_fat.jpg`       |
| Lung        | `goat-parts/g_lung.jpg`      |
| Tail        | `goat-parts/g_tail.jpg`      |

**Using a .png or .webp instead?** Open `src/pages/BookGoat.jsx`, find
`GoatPartIllustration`, and change the `.jpg` extension in the `sources`
array to match.

## What happens if you don't add a photo

Each part falls back in this order:

1. Your local photo above (if present)
2. A built-in backup photo — currently set for Whole Goat, Leg, Shoulder,
   Ribs, Loin, Neck, and Liver only (see `image` field in
   `src/data/goatParts.js`)
3. A clean colored icon matching that part's category (cut / organ / extra)

So parts without a backup photo (Heart, Kidney, Brain, Head, Trotters,
Intestine, Fat, Lung, Tail) currently show as icons — add your own photo
for any of these and it takes over immediately.

## Photo tips for a clean, consistent look

- **Aspect ratio:** square works best — these render inside circular cards
- **Size:** 400–600px is plenty (smaller = faster loading)
- **Format:** `.jpg` for photos, `.webp` for smaller file sizes if your editor supports it
- **File size:** aim under ~150KB per image where possible
- **Framing:** center the cut/part in frame with some padding — the circle crop trims the edges
