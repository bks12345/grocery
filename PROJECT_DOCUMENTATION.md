# Project Documentation: Grocery E-Commerce Platform (Daalbhat)

> **Living Document**: This file records the project structure, architectural decisions, ongoing work, and roadmap. It **must be updated** whenever new features, refactorings, or structural changes are made.

---

## 1. Executive Summary & Overview
**Daalbhat / Grocery Platform** is a full-featured e-commerce application designed for local and specialty grocery shopping (including custom features like *Order From Nepal*, *Book Goat*, and *Grocery Estimation*).

It provides:
- **Customer Shopping Experience**: Product browsing, category filtering, cart, wishlist, checkout, order tracking, special offers, and estimates.
- **Admin Dashboard**: Category management, product catalog management, order processing, and discount/coupon configuration.
- **Authentication & User Profiles**: Role-based access for Customers and Administrators.

---

## 2. Tech Stack & Key Dependencies

| Layer / Concern | Technology | Version / Details |
|---|---|---|
| **Frontend Core** | React | `^19.2.7` |
| **Build Tooling** | Vite | `^8.1.1` |
| **Routing** | React Router DOM | `^7.18.1` |
| **Styling** | Tailwind CSS (v4) + PostCSS | `^4.3.2` |
| **Icons & Visuals** | Lucide React, React Icons | `^1.23.0`, `^5.7.0` |
| **Charts** | Recharts | `^3.9.2` |
| **Linting** | Oxlint | `^1.71.0` |

---

## 3. System Architecture & Directory Structure

```
grocery/
├── backend/              # Express API & Prisma ORM backend service
│   ├── prisma/           # Prisma schema, migrations, and seed scripts
│   ├── src/              # Express controllers, routes, and middleware
│   └── Dockerfile        # Dockerfile for Express API service
├── src/
│   ├── assets/           # Static image assets and icons
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin panel components (tables, forms, modals)
│   │   ├── layout/       # Headers, Footers, Navigation layouts
│   │   └── ui/           # Buttons, Badges, Cards, Modals, Inputs
│   ├── context/          # State Context Providers
│   │   ├── AuthContext.jsx       # User auth state & session handling
│   │   ├── CartContext.jsx       # Shopping cart state & local persistence
│   │   └── WishlistContext.jsx   # Favorites & Wishlist state
│   ├── data/             # Static datasets & fallback mock data
│   │   ├── categories.js
│   │   ├── festivalSale.js
│   │   ├── goatParts.js
│   │   ├── images.js
│   │   ├── offers.js
│   │   └── products.js
│   ├── hooks/            # Custom React hooks (useAsync, useCountdown)
│   ├── pages/            # View components / Route destinations
│   │   ├── admin/        # Admin views (Dashboard, Products, Categories, Orders)
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
│   ├── services/         # API Service Layer & Data Providers
│   │   ├── adminCategoryService.js
│   │   ├── adminProductService.js
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── categoryStore.js
│   │   ├── couponService.js
│   │   ├── groceryEstimateService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   └── productStore.js
│   ├── App.jsx           # Main Router & Application shell
│   ├── index.css         # Tailwind & global stylesheet
│   └── main.jsx          # React entry point
├── README.md             # Repository entry point (points to this doc)
├── Dockerfile            # Multi-stage Dockerfile for the Vite frontend (Nginx)
├── docker-compose.yml    # Root orchestrator for AWS Lightsail deployment (Postgres, Backend, Frontend)
├── nginx.conf            # Nginx reverse-proxy and routing configuration
├── package.json          # Node dependencies & scripts
└── vite.config.js        # Vite build configuration
```

---

## 4. Current Work & Status Tracker

### 🟢 Recent Accomplishments & Active Work
- **Developer Experience**:
  - Added `concurrently` to root `package.json`.
  - Created `npm run dev:all` script to start the PostgreSQL database container, the Express backend, and the Vite frontend simultaneously.
- **Image Upload & Compression**:
  - Implemented product image uploads via Admin panel.
  - Added `multer` and `sharp` to the backend to process, resize (max 800px), and compress images to WebP format.
  - Stored optimized images directly in PostgreSQL as Base64 Data URLs to facilitate future migration to Cloudinary.
- **Authentication & Security Enhancements**:
  - Implemented OTP-based password reset flow (Email -> OTP & New Password -> Success).
  - Integrated **Resend API** to send genuine HTML-formatted OTP emails, fully replacing the mock console implementation.
  - Added `/api/auth/reset-password` endpoint with OTP verification and 10-minute expiration handling.
  - Updated frontend `ForgotPassword.jsx` to support multi-step OTP inputs and error handling.
  - Hardened backend security by integrating **Helmet** for HTTP security headers and **express-rate-limit** to protect authentication endpoints from brute-force attacks.
  - Tightened CORS configuration to explicitly whitelist the frontend origin.
  - Enforced authentication on checkout flow: Users are now redirected to the Login page when attempting to proceed to checkout from the cart, and the `POST /api/orders` backend route is now strictly protected.
