# Project Documentation: Grocery E-Commerce Platform (Daalbhat)

> **Living Document**: This file records the project structure, architectural decisions, ongoing work, and roadmap. It **must be updated** whenever new features, refactorings, or structural changes are made.

---

## 1. Executive Summary & Overview
**Daalbhat / Grocery Platform** is a full-featured e-commerce application designed for local and specialty grocery shopping (including custom features like *Order From Nepal*, *Book Goat*, and *Grocery Estimation*).

It provides:
- **Customer Shopping Experience**: Product browsing, category filtering, cart, wishlist, checkout, order tracking, special offers, and estimates.
- **Admin Dashboard**: Category management, product catalog management, order processing, and discount/coupon configuration.
- **Authentication & User Profiles**: Role-based access for Customers and Administrators.
- **Full Native Firebase Architecture**: Powered by Cloud Firestore, Firebase Authentication, Firebase Storage, and Firebase Hosting.

---

## 2. Tech Stack & Key Dependencies

| Layer / Concern | Technology | Version / Details |
|---|---|---|
| **Frontend Core** | React | `^19.2.7` |
| **Build Tooling** | Vite | `^8.1.1` |
| **Routing** | React Router DOM | `^7.18.1` |
| **Styling** | Tailwind CSS (v4) + PostCSS | `^4.3.2` |
| **Backend & Database** | Firebase / Cloud Firestore | `^11.4.0` |
| **Authentication** | Firebase Auth | Email/Password & Role Management |
| **File Storage** | Firebase Cloud Storage | Product WebP & Catalog Images |
| **Hosting & CDN** | Firebase Hosting | Global Edge CDN & SSL |
| **Icons & Visuals** | Lucide React, React Icons | `^1.23.0`, `^5.7.0` |
| **Charts** | Recharts | `^3.9.2` |
| **Linting** | Oxlint | `^1.71.0` |

---

## 3. System Architecture & Directory Structure

```
grocery/
├── firebase.json         # Firebase configuration (Hosting, Firestore, Storage, Emulators)
├── .firebaserc           # Firebase project alias
├── firestore.rules       # Granular Firestore security rules
├── firestore.indexes.json# Firestore composite query indexes
├── storage.rules         # Firebase Storage security rules
├── cors.json             # Locked-down Cloud Storage CORS origins for dalbhat.com.au
├── backups/              # Database export archives & products snapshots
│   ├── firestore-backup-2026-10-12T07-25-02-429Z/ # Full database dump (products, categories, etc.)
│   └── latest-products-backup.json                # Latest 64-product snapshot
├── scripts/
│   ├── backupFirestore.js # Automated Firestore database backup script
│   ├── cleanProducts.js   # Safe batch-cleaner for products collection
│   └── seedFirestore.js   # Automated Firestore database seeding script
├── src/
│   ├── assets/           # Static image assets and icons
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin panel components (tables, forms, modals)
│   │   ├── layout/       # Headers, Footers, Navigation layouts
│   │   └── ui/           # Buttons, Badges, Cards, Modals, Inputs
│   ├── context/          # State Context Providers
│   │   ├── AuthContext.jsx       # Firebase Auth state & user hydration
│   │   ├── CartContext.jsx       # Shopping cart state & local persistence
│   │   └── WishlistContext.jsx   # Favorites & Wishlist state
│   ├── data/             # Static datasets & fallback mock data
│   ├── firebase/
│   │   └── config.js     # Firebase SDK initialization (Auth, DB, Storage)
│   ├── hooks/            # Custom React hooks (useAsync, useCountdown, useStoreFeatures)
│   ├── pages/            # View components / Route destinations
│   │   ├── admin/        # Admin views (Dashboard, Products, Categories, Orders, NepalOrders, GoatStock, FestivalSale, DeliveryZones, Templates, CMS)
│   │   │   ├── AdminCategories.jsx
│   │   │   ├── AdminCMS.jsx
│   │   │   ├── AdminCoupons.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   ├── AdminCustomizedGrocery.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDeliveryZones.jsx
│   │   │   ├── AdminFestivalSale.jsx
│   │   │   ├── AdminGoatStock.jsx
│   │   │   ├── AdminNepalOrders.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminTemplates.jsx
│   │   ├── About.jsx
│   │   ├── Account.jsx
│   │   ├── BookGoat.jsx
│   │   ├── Cart.jsx
│   │   ├── Categories.jsx
│   │   ├── Checkout.jsx
│   │   ├── Contact.jsx
│   │   ├── FAQ.jsx
│   │   ├── GroceryEstimate.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx / Register.jsx / ForgotPassword.jsx
│   │   ├── Offers.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── OrderFromNepal.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ReturnPolicy.jsx / PrivacyPolicy.jsx / Terms.jsx / ShippingPolicy.jsx
│   │   ├── Shop.jsx
│   │   └── Wishlist.jsx
│   ├── services/         # Firebase Data Services & Stores
│   │   ├── adminCategoryService.js
│   │   ├── adminDeliveryService.js
│   │   ├── adminProductService.js
│   │   ├── adminTemplateService.js
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── categoryStore.js
│   │   ├── contentService.js
│   │   ├── couponService.js
│   │   ├── customizedGroceryService.js
│   │   ├── deliveryService.js
│   │   ├── festivalSaleService.js
│   │   ├── goatService.js
│   │   ├── groceryEstimateService.js
│   │   ├── mailService.js
│   │   ├── nepalOrderService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── productStore.js
│   │   ├── storageService.js
│   │   └── storeFeaturesService.js
│   ├── utils/            # Shared Calculation & Data Utilities
│   │   └── discount.js   # Centralized percentage discount calculations & bidirectional price helpers
│   ├── App.jsx           # Main Router & Application shell
│   ├── index.css         # Tailwind & global stylesheet
│   └── main.jsx          # React entry point
├── package.json          # Node dependencies & scripts
└── vite.config.js        # Vite build configuration
```

---

## 4. Current Work & Status Tracker

- **Phase 18: Storage Bucket Image Upload Fix & Full Security Rules Live Deployment (`storage.rules`, `package.json`, Firebase Hosting & Storage)**:
  - **Storage Bucket Image Upload Fix (`storage.rules`)**:
    - Identified root cause of image upload failures: `storage.rules` attempted unsupported cross-service `firestore.exists()` lookups that failed evaluation and caused `storageService.js` to silently fall back to Base64 strings.
    - Updated `storage.rules` to allow reliable authenticated image uploads with strict MIME whitelist (`image/(jpeg|png|webp|gif|svg+xml)`), file size constraint (<= 15MB), filename length checks (<= 128 chars), and default-deny catch-all.
    - Updated `package.json` deployment script (`firebase:deploy`) to include `storage` in `--only hosting,firestore:rules,storage`.
  - **Full Production Deployment to Firebase**:
    - Compiled and deployed `storage.rules` directly to `firebase.storage`.
    - Released hardened `firestore.rules` to `cloud.firestore`.
    - Released production Vite bundle to Firebase Hosting (`https://daalbhat-grocery.web.app`).

