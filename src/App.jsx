import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Offers from "./pages/Offers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ShippingPolicy from "./pages/ShippingPolicy";
import DeliveryInformation from "./pages/DeliveryInformation";
import ReturnPolicy from "./pages/ReturnPolicy";
import ComingSoon from "./pages/ComingSoon";
import GroceryEstimate from "./pages/GroceryEstimate";
import BookGoat from "./pages/BookGoat";
import OrderFromNepal from "./pages/OrderFromNepal";

// Safe lazy loader that automatically refreshes the page if a new deployment
// has updated chunk hashes, eliminating stale chunk MIME/import errors.
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageRefreshed = JSON.parse(
      window.sessionStorage.getItem("app_chunk_auto_refreshed") || "false"
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem("app_chunk_auto_refreshed", "false");
      return component;
    } catch (error) {
      if (!pageRefreshed) {
        window.sessionStorage.setItem("app_chunk_auto_refreshed", "true");
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}

// Admin panel is code-split with auto-retry
const AdminLayout = lazyWithRetry(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazyWithRetry(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazyWithRetry(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazyWithRetry(() => import("./pages/admin/AdminOrders"));
const AdminNepalOrders = lazyWithRetry(() => import("./pages/admin/AdminNepalOrders"));
const AdminGoatStock = lazyWithRetry(() => import("./pages/admin/AdminGoatStock"));
const AdminFestivalSale = lazyWithRetry(() => import("./pages/admin/AdminFestivalSale"));
const AdminCustomizedGrocery = lazyWithRetry(() => import("./pages/admin/AdminCustomizedGrocery"));
const AdminDeliveryZones = lazyWithRetry(() => import("./pages/admin/AdminDeliveryZones"));
const AdminCustomers = lazyWithRetry(() => import("./pages/admin/AdminCustomers"));
const AdminCoupons = lazyWithRetry(() => import("./pages/admin/AdminCoupons"));
const AdminTemplates = lazyWithRetry(() => import("./pages/admin/AdminTemplates"));
const AdminCMS = lazyWithRetry(() => import("./pages/admin/AdminCMS"));

function AdminFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex justify-center">
      <Loader2 className="animate-spin text-basil-600" size={28} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/delivery-information" element={<DeliveryInformation />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/grocery-estimate" element={<GroceryEstimate />} />
        <Route path="/book-goat" element={<BookGoat />} />
        <Route path="/order-from-nepal" element={<OrderFromNepal />} />

        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<AdminFallback />}><AdminCategories /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense>} />
          <Route path="nepal-orders" element={<Suspense fallback={<AdminFallback />}><AdminNepalOrders /></Suspense>} />
          <Route path="goat-stock" element={<Suspense fallback={<AdminFallback />}><AdminGoatStock /></Suspense>} />
          <Route path="festival-sale" element={<Suspense fallback={<AdminFallback />}><AdminFestivalSale /></Suspense>} />
          <Route path="customized-grocery" element={<Suspense fallback={<AdminFallback />}><AdminCustomizedGrocery /></Suspense>} />
          <Route path="delivery-zones" element={<Suspense fallback={<AdminFallback />}><AdminDeliveryZones /></Suspense>} />
          <Route path="customers" element={<Suspense fallback={<AdminFallback />}><AdminCustomers /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<AdminFallback />}><AdminCoupons /></Suspense>} />
          <Route path="templates" element={<Suspense fallback={<AdminFallback />}><AdminTemplates /></Suspense>} />
          <Route path="cms" element={<Suspense fallback={<AdminFallback />}><AdminCMS /></Suspense>} />
        </Route>

        <Route path="*" element={<ComingSoon title="Page Not Found" />} />
      </Route>
      </Routes>
    </>
  );
}