- **Order Email Notifications**:
  - Created centralized `backend/src/utils/mailer.js` utility using Resend.
  - Implemented automatic **Order Confirmation** (to user) and **New Order Notification** (to admin) on order placement in `orders.js`.
  - Implemented automatic **Status Update** emails (to user) when an admin changes order status in `admin.js`.
  - Added robust fallback mechanism to print `[MOCK EMAIL FALLBACK]` in the backend terminal if the Resend API rejects emails due to free-tier restrictions.
  - Added `email` collection field to guest checkout in `Checkout.jsx`.
  - Added **Dynamic Email Templates** in the admin dashboard. Admins can now configure the subject and HTML body for OTPs, Order Confirmations, and Status Updates directly from the DB, with variables like `{{orderId}}` and `{{otp}}` being injected dynamically.
- **Full Backend Integration & Feature Endpoints**:
  - Initialized PostgreSQL with Prisma, seeded full mock catalog.
  - Implemented missing backend APIs for `ContactMessage`, `NepalOrder`, `DeliveryZone`, and `GroceryEstimate`.
  - Added robust search and filtering endpoint logic in `products.js`.
  - Fully integrated dynamic cart logic with the backend `Order` and `OrderItem` models.
  - Replaced local storage mock services in frontend with live `apiClient` calls.
  - **Coupon Checkout Integration**: Updated cart and checkout flow to correctly calculate and track coupon discounts. `backend/src/routes/orders.js` now implements **Secure Backend Order Calculation**—it completely ignores client-provided prices, subtotals, and totals, recalculating everything from scratch using actual database prices to prevent payload spoofing. The final computed `discount` and `couponCode` are persisted in the database.
- **Production-Grade Authentication & Database UI**:
  - Refactored backend to use secure, HTTP-only, `SameSite=Strict` cookies instead of localStorage for JWT tokens.
  - Added dedicated `/api/auth/admin-login` for strict role-checking on admin portals.
  - Enhanced Admin User Management to allow blocking/unblocking users and promoting/demoting admins directly from the dashboard.
- **AWS Lightsail Containerization**:
  - Created Dockerfiles for the Node.js backend and the Vite frontend (served via Nginx).
  - Consolidated deployment architecture by moving `docker-compose.yml` to the root repository.
  - Configured a single-server deployment strategy suitable for AWS Lightsail, combining `postgres`, `backend`, and `frontend` services into one compose configuration.
- **Backend Directory Consolidation**:
  - Relocated `backend` service directory into `grocery/backend` to consolidate project architecture within a single repository structure.
- **API Service Layer Refactoring & Resilient Hybrid Architecture**:
  - `apiClient.js`: Configured `credentials: "include"` and removed manual localStorage token headers.
  - `authService.js`: Replaced all local mock storage logic with strict backend verification and `/api/auth/logout`.
  - `productService.js` & `categoryService.js`: Enhanced catalog queries to call REST endpoints with automated `productStore`/`categoryStore` local fallback when the API is offline.
  - `adminProductService.js` & `adminCategoryService.js`: Connected admin CRUD methods (`getAll`, `create`, `edit`, `remove`) to `/api/admin/*` with local store sync.
  - `orderService.js`: Built complete order checkout and status management calls (`placeOrder`, `getOrderHistory`, `updateOrderStatus`) with local fallback storage.
  - `couponService.js`: Updated coupon validation and admin discount management (`validateCoupon`, `getActiveCoupons`, `createCoupon`) with default fallback coupons.
  - `groceryEstimateService.js`: Integrated `/api/grocery-estimate` endpoint with 30-day staple estimation fallback algorithm.
  - `AuthContext.jsx`: Upgraded session hydration to use `/api/auth/me` and securely maintain session state without localStorage.

---

## 5. Active & Upcoming Task List

### Phase 1: API Service Standardization & Verification (Completed)
- [x] Standardize `apiClient.js` for base configuration, token handling, and `apiPut`.
- [x] Refactor `authService.js` & `AuthContext.jsx` for clean authentication workflows.
- [x] Refactor customer services (`productService`, `categoryService`, `orderService`, `couponService`, `groceryEstimateService`).
- [x] Refactor admin services (`adminProductService`, `adminCategoryService`).
- [x] Verify error handling, fallback resilience, and response parsing across all service methods.

### Phase 2: UI & Component Integration
- [x] Verify Login/Register forms with live API responses and fallback handling.
- [x] Test Cart and Checkout flows with backend order submission.
- [x] Audit Admin category and product management workflows.
- [x] Test *Grocery Estimate* and *Order From Nepal* workflow integrations.

### Phase 3: Testing & Quality Assurance (Completed)
- [x] Build verification (`npm run build` - Passed clean).
- [x] Linter checks (`npm run lint` - 0 Errors).
- [x] Edge-case validation for offline / disconnected API state (Hybrid fallback verified).

### Phase 4: Repository & Workspace Architecture
- [x] Relocate `backend/` folder inside `grocery/` repository root.

---

## 6. How to Keep This Document Updated

> **Rule for AI Agents & Developers**:
> Whenever work is performed in this repository, you **MUST** update this file to reflect:
> 1. Any added, deleted, or relocated files in the **System Architecture & Directory Structure**.
> 2. Recent modifications under **Current Work & Status Tracker**.
> 3. Task status progression (changing `[ ]` to `[x]`) under **Active & Upcoming Task List**.
> 4. Any new environment variables, dependencies, or architectural decisions.