- **Phase 17: Database Backup & Fresh Product Reset Preparation (`scripts/backupFirestore.js`, `scripts/cleanProducts.js`, `backups/`)**:
  - **Full Automated Database Backup (`scripts/backupFirestore.js`)**:
    - Built comprehensive database exporter querying all live Firestore collections (`products`, `categories`, `coupons`, `goatParts`, `customizedGrocery`, `deliveryZones`, `settings`, `content`).
    - Successfully exported a complete live snapshot to `backups/firestore-backup-2026-10-12T07-25-02-429Z/` containing 64 products (`products.json`, 59.0 KB), `categories.json` (7 items), `coupons.json` (3 items), `goatParts.json` (17 items), `customizedGrocery.json` (9 items), `deliveryZones.json` (5 items), `settings.json` (3 items), and `content.json` (10 items), plus full unified dump `database-complete-backup.json` (121.2 KB).
    - Preserved `backups/latest-products-backup.json` as a fast reference for catalog re-importing.
  - **Safe Products Deletion Tool (`scripts/cleanProducts.js`)**:
    - Created a batch-cleaner script supporting safe 450-document chunks with administrator authentication verification and explicit `--confirm` flag protection against accidental data loss.
    - Wired `npm run db:backup` and `npm run db:clean-products` scripts in `package.json`.

- **Phase 16: Deep Security Audit, API Check, Auth Hardening & Secret Protection (`firestore.rules`, `storage.rules`, `apiClient.js`, `orderService.js`, `seedFirestore.js`, `Account.jsx`, `AdminCustomers.jsx`)**:
  - **Hardcoded Secret Keys & Credential Enforcements**:
    - Eliminated weak default admin password (`"admin123"`) in `scripts/seedFirestore.js`; enforced explicit `SEED_ADMIN_PASSWORD` env variable with minimum length and rejection of default strings.
    - Verified zero private keys, API secrets, or service account credentials committed to git history or frontend bundles.
  - **Suspended Account Zero-Trust Lockdown (`firestore.rules`)**:
    - Hardened `isValidOrderCreate()`, `isValidNepalOrderCreate()`, `isValidContactMessage()`, and `isValidMailCreate()` to explicitly verify `users/{uid}.blocked != true`, ensuring suspended accounts cannot place orders or trigger emails.
    - Restricted `isValidUserUpdate()` so blocked users cannot modify their Firestore document.
  - **Identity Integrity & Email Immutability (`firestore.rules` & `Account.jsx`)**:
    - Added `'email'` to protected immutable keys in `isValidUserUpdate()`, blocking customers from altering their primary login email in Firestore.
    - Updated `Account.jsx` (`ProfileTab`) to render primary email as read-only and excluded email from user update payloads.
  - **Client-Side Cart Price Tampering Defense (`orderService.js`)**:
    - Added authoritative catalog price validation (`getProductById`) on `placeOrder()`. Even if an attacker modifies `localStorage.getItem('daalbhat_cart')`, unit prices, subtotal, and total are recalculated from verified catalog prices before saving.
  - **Google OAuth Graceful Security Management (`Account.jsx`)**:
    - Detected Google OAuth sign-in in `SecurityTab` (`providerId === 'google.com'`) and rendered dedicated Google Security card, preventing credential errors from password forms.
  - **Admin Self-Demotion & Self-Lockout Guards (`AdminCustomers.jsx`)**:
    - Guarded self-targeting actions so the active admin cannot accidentally block or demote their own account.
  - **API Client Production Security & Path Normalization (`src/services/apiClient.js`)**:
    - Secured `BASE_URL` fallback for production environments and normalized request paths.
  - **Storage Rules Operation Decoupling (`storage.rules`)**:
    - Separated `create, update` rules from `delete` across `/products/`, `/goat/`, `/cms/`, `/categories/`, `/uploads/`.

- **Comprehensive Security Audit & Deep Production Hardening (`firestore.rules`, `storage.rules`, `firebase.json`, `apiClient.js`)**:
  - **Full Security Audit & Runbook**:
    - Conducted an end-to-end red team security audit analyzing Firestore rules, Storage rules, Auth RBAC, API client, and network headers.
    - Generated a comprehensive security audit report, remediation implementation plan, and manual testing runbook (`security_audit_and_implementation_plan.md`).
  - **Cloud Storage Admin Lockdown (`storage.rules`)**:
    - Eliminated arbitrary media deletion and overwrite vulnerability by enforcing `isAdmin()` checks (via Firebase Auth tokens and cross-service Firestore lookups `firestore.get(...)`) across all media paths (`/products/`, `/goat/`, `/cms/`, `/categories/`, `/uploads/`).
  - **Catalog Deletion Denial-of-Service Fix (`firestore.rules`)**:
    - Separated `create, update` rules from `delete` across `products`, `categories`, `coupons`, and `goatParts`, resolving the null `request.resource.data` runtime failure during document deletions by administrators.
  - **Mail Queue Relay Protection & Field Whitelist (`firestore.rules`)**:
    - Closed unauthenticated open mail relay in `/mail` by requiring `isAuthenticated()`.
    - Whitelisted `from` and `orderParams` in `isValidMailCreate()`, enabling legitimate transactional emails to queue without permission errors.
  - **Nepal Custom Orders Schema Alignment (`firestore.rules`)**:
    - Aligned `isValidNepalOrderCreate()` to support `orderId`, `senderName`, `senderEmail`, `senderPhone`, `recipientName`, `recipientPhone`, `recipientAddress`, and `items`, stopping silent local-storage-only fallbacks.
  - **Coupon Validation Fix (`firestore.rules`)**:
    - Updated `isValidCoupon()` to support both `value` + `type` ('percent' | 'flat') and `discountPercent`, enabling administrators to create persistent coupons in Firestore.
  - **Sensitive Settings Isolation (`firestore.rules`)**:
    - Restricted public read access on `/settings/{settingId}` to only storefront flags (`storeFeatures`, `festivalSale`); locked `settings/emailConfig` to admin-only.
  - **Order Mathematical Integrity Check (`firestore.rules`)**:
    - Added rule-level validation enforcing `total == subtotal - discount + deliveryFee`, preventing client-side price and total tampering.
  - **Bootstrap Admin Authorization (`firestore.rules`)**:
    - Enabled initial admin provisioning rule for authorized seed accounts (`admin@daalbhat.com`, `owner@daalbhat.com`).
  - **Content-Security-Policy (CSP) & HTTP Headers (`firebase.json`)**:
    - Added production CSP restricting script execution, style loading, font sources, image origins, frame embedding, and API connections.
  - **Resilient API Client (`src/services/apiClient.js`)**:
    - Strengthened centralized fetch wrapper with explicit error diagnostics and network failure handling.

- **Production Security Hardening & Zero-Trust Rules Verification (`firestore.rules`, `storage.rules`, `cors.json`, `firebase.json`)**:
  - **Firestore Rules Deep Hardening**:
    - **Privilege Escalation & Suspended Account Protection**: `isAdmin()` now verifies `blocked != true`, blocking suspended administrators. Registration (`isValidUserCreate`) strictly binds `id == userId`, forces `role: 'customer'`, `blocked: false`, and whitelists profile keys (`keys().hasOnly(...)`).
    - **Profile Integrity (`isValidUserUpdate`)**: Enforces immutability of `role`, `blocked`, and `id`, with strict length limits on `name` (1..100), `email` (4..150), `phone` (max 30), and `addresses` (max 20 entries).
    - **Order Integrity (`isValidOrderCreate`)**: Strictly verifies `orderId` length (1..64), initial `status in ['confirmed', 'pending']`, `items` (1..100 items), `total` ($0 to $100,000), `subtotal` ($0 to $100,000), valid `deliveryMethod` and `paymentMethod` enums, and strict allowed field key whitelist.
    - **Abuse & Injection Prevention**: `contactMessages`, `nepalOrders` (status strictly 'pending' on create), and outbound `mail` are protected with key whitelisting and payload length bounds to block spam and Denial of Service (DoS) attacks.
    - **Catalog Data Sanity**: Added defensive schema checks on admin writes for `products` (non-negative price, non-empty name), `categories`, `coupons` (discount 0..100%), and `goatParts`.
    - **Default-Deny Catch-All**: Blocks reading or writing to any undeclared collections (`match /{document=**} { allow read, write: if false; }`).
  - **Storage Rules Deep Hardening**:
    - Replaced wildcard paths with explicit single and nested folder path patterns (`/products/{fileName}`, `/products/{folder}/{fileName}`, `/goat/`, `/cms/`, `/categories/`, `/uploads/`), completely neutralizing directory traversal exploits.
    - Added filename length limits (`1..128` chars), strict MIME whitelist (`image/(jpeg|png|webp|gif|svg+xml)`), and byte size bounds (`0 < size <= 15MB`).
    - Enforced absolute default-deny (`match /{allPaths=**} { allow read, write: if false; }`) on all unmapped bucket paths.
  - **Cloud Storage CORS**:
    - Replaced wildcard `"*"` with explicit authorized production origins (`https://dalbhat.com.au`, `https://www.dalbhat.com.au`, `https://daalbhat-grocery.web.app`, `https://daalbhat-grocery.firebaseapp.com`) and local development ports.
  - **Hosting Security Headers**:
    - Added production HTTP response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) in `firebase.json`.

- **Blaze Plan Firebase Cloud Storage Architecture & Image Uploads (`storageService.js`)**:
  - Upgraded image handling infrastructure from client base64 storage in Firestore to native **Firebase Cloud Storage** activated on the Blaze plan.
  - Implemented centralized `src/services/storageService.js` with client-side WebP canvas compression (`optimizeImage`), sanitized path generation, and direct Cloud Storage uploads (`uploadImageToStorage`, `uploadMultipleImagesToStorage`, `deleteImageFromStorage`).
  - Rewired `adminProductService.js` (`uploadProductImage`, `uploadMultipleProductImages`) to upload compressed product images to `products/` in Cloud Storage and persist public HTTPS download URLs instead of large base64 strings in Firestore documents.
  - Rewired `goatService.js` (`uploadGoatPartImage`) to upload cut photos to `goat/` in Cloud Storage.
  - Added banner image file upload control in `AdminCMS.jsx` (`HeroEditor`) uploading directly to `cms/` in Cloud Storage.
  - Hardened `storage.rules` with MIME-type checks (`image/*`) and file size limits (< 15MB) across `products/`, `goat/`, `cms/`, `categories/`, and `uploads/`.
  - Configured `src/firebase/config.js` with `daalbhat-grocery.firebasestorage.app` storage bucket fallback.

- **Customized Grocery Management Console & Backend Product Insertion (`/admin/customized-grocery`)**:
  - Built `customizedGroceryService.js` managing Firestore collection `customizedGrocery` with starter staple auto-seeding and offline `localStorage` fallback (`daalbhat_customized_grocery_items`).
  - Created `InsertGroceryProductModal.jsx` allowing store admins to search, filter, and insert products from the store backend catalog (`products`) directly into Customized Grocery with custom per-adult monthly rations, units (kg, L, pcs, g, pack), and diet suitability flags.
  - Created `EditGroceryItemModal.jsx` for tuning existing consumption formulas, prices, and dietary tags.
  - Built `AdminCustomizedGrocery.jsx` management console with KPI metric cards (Total Configured, Active, Paused, Average Price), live search, multi-filter pills (Diet, Category, Status), 1-click active/paused toggle switches, and reset to defaults.
  - Added "Custom Grocery" navigation tab with `Salad` icon in `AdminLayout.jsx` and registered `/admin/customized-grocery` in `App.jsx`.
  - Added "Custom Grocery" metric card in `AdminDashboard.jsx`.
  - Rewired customer-side `groceryEstimateService.js` to dynamically compute estimates from admin-configured products and updated `GroceryEstimate.jsx` to display product thumbnails and add real store products (`productId`) directly to the cart.
- **Admin Feature Toggles for Goat Booking & Order from Nepal (Matching Festival Sale Pattern)**:
  - Built `storeFeaturesService.js` connecting Cloud Firestore `settings/storeFeatures` document with local fallback (`daalbhat_mock_store_features`) and cross-tab/window event notifications (`daalbhat:features-updated`).
  - Created `useStoreFeatures` hook providing reactive access to `goatBookingActive`, `nepalOrderActive`, and toggle functions.
  - Added **"Service & Feature Toggles"** quick control bar on `AdminDashboard.jsx` allowing 1-click activation/deactivation of Goat Booking, Order from Nepal, and Festival Sale directly from the main admin screen.
  - Streamlined `AdminGoatStock.jsx` & `AdminNepalOrders.jsx`: Unified the header activation controls into a single toggle button, and removed the deactivated notice banners.
  - Integrated storefront visibility control: Hides "Book a Goat" from `Navbar.jsx` (desktop and mobile) and "Order from Nepal" from `CategoryBar.jsx` and `FloatingOrderButton.jsx` when deactivated.
  - Added friendly "Service Temporarily Paused/Closed" notices on `/book-goat` (`BookGoat.jsx`) and `/order-from-nepal` (`OrderFromNepal.jsx`) if accessed directly via URL while deactivated.
- **Delivery Availability Modal On Every Reload**:
  - Removed session restriction in `DeliveryAvailabilityModal.jsx` so the modal displays consistently on every visit/reload for customer clarity.
- **Goat Stock Cut Photo Uploads (`/admin/goat-stock` & `/book-goat`)**:
  - Added WebP client-side image compression (`uploadGoatPartImage` in `goatService.js`) and upload file control in `GoatPartModal`.
  - Added live cut photo thumbnail previews in the admin cuts table and prioritized uploaded photos on `/book-goat`.
- **Multiple Product Image Uploads & Customer Gallery Viewer**:
  - Added `uploadMultipleProductImages` parallel batch compressor in `adminProductService.js`.
  - Upgraded `ProductFormModal.jsx` with multi-image file uploads, thumbnail management grid, 1-click **"⭐ Set as Primary / Cover"**, individual image deletion, and URL addition.
  - Upgraded `ProductDetails.jsx` with interactive multi-image viewer, left/right arrow navigators, index indicators, and responsive thumbnail gallery selector.
  - Updated `images.js` (`getProductImage`) to support `images: string[]` seamlessly with backwards compatibility.
- **Admin Products Table Pagination & Multi-Filter Console (`/admin/products`)**:
  - Implemented pagination system on the admin products console with dynamic page size selector (10, 20, 50, 100 per page).
  - Added category filter dropdown and stock availability filter (`All`, `In Stock Only`, `Out of Stock Only`).
  - Added responsive pagination footer with item range counter (`Showing 1 to 10 of 48 products`) and `<Pagination />` page controls.
  - Automatically resets to page 1 upon search or filter change.
- **Festival Sale Campaign Icon / Favicon Selector**:
  - Created reusable `FestiveIcon.jsx` component supporting both vector Lucide icons (`Flame` for Diya/Tihar, `PartyPopper` for Dashain, `Sparkles`, `Zap`, `Gift`, `ShoppingBag`, `Tag`, `Percent`, `Star`) and festival emojis (`🪔`, `🎉`, `🎆`, `⚡`, `🎁`, `🛍️`, `🪅`, `✨`, `🏮`, `🥩`).
  - Integrated interactive Vector Favicon picker in `AdminFestivalSale.jsx` with active ring indicator and custom write-in fallback.
  - Synchronized vector icons in customer banner badge (`FestivalSale.jsx`).
- **Product Card Navigation Button Enhancement**:
  - Replaced the direct "Add to Cart" (+) button on landing page and catalog product cards (`ProductCard.jsx`, `FestivalSale.jsx`, `ProductListItem.jsx`) with a sleek arrow (`ArrowRight` / `>`) link that navigates users directly to the full Product Details page (`/product/${product.id}`).
- **Festival Sale Admin Console & Dynamic Countdown/Product Management (`/admin/festival-sale`)**:
  - Built `festivalSaleService.js` connecting Cloud Firestore `settings/festivalSale` document with automatic default seeding and offline `localStorage` fallback.
  - Built `AdminFestivalSale.jsx` admin console:
    - Master Active / Inactive switch.
    - End date & time picker (`datetime-local`) with live countdown preview.
    - Quick date presets (+24 Hours, +3 Days, +7 Days, +14 Days, End of Month).
    - Festival Title, Emoji picker, Discount Tag, and Subtitle customizer.
    - Interactive Product Selector with category filter, search bar, and 1-click **"In Festival Sale" / "Add to Sale"** toggles.
    - Bulk actions ("Add All Filtered", "Remove All Filtered").
  - Added navigation item in `AdminLayout.jsx` with `PartyPopper` icon and registered route `/admin/festival-sale` in `App.jsx`.
  - Added live Festival Sale metric card in `AdminDashboard.jsx`.
  - Updated `FestivalSale.jsx` homepage carousel to dynamically fetch Firestore configuration.
- **Delivery Availability Pop-Up & Dynamic Delivery Zones Console (`/admin/delivery-zones`)**:
  - Implemented `deliveryService.js` and `adminDeliveryService.js` connecting Cloud Firestore `deliveryZones` collection with automatic fallback to `src/data/deliveryZones.js` and `localStorage`.
  - Built `DeliveryAvailabilityModal.jsx` site visit pop-up:
    - Automatically displays 400ms after user visits the site.
    - Smart Session Persistence: remembers user dismissal via `sessionStorage` (`daalbhat_delivery_modal_seen`) so it only pops up once per browser session.
    - Dynamically displays live eligible postal code chips loaded from Firestore.
    - Accessible dialog with Escape key handling, backdrop dismiss, and body scroll lock.
  - Built `AdminDeliveryZones.jsx` admin console:
    - Full overview of active delivery areas, postal code counts, and delivery fees.
    - 1-click postal code management (add single or multiple comma-separated postcodes, instant chip removal).
    - Create / Edit Delivery Zone modal with custom pricing tiers, delivery days, delivery time windows, and highlight toggle.
    - Reset to Defaults action with batch restoration.
  - Added navigation item in `AdminLayout.jsx` and registered route `/admin/delivery-zones` in `App.jsx`.
  - Connected `DeliveryInformation.jsx` and `PostcodeCheck.jsx` to dynamically fetch live zones and postcodes from `deliveryService.getDeliveryZones()`.
  - Added `deliveryZones` rules in `firestore.rules` and updated `scripts/seedFirestore.js`.
- **Goat Stock Management & Availability Console (`/admin/goat-stock`)**:
  - Implemented `goatService.js` for managing goat cuts and inventory in Firestore `goatParts` collection with automatic initial seeding and offline `localStorage` fallback.
  - Built `AdminGoatStock.jsx` admin console supporting:
    - 1-click **In Stock / Out of Stock** availability toggles for each cut.
    - Category filtering (Primal Cuts, Organs, Specialty Cuts) and stock status filtering (All, In Stock, Out of Stock).
    - Summary metrics for Total Cuts, Live In-Stock Cuts, Out-of-Stock Cuts, and Average Price per kg.
    - Add New Custom Goat Cut modal and Reset to Default Cuts restoration.
    - Bulk availability actions ("Set All In Stock", "Set All Out of Stock").
  - Connected `BookGoat.jsx` to dynamically fetch live parts via `getAvailableGoatParts()`.
  - **Frontend Out-of-Stock Filter**: Out of stock cuts are strictly **hidden** from the customer-facing `/book-goat` page so customers only view and select available stock.
  - Added navigation item in `AdminLayout.jsx` and registered route `/admin/goat-stock` in `App.jsx`.
  - Added live goat cuts metric widget to `AdminDashboard.jsx`.
- **Half Price (50% Off) Product Pricing Option**:
  - Added dedicated **"Half Price (50% Off)"** option and 1-click **"⚡ Apply Half Price Now"** action in `ProductFormModal.jsx`.
  - Automatically captures previous price in `oldPrice` and halves `price` upon activation (or restores original price when deactivated).
  - Added 1-click 50% Off toggle and `"50% Off"` badge in `AdminProducts.jsx` table.
  - Added `"50% OFF"` badge display on customer product cards (`ProductCard.jsx`, `ProductListItem.jsx`, `ProductDetails.jsx`).
- **Nepal Orders Records Console & Automated Email System**:
  - Implemented `nepalOrderService.js` to manage Firestore `nepalOrders` collection with offline `localStorage` fallback.
  - Connected `OrderFromNepal.jsx` to create order records seamlessly upon submission without altering the existing frontend UI.
  - Built `AdminNepalOrders.jsx` admin console for managing all custom Nepal delivery requests, supporting status filtering (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`), customer contact tracking, and requested items breakdown.
  - Added dedicated route `/admin/nepal-orders` and navigation link in `AdminLayout.jsx`.
  - Added Nepal Orders metric card in `AdminDashboard.jsx`.
  - Integrated automated customer email notifications (`sendNepalOrderConfirmationEmail` and `sendNepalOrderStatusEmail`) into `mailService.js` powered by the existing EmailJS and Firestore `mail` pipeline.
  - Added Nepal Order notification template definitions in `adminTemplateService.js` and placeholder support in `AdminTemplates.jsx`.
- **Full Native Firebase Migration**:
  - Replaced AWS Lightsail containerized deployment with serverless **Firebase Hosting**, **Cloud Firestore**, **Firebase Authentication**, and **Firebase Cloud Storage**.
  - Configured `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules`, and `firestore.indexes.json`.
  - Added `src/firebase/config.js` with client SDK initialization and environment variable support.
- **Firebase Auth & State Management**:
  - Refactored `authService.js` and `AuthContext.jsx` to use Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `loginWithGoogle`, `signOut`, `sendPasswordResetEmail`).
  - Added **Google Sign-In (Gmail)** with `signInWithPopup` on both Login and Register pages.
  - Integrated Firestore `users/{uid}` collection to store extended profile fields (`role`, `phone`, `blocked`, `addresses`).
  - Streamlined `ForgotPassword.jsx` to trigger Firebase password reset emails.
- **100% Free Spark Plan Compatibility**:
  - Engineered the entire architecture to run within Firebase's free **Spark Plan** without requiring the Blaze plan or credit card.
  - Added client-side WebP image compression in `adminProductService.js` to store optimized product images directly in Firestore as lightweight Data URLs if Cloud Storage is not provisioned.
- **Firestore Catalog & Order Services**:
  - Updated `productService.js` and `adminProductService.js` to query/mutate Firestore `products` collection.
  - Implemented product image uploads directly to Firebase Storage (`adminProductService.js`).
  - Updated `categoryService.js` and `adminCategoryService.js` to interact with Firestore `categories`.
  - Refactored `orderService.js` to store customer orders in Firestore `orders` collection with order tracking and history.
  - Refactored `couponService.js` to read/write Firestore `coupons`.
  - Enhanced `groceryEstimateService.js` with client-side staple calculation algorithm.
- **Serverless Email Notification System & Admin Sender Selection**:
  - Created `src/services/mailService.js` supporting dynamic client-side transactional emails (order confirmations & delivery status updates).
  - Integrated `@emailjs/browser` for free serverless inbox delivery.
  - Added **Admin Sender Email Settings** in `AdminTemplates.jsx` to let the store manager select/customize which sender email (`orders@daalbhat.com`, `support@daalbhat.com`, custom Gmail) appears on customer emails.
- **Customize Grocery Storefront Toggle & Master Controls**:
  - Integrated `customizeGroceryActive` toggle flag into Firestore `settings/storeFeatures` via `storeFeaturesService.js` and `useStoreFeatures.js`.
  - Added 4th card in `AdminDashboard.jsx` Service & Feature Toggles grid for 1-click active/deactivate control with real-time toast feedback.
  - Conditionally hidden "Customize Grocery" button on `Navbar.jsx` (desktop and mobile) when deactivated.
  - Added friendly "Customize Grocery is Temporarily Paused" screen on `GroceryEstimate.jsx` for direct visitors when deactivated.
  - Added **Recommended Products** section directly below the estimated grocery list on `GroceryEstimate.jsx` featuring store products with smart duplicate filtering against calculated staples, prioritized ranking (featured/bestseller/discount), and direct cart integration.
- **Admin Festival Sale Catalog Pagination**:
  - Implemented pagination controls in `AdminFestivalSale.jsx` with selectable items-per-page (10, 20, 50, 100), item range counter ("Showing X–Y of Z products"), and dynamic page switching.
  - Enhanced `Pagination.jsx` component with `className` support and smart windowed ellipses for scalable page navigation.
  - Automatically resets to Page 1 upon searching or changing category/status filters.
- **Codebase Cleanup & Legacy Decommissioning**:
  - Completely removed legacy containerization files (`Dockerfile`, `docker-compose.yml`, `nginx.conf`, `cookies.txt`).
  - Purged obsolete legacy Express/Prisma `backend/` directory and unlinked container scripts (`dev:db`, `dev:backend`, `dev:all`) from `package.json`.
  - Removed unused `concurrently` dependency.
  - Verified 100% clean standalone serverless Firebase architecture with zero lint errors and rapid sub-second build times.
- **Percentage-Wise Product Discounts & Storefront Badges**:
  - Engineered centralized utility `src/utils/discount.js` with bidirectional calculation (`getDiscountPercent`, `calculateDiscountedPrice`, `calculateDiscountPercent`).
  - Upgraded `ProductFormModal.jsx` with a 3-column pricing grid (`Selling Price`, `Regular / Old Price`, `Discount (% OFF)`), quick percentage presets (`10%`, `15%`, `20%`, `25%`, `30%`, `40%`, `50%`, `Clear`), and real-time customer savings calculations.
  - Upgraded `AdminProducts.jsx` product table with dynamic percentage off badges (`-X% OFF`), strikethrough original prices, inline quick discount select dropdowns in the action column, and a new `On Sale (% Off)` filter.
  - Upgraded `ProductCard.jsx`, `ProductListItem.jsx`, and `ProductDetails.jsx` to dynamically display `{discountPercent}% OFF` badges (replacing static "Sale" tags) whenever a percentage discount applies.
  - Added rich savings callout badge on `ProductDetails.jsx` showing `⚡ Save X% ($Y.YY off)`.
  - Updated `LatestProductsPanel.jsx`, `FestivalSale.jsx`, `AdminFestivalSale.jsx`, `Offers.jsx`, and `productService.js` to seamlessly support percentage discounts and `discountOnly` filtering.

---

## 5. Active & Upcoming Task List

### Phase 1: Native Firebase Setup & Service Layer (Completed)
- [x] Configure Firebase tools (`firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules`).
- [x] Integrate Firebase Web SDK in `src/firebase/config.js`.
- [x] Refactor `authService.js` & `AuthContext.jsx` for Firebase Auth + Firestore user profiles.
- [x] Refactor `productService.js`, `adminProductService.js`, `categoryService.js`, `orderService.js`, and `couponService.js` to Cloud Firestore.
- [x] Implement image uploads with client WebP compression fallback.
- [x] Create Firestore database seeding script (`scripts/seedFirestore.js`).

### Phase 2: Email System, Google Auth & Admin Controls (Completed)
- [x] Add Google Sign-in (Gmail) to Login and Register views.
- [x] Implement serverless email dispatch service (`mailService.js`) with Firestore `mail` trigger queue and EmailJS parameter mapping.
- [x] Add dynamic email status subjects and headers (`Order Confirmed #ORD-xxx!`, `Order Shipped #ORD-xxx!`, `Order Delivered #ORD-xxx!`).
- [x] Add Admin Sender Email selection in `AdminTemplates.jsx`.
- [x] Trigger delivery status update emails in `AdminOrders.jsx`.
- [x] Trigger order confirmation emails in `orderService.js`.
- [x] Upgrade Customer Order History (`Account.jsx`) with rich product thumbnails, names, item prices, subtotal/discount breakdown, and delivery addresses.
- [x] Add lazy module auto-recovery with retry in `App.jsx` to eliminate stale deployment MIME errors.
- [x] Deploy Forgot Password configuration.
- [x] Clean development errors and map user-friendly auth errors.

### Phase 3: Nepal Orders Records & Messaging (Completed)
- [x] Create `nepalOrderService.js` for Firestore `nepalOrders` collection management.
- [x] Wire `OrderFromNepal.jsx` form submission to create orders without UI changes.
- [x] Create `AdminNepalOrders.jsx` records console with status filtering and item detail expansion.
- [x] Add Nepal Orders navigation route in `AdminLayout.jsx` and `App.jsx`.
- [x] Add Nepal Orders metric card in `AdminDashboard.jsx`.
- [x] Integrate automated email confirmation and status update triggers in `mailService.js`.
- [x] Build verification (`npm run build`).
- [x] Linter checks (`npm run lint` - 0 Errors).
- [x] Offline fallback verification.
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore.

### Phase 4: Goat Stock Management & Half Price System (Completed)
- [x] Create `goatService.js` with Firestore collection `goatParts` & offline fallback.
- [x] Create `AdminGoatStock.jsx` stock management console with 1-click availability toggles and price editing.
- [x] Add Goat Stock route (`/admin/goat-stock`) and navigation tab in `AdminLayout.jsx` and `App.jsx`.
- [x] Update `BookGoat.jsx` to dynamically load live available parts and completely hide out-of-stock cuts.
- [x] Add Half Price (50% Off) option and 1-click calculation in `ProductFormModal.jsx`.
- [x] Add 1-click Half Price toggle and 50% Off badge in `AdminProducts.jsx`.
- [x] Display 50% OFF badge in `ProductCard.jsx`, `ProductListItem.jsx`, and `ProductDetails.jsx`.
- [x] Add Goat Stock metric summary card in `AdminDashboard.jsx`.
- [x] Display included combo deal items without individual prices with redirect navigation in `ProductDetails.jsx`.
- [x] Add `goatParts` security rules in `firestore.rules`.
- [x] Validate build (`npm run build`) and lint (`npm run lint` - 0 Errors).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 5: Delivery Availability Pop-Up & Delivery Zones Management (Completed)
- [x] Implement `deliveryService.js` & `adminDeliveryService.js` connecting Firestore `deliveryZones` collection with automatic fallback.
- [x] Create `DeliveryAvailabilityModal.jsx` site visit pop-up with `sessionStorage` persistence (`daalbhat_delivery_modal_seen`).
- [x] Mount `DeliveryAvailabilityModal` in `Layout.jsx` with `@keyframes modal-fade` and `@keyframes modal-pop` in `index.css`.
- [x] Create `AdminDeliveryZones.jsx` admin console for dynamic postal code and zone management.
- [x] Add Delivery Zones route (`/admin/delivery-zones`) and navigation tab with `Truck` icon in `AdminLayout.jsx` and `App.jsx`.
- [x] Connect `DeliveryInformation.jsx` and `PostcodeCheck.jsx` to dynamic `getDeliveryZones()`.
- [x] Add `deliveryZones` security rules to `firestore.rules`.
- [x] Update Firestore seeding script (`scripts/seedFirestore.js`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 6: Festival Sale Admin Panel & Dynamic Timing/Catalog Management (Completed)
- [x] Create `festivalSaleService.js` for Firestore `settings/festivalSale` document management with auto-seeding and offline fallback.
- [x] Create `AdminFestivalSale.jsx` admin console with live countdown preview, end date presets (+24h, +3d, +7d, +14d, End of Month), and banner customizer.
- [x] Build 1-click product festival sale catalog management with search, category filtering, and bulk add/remove actions.
- [x] Add Festival Sale route (`/admin/festival-sale`) and navigation tab with `PartyPopper` icon in `AdminLayout.jsx` and `App.jsx`.
- [x] Add Festival Sale metric card in `AdminDashboard.jsx`.
- [x] Update `FestivalSale.jsx` homepage component to dynamically load Firestore configuration and assigned products.
- [x] Update product card action buttons to navigate directly with arrow (`>`) icon.
- [x] Validate build (`npm run build`) and lint (`npm run lint`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 7: Dynamic Site Content Management System (CMS) & Policy Editors (Completed)
- [x] Create `contentService.js` supporting dual Firestore (`content/{docId}`) + local fallback architecture with live cross-component sync event dispatching.
- [x] Build unified `AdminCMS.jsx` management console featuring 10 dedicated content editors:
  - 🌟 **Hero Carousel**: Add/edit/remove slides, eyebrow badges, headlines, subtitles, image URLs with preset selector, and primary/secondary CTA links.
  - 🏢 **Global Footer**: Brand name, tagline/bio, direct support contacts (phone, email, address), copyright text, and social media handles.
  - 📖 **About Us**: Story overview, core value cards, and bottom CTA banner.
  - 📞 **Contact Us**: Header text, support operating hours, contact items, and Google Maps embed iframe URL.
  - ❓ **FAQ**: Dynamic question & answer CRUD editor.
  - 🔒 **Privacy Policy**: Title, last updated date, intro disclaimer, and clause sections.
  - 📜 **Terms & Conditions**: Title, last updated date, disclaimer, and clause sections.
  - 🚚 **Delivery Information**: Descriptive notice cards (Same Day Deliveries, Delivery Charges) and footer callout banner.
  - 📦 **Shipping Policy**: Title, last updated date, and shipping clause sections.
  - 🔄 **Return & Refund Policy**: Title, last updated date, and refund clause sections.
- [x] Update `AdminLayout.jsx` and `App.jsx` with `/admin/cms` route and `Site Content` sidebar navigation.
- [x] Wire all customer frontend pages (`Home.jsx`, `Footer.jsx`, `About.jsx`, `Contact.jsx`, `FAQ.jsx`, `PrivacyPolicy.jsx`, `Terms.jsx`, `DeliveryInformation.jsx`, `ShippingPolicy.jsx`, `ReturnPolicy.jsx`) to `contentService` with instantaneous state updates.
- [x] Add security rules in `firestore.rules` for `/content/{docId}` allowing public read and admin write.
- [x] Verify zero lint errors (`npm run lint`) and clean production build (`npm run build`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 8: On-Demand Service Toggles for Goat & Nepal Orders (Completed)
- [x] Create `storeFeaturesService.js` connecting Firestore `settings/storeFeatures` with localStorage fallback.
- [x] Create reactive `useStoreFeatures.js` hook with window event synchronization.
- [x] Add **"Service & Feature Toggles"** quick control card on `AdminDashboard.jsx` for 1-click toggling with toast feedback.
- [x] Streamline `AdminGoatStock.jsx` & `AdminNepalOrders.jsx`: Replace dual switch+button with single unified toggle button, and remove deactivated warning banners.
- [x] Conditionally hide "Book a Goat" from `Navbar.jsx` (desktop and mobile) when deactivated.
- [x] Conditionally hide "Order from Nepal" from `CategoryBar.jsx` and `FloatingOrderButton.jsx` when deactivated.
- [x] Add polite "Service Temporarily Closed / Paused" notice screens for direct visitors on `BookGoat.jsx` and `OrderFromNepal.jsx`.
- [x] Verify zero lint errors (`npm run lint`) and clean production build (`npm run build`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 9: Admin Customized Grocery Planning & Product Catalog Integration (Completed)
- [x] Create `customizedGroceryService.js` connecting Cloud Firestore `customizedGrocery` collection with default starter catalog and local fallback.
- [x] Create `InsertGroceryProductModal.jsx` for selecting and configuring store products from backend `products`.
- [x] Create `EditGroceryItemModal.jsx` for updating monthly rations, diets, prices, and dietary tags.
- [x] Build `AdminCustomizedGrocery.jsx` management console with KPI metrics, live search, multi-filters, active status toggling, and reset defaults.
- [x] Add Custom Grocery route (`/admin/customized-grocery`) and navigation tab with `Salad` icon in `AdminLayout.jsx` and `App.jsx`.
- [x] Add Custom Grocery metric card in `AdminDashboard.jsx`.
- [x] Connect `groceryEstimateService.js` and `GroceryEstimate.jsx` to live admin-configured products with thumbnail rendering and direct cart integration.
- [x] Add `customizedGrocery` security rules to `firestore.rules`.
- [x] Verify zero lint errors (`npm run lint`) and clean production build (`npm run build`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 10: Master Controls & Storefront Toggle for Customize Grocery (Completed)
- [x] Extend `storeFeaturesService.js` and `useStoreFeatures.js` with `customizeGroceryActive` flag and `toggleCustomizeGrocery`.
- [x] Update `AdminDashboard.jsx` Service & Feature Toggles grid to 4 columns (`grid sm:grid-cols-2 lg:grid-cols-4 gap-4`) and add Customize Grocery toggle card.
- [x] Add single unified toggle button to `AdminCustomizedGrocery.jsx` header with live status indication.
- [x] Conditionally hide "Customize Grocery" button on `Navbar.jsx` (both desktop and mobile navigation) when deactivated.
- [x] Add polite "Service Temporarily Paused" screen for direct visitors in `GroceryEstimate.jsx`.
- [x] Add **Recommended Products** section below the grocery list in `GroceryEstimate.jsx` with automatic deduplication against estimated items and dynamic store suggestions.
- [x] Add dynamic pagination, items-per-page selector, and windowed page navigation to `AdminFestivalSale.jsx`.
- [x] Verify zero lint errors (`npm run lint`) and clean production build (`npm run build`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 11: Codebase Cleanup & Legacy Docker Decommissioning (Completed)
- [x] Remove root `Dockerfile`, `docker-compose.yml`, `nginx.conf`, and `cookies.txt`.
- [x] Delete legacy Express/Prisma `backend/` folder and dependencies.
- [x] Clean up `package.json` scripts (`dev:db`, `dev:backend`, `dev:all`) and remove `concurrently`.
- [x] Validate build (`npm run build`) and lint (`npm run lint`).
- [x] Production deployment to Firebase Hosting (`https://daalbhat-grocery.web.app`) and Cloud Firestore rules.

### Phase 12: Percentage-Wise Product Discounts & Storefront Badges (Completed)
- [x] Create centralized discount calculation utility (`src/utils/discount.js`) with `getDiscountPercent`, `calculateDiscountedPrice`, and `calculateDiscountPercent`.
- [x] Upgrade `ProductFormModal.jsx` with 3-column pricing inputs (`Selling Price`, `Regular / Old Price`, `Discount (% OFF)`).
- [x] Add 1-click Quick Percentage Presets (`10%`, `15%`, `20%`, `25%`, `30%`, `40%`, `50%`, `Clear`) and real-time customer savings breakdown in `ProductFormModal.jsx`.
- [x] Upgrade `AdminProducts.jsx` product table with dynamic `-X% OFF` badges, strikethrough original prices, and an inline quick percentage discount dropdown.
- [x] Add "On Sale (% Off)" filter to `AdminProducts.jsx` filter bar.
- [x] Upgrade `ProductCard.jsx`, `ProductListItem.jsx`, and `ProductDetails.jsx` to dynamically render `{discountPercent}% OFF` badges instead of generic "Sale" badges.
- [x] Add savings callout badge (`⚡ Save X% ($Y.YY off)`) in `ProductDetails.jsx`.
- [x] Update `LatestProductsPanel.jsx`, `FestivalSale.jsx`, `AdminFestivalSale.jsx`, `Offers.jsx`, and `productService.js` to calculate and filter by percentage discounts.
- [x] Validate production build (`npm run build`) and zero-error lint check (`npm run lint`).

### Phase 13: Firebase Cloud Storage Architecture on Blaze Plan (Completed)
- [x] Create centralized Firebase Storage service (`src/services/storageService.js`) with client-side WebP compression (`optimizeImage`), sanitized path generation, and direct Cloud Storage uploads.
- [x] Rewire `adminProductService.js` (`uploadProductImage`, `uploadMultipleProductImages`) to upload directly to `products/` folder in Firebase Storage and store public HTTPS download URLs instead of bloated base64 strings in Firestore.
- [x] Rewire `goatService.js` (`uploadGoatPartImage`) to upload cut photos to `goat/` in Firebase Storage.
- [x] Add banner image file upload control in `AdminCMS.jsx` (`HeroEditor`) uploading directly to `cms/` in Firebase Storage.
- [x] Update `storage.rules` with MIME-type (`image/*`) and size constraints (< 15MB) for all media directories.
- [x] Set default `storageBucket` fallback in `src/firebase/config.js` to `daalbhat-grocery.firebasestorage.app`.
- [x] Verify production build (`npm run build`).

### Phase 14: Production Security Hardening & Zero-Trust Rules (Completed)
- [x] Harden `firestore.rules` against privilege escalation: prevent self-assigning `admin` during user registration (`isValidUserCreate`) and protect immutable profile fields (`isValidUserUpdate`).
- [x] Add schema validation and payload size limits for `orders`, `contactMessages`, `nepalOrders`, and `mail` collections.
- [x] Add explicit default-deny rule (`match /{document=**} { allow read, write: if false; }`) in `firestore.rules`.
- [x] Harden `storage.rules`: restrict uploads to authenticated users with image MIME types (`image/*`), size bounds (< 15MB), and default-deny catch-all.
- [x] Lock down `cors.json` to production domain `https://dalbhat.com.au`, `https://www.dalbhat.com.au`, and official Firebase hosting domains.
- [x] Add HTTP security headers in `firebase.json` (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`).
- [x] Verify production build (`npm run build`) and zero-error lint check (`npm run lint`).

### Phase 15: Comprehensive Security Audit & Deep Production Hardening (Completed)
- [x] Complete security audit across Firestore rules, Cloud Storage rules, Auth, API client, and HTTP headers.
- [x] Produce formal security audit report, prioritized implementation plan, and end-to-end manual testing runbook (`security_audit_and_implementation_plan.md`).
- [x] Fix Cloud Storage vulnerability by restricting uploads and deletes to administrators (`storage.rules`).
- [x] Fix Firestore catalog deletion denial-of-service for products, categories, coupons, and goat parts (`firestore.rules`).
- [x] Secure `/mail` collection against unauthenticated mail relay and update key whitelist for legitimate notifications (`firestore.rules`).
- [x] Align `isValidNepalOrderCreate()` schema to match `nepalOrderService.js` payloads, preventing silent fallback to localStorage (`firestore.rules`).
- [x] Fix coupon validation to support admin flat and percentage coupon structures (`firestore.rules`).
- [x] Lock down `/settings/emailConfig` and sensitive configuration docs from public read access (`firestore.rules`).
- [x] Add mathematical consistency validation to order creation (`firestore.rules`).
- [x] Enable admin bootstrapping rule for initial environment setup (`firestore.rules`).
- [x] Add Content-Security-Policy (CSP) header to `firebase.json`.
- [x] Enhance `OrderFromNepal.jsx` with automatic customer profile prefilling via `useAuth` and mandatory product entry validation.
- [x] Enhance centralized error logging in `src/services/apiClient.js`.
- [x] Validate build (`npm run build`) and lint (`npm run lint`).

### Phase 16: Deep Security Audit, API Check, Auth Hardening & Secret Protection (Completed)
- [x] Audit entire repository, `.env`, `.gitignore`, scripts, and commit history for hardcoded secrets, API tokens, and private credentials.
- [x] Eliminate weak fallback password (`admin123`) in `scripts/seedFirestore.js`; enforce explicit `SEED_ADMIN_PASSWORD` validation.
- [x] Enforce suspended user lockdown across Firestore rules (`isValidOrderCreate`, `isValidNepalOrderCreate`, `isValidContactMessage`, `isValidMailCreate`, `isValidUserUpdate`).
- [x] Enforce customer profile email immutability in `firestore.rules` and set email field to read-only in `Account.jsx` (`ProfileTab`).
- [x] Implement client-side cart tampering defense in `orderService.js` by validating unit prices against authoritative product catalog (`getProductById`) and recalculating totals.
- [x] Gracefully handle Google OAuth providers in `Account.jsx` (`SecurityTab`) with an informational security card.
- [x] Guard administrator self-demotion and self-lockout in `AdminCustomers.jsx`.
- [x] Harden API client (`src/services/apiClient.js`) URL construction and production base URL handling.
- [x] Decouple `create, update` from `delete` in `storage.rules` across all bucket media paths.
- [x] Validate build (`npm run build`) and clean lint check (`npm run lint`).

### Phase 17: Database Backup & Fresh Product Reset Preparation (In Progress)
- [x] Build automated Firestore database export tool (`scripts/backupFirestore.js`).
- [x] Execute live database export: successfully backed up 64 products (`products.json`, 59.0 KB) and all collections to `backups/firestore-backup-2026-10-12T07-25-02-429Z/` and `backups/latest-products-backup.json`.
- [x] Build safe batch cleaner (`scripts/cleanProducts.js`) with admin authentication verification and `--confirm` safety flag.
- [x] Register `npm run db:backup` and `npm run db:clean-products` in `package.json`.
- [ ] Confirm and execute live `products` collection purge once user verification is granted.

### Phase 18: Storage Bucket Image Upload Fix & Full Security Rules Live Deployment (Completed)
- [x] Identify and resolve root cause of storage upload failures in `storage.rules` (removed fragile cross-service Firestore lookups; enforced strict authenticated image MIME/size constraints).
- [x] Update `firebase:deploy` script in `package.json` to include `storage` in deployment target (`--only hosting,firestore:rules,storage`).
- [x] Build production bundle (`npm run build`) and verify 0 lint errors (`npm run lint`).
- [x] Deploy live to Firebase (`daalbhat-grocery.web.app`), releasing `storage.rules`, `firestore.rules`, and updated Hosting site.

### Phase 19: Admin Product Deletion Fix & Mock Database Decoupling (Completed)
- [x] **Authoritative Document ID Preservation**: Fixed ID overwrite bug across `adminProductService.js`, `productService.js`, `adminCategoryService.js`, `categoryService.js`, and `couponService.js`. Firestore document IDs (`d.id`) are now bound strictly after data spreading (`{ ...d.data(), id: d.id, firestoreId: d.id }`), preventing old seed IDs from clobbering Firestore document references.
- [x] **Eliminated Deceptive Empty Collection Fallback**: Removed silent fallback to `store.getEffectiveProducts()` when `snap.empty` is true in `adminProductService.getAllProducts()` and `productService.queryProducts()`. Empty database queries now strictly return `[]` / `{ items: [], total: 0 }`, allowing administrators to wipe or manage clean product catalogs without deleted items reappearing.
- [x] **In-Memory Sort for Query Resiliency**: Changed `getAllProducts()` to fetch `collection(db, "products")` and sort in memory, avoiding silent omission of products lacking `createdAt` fields in Firestore `orderBy` queries.
- [x] **Error Visibility & Action Confirmation in Admin UI**: Stopped swallowing deletion errors in `adminProductService.removeProduct()` and `adminCategoryService.removeCategory()`. Enhanced `AdminProducts.jsx` with window confirmation dialogs, error banner notifications, and explicit deletion failure alerts.
- [x] **Eliminated Automatic Client-Side Database Seeding**: Removed all automatic write operations (`writeBatch`, `setDoc`) that previously pushed local mock data into live Firestore during regular read queries across 6 services:
  - `src/services/deliveryService.js`: Removed auto-seed batch write in `getDeliveryZones()`.
  - `src/services/goatService.js`: Removed auto-seed batch write in `getAllGoatParts()`.
  - `src/services/contentService.js`: Removed auto-seed `setDoc` in `getContent()`.
  - `src/services/storeFeaturesService.js`: Removed auto-seed `setDoc` in `getStoreFeatures()`.
  - `src/services/customizedGroceryService.js`: Removed auto-seed batch write in `getCustomizedGroceryItems()`.
  - `src/services/festivalSaleService.js`: Removed auto-seed `setDoc` in `getFestivalSaleConfig()`.
- [x] Validated production build (`npm run build`) and clean lint check (`npm run lint`).
- [x] Deployed live to Firebase (`https://daalbhat-grocery.web.app`) releasing hosting bundle, security rules, and updated CSP headers.
- [x] Installed Google Search Console ownership verification file (`public/googlee80f34ff984746bc.html`) and HTML verification `<meta>` tag in `index.html`, and deployed to live Firebase Hosting.

---

## 6. How to Keep This Document Updated

> **Rule for AI Agents & Developers**:
> Whenever work is performed in this repository, you **MUST** update this file to reflect:
> 1. Any added, deleted, or relocated files in the **System Architecture & Directory Structure**.
> 2. Recent modifications under **Current Work & Status Tracker**.
> 3. Task status progression (changing `[ ]` to `[x]`) under **Active & Upcoming Task List**.
> 4. Any new environment variables, dependencies, or architectural decisions.

