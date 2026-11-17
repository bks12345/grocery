import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Package,
  FolderTree,
  Users,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Loader2,
  Globe,
  Beef,
  PartyPopper,
} from "lucide-react";
import * as adminProductService from "../../services/adminProductService";
import * as adminCategoryService from "../../services/adminCategoryService";
import * as authService from "../../services/authService";
import * as orderService from "../../services/orderService";
import * as nepalOrderService from "../../services/nepalOrderService";
import * as goatService from "../../services/goatService";
import { getFestivalSaleConfig } from "../../services/festivalSaleService";
import * as customizedGroceryService from "../../services/customizedGroceryService";

import { useStoreFeatures } from "../../hooks/useStoreFeatures";
import { Power, ArrowRight, Salad } from "lucide-react";

function StatCard({ icon: Icon, label, value, subtext, tone = "basil" }) {
  const toneClasses = {
    basil: "bg-basil-50 text-basil-600",
    mango: "bg-mango-100 text-mango-600",
    tomato: "bg-tomato-100 text-tomato-500",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="card-elevated rounded-3xl p-5 flex flex-col justify-between">
      <div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon size={18} />
        </div>
        <p className="font-display text-2xl font-semibold text-ink mt-3">{value}</p>
        <p className="text-xs text-ink-soft/70 mt-0.5">{label}</p>
      </div>
      {subtext && (
        <div className="mt-2.5 pt-2 border-t border-basil-50 flex items-center justify-between text-[11px]">
          <span className="font-medium text-ink-soft">{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [festivalActive, setFestivalActive] = useState(false);
  const {
    goatBookingActive,
    nepalOrderActive,
    customizeGroceryActive,
    toggleGoat,
    toggleNepal,
    toggleCustomizeGrocery,
  } = useStoreFeatures();

  const showToast = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleGoat = async () => {
    setToggling("goat");
    try {
      const next = !goatBookingActive;
      await toggleGoat(next);
      showToast(next ? "Goat Booking service is now ACTIVE." : "Goat Booking service has been DEACTIVATED.");
    } catch {
      showToast("Failed to update Goat Booking status.", "error");
    } finally {
      setToggling(null);
    }
  };

  const handleToggleNepal = async () => {
    setToggling("nepal");
    try {
      const next = !nepalOrderActive;
      await toggleNepal(next);
      showToast(next ? "Order from Nepal service is now ACTIVE." : "Order from Nepal service has been DEACTIVATED.");
    } catch {
      showToast("Failed to update Order from Nepal status.", "error");
    } finally {
      setToggling(null);
    }
  };

  const handleToggleCustomizeGrocery = async () => {
    setToggling("customizeGrocery");
    try {
      const next = !customizeGroceryActive;
      await toggleCustomizeGrocery(next);
      showToast(next ? "Customize Grocery service is now ACTIVE." : "Customize Grocery service has been DEACTIVATED.");
    } catch {
      showToast("Failed to update Customize Grocery status.", "error");
    } finally {
      setToggling(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      adminProductService.getAllProducts(),
      adminCategoryService.getAllCategories(),
      authService.getAllUsers(),
      orderService.getAllOrders(),
      nepalOrderService.getAllNepalOrders(),
      goatService.getAllGoatParts(),
      getFestivalSaleConfig(),
      customizedGroceryService.getCustomizedGroceryItems(),
    ]).then(([products, categories, users, orders, nepalOrders, goatParts, festivalConfig, customGrocery]) => {
      if (cancelled) return;

      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const outOfStock = products.filter((p) => !p.inStock).length;
      const customers = users.filter((u) => u.role !== "admin");
      const liveGoatCuts = goatParts.filter((p) => p.inStock !== false).length;
      const saleProductsCount = products.filter((p) => p.isFestivalSale || p.onFestivalSale).length;
      const liveCustomGrocery = (customGrocery || []).filter((i) => i.isActive !== false).length;

      setFestivalActive(Boolean(festivalConfig?.active));
      setStats({
        products: products.length,
        categories: categories.length,
        customers: customers.length,
        orders: orders.length,
        nepalOrders: nepalOrders.length,
        goatCuts: `${liveGoatCuts}/${goatParts.length}`,
        festivalSale: festivalConfig?.active ? `${saleProductsCount} Items Active` : "Inactive",
        customGrocery: `${liveCustomGrocery}/${(customGrocery || []).length}`,
        revenue,
        outOfStock,
      });

      // Last 7 days of order volume, oldest first
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const data = days.map((d) => {
        const key = d.toDateString();
        const dayOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === key);
        return {
          day: d.toLocaleDateString(undefined, { weekday: "short" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });
      setChartData(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="card-elevated rounded-3xl p-16 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium flex items-center justify-between transition-all ${
            feedback.type === "error"
              ? "bg-tomato-100 text-tomato-600 border border-tomato-200"
              : "bg-basil-600 text-white shadow-soft"
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Feature & Service Controls (Just like Festival Sale) */}
      <div className="card-elevated rounded-3xl p-6 bg-gradient-to-br from-white via-basil-50/30 to-cream border border-basil-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-basil-100">
          <div>
            <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <Power className="text-basil-600" size={20} />
              Service & Feature Toggles
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              1-click activation to pause or resume customer-facing services across the storefront.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Goat Booking Card */}
          <div className="rounded-2xl p-4 bg-white border border-basil-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-mango-100 text-mango-700 flex items-center justify-center">
                    <Beef size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-ink">Goat Booking</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    goatBookingActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-tomato-100 text-tomato-600"
                  }`}
                >
                  {goatBookingActive ? "Active" : "Deactivated"}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-2">
                Controls the customer-facing /book-goat page and navbar link.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-basil-50 flex items-center justify-between">
              <button
                type="button"
                disabled={toggling === "goat"}
                onClick={handleToggleGoat}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                  goatBookingActive
                    ? "bg-tomato-50 text-tomato-600 hover:bg-tomato-100"
                    : "bg-basil-600 text-white hover:bg-basil-700 hover:shadow-glow"
                }`}
              >
                {toggling === "goat"
                  ? "Saving..."
                  : goatBookingActive
                  ? "Deactivate Goat"
                  : "Activate Goat"}
              </button>
              <Link
                to="/admin/goat-stock"
                className="text-xs font-medium text-ink-soft hover:text-basil-600 flex items-center gap-1"
              >
                Stock <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Order From Nepal Card */}
          <div className="rounded-2xl p-4 bg-white border border-basil-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-ink">Order from Nepal</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    nepalOrderActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-tomato-100 text-tomato-600"
                  }`}
                >
                  {nepalOrderActive ? "Active" : "Deactivated"}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-2">
                Controls Nepal sourcing requests, CategoryBar link, and floating button.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-basil-50 flex items-center justify-between">
              <button
                type="button"
                disabled={toggling === "nepal"}
                onClick={handleToggleNepal}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                  nepalOrderActive
                    ? "bg-tomato-50 text-tomato-600 hover:bg-tomato-100"
                    : "bg-basil-600 text-white hover:bg-basil-700 hover:shadow-glow"
                }`}
              >
                {toggling === "nepal"
                  ? "Saving..."
                  : nepalOrderActive
                  ? "Deactivate Nepal"
                  : "Activate Nepal"}
              </button>
              <Link
                to="/admin/nepal-orders"
                className="text-xs font-medium text-ink-soft hover:text-basil-600 flex items-center gap-1"
              >
                Orders <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Customize Grocery Card */}
          <div className="rounded-2xl p-4 bg-white border border-basil-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-basil-100 text-basil-700 flex items-center justify-center">
                    <Salad size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-ink">Customize Grocery</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    customizeGroceryActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-tomato-100 text-tomato-600"
                  }`}
                >
                  {customizeGroceryActive ? "Active" : "Deactivated"}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-2">
                Controls customer-facing grocery estimator and navbar buttons.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-basil-50 flex items-center justify-between">
              <button
                type="button"
                disabled={toggling === "customizeGrocery"}
                onClick={handleToggleCustomizeGrocery}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                  customizeGroceryActive
                    ? "bg-tomato-50 text-tomato-600 hover:bg-tomato-100"
                    : "bg-basil-600 text-white hover:bg-basil-700 hover:shadow-glow"
                }`}
              >
                {toggling === "customizeGrocery"
                  ? "Saving..."
                  : customizeGroceryActive
                  ? "Deactivate Grocery"
                  : "Activate Grocery"}
              </button>
              <Link
                to="/admin/customized-grocery"
                className="text-xs font-medium text-ink-soft hover:text-basil-600 flex items-center gap-1"
              >
                Planner <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Festival Sale Card */}
          <div className="rounded-2xl p-4 bg-white border border-basil-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-tomato-100 text-tomato-600 flex items-center justify-center">
                    <PartyPopper size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-ink">Festival Sale</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    festivalActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {festivalActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-2">
                Controls the homepage countdown banner and festival sale carousel.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-basil-50 flex items-center justify-between">
              <Link
                to="/admin/festival-sale"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-basil-50 text-basil-700 hover:bg-basil-100 transition-colors"
              >
                Configure Sale
              </Link>
              <Link
                to="/admin/festival-sale"
                className="text-xs font-medium text-ink-soft hover:text-basil-600 flex items-center gap-1"
              >
                Console <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={stats.products} />
        <StatCard icon={FolderTree} label="Total Categories" value={stats.categories} tone="mango" />
        <StatCard icon={Users} label="Total Customers" value={stats.customers} />
        <StatCard icon={ClipboardList} label="Store Orders" value={stats.orders} tone="mango" />
        <StatCard
          icon={Globe}
          label="Nepal Orders"
          value={stats.nepalOrders || 0}
          tone="sky"
          subtext={nepalOrderActive ? "Service: Active 🟢" : "Service: Deactivated 🔴"}
        />
        <StatCard
          icon={Beef}
          label="Goat Cuts Live"
          value={stats.goatCuts}
          tone="basil"
          subtext={goatBookingActive ? "Service: Active 🟢" : "Service: Deactivated 🔴"}
        />
        <StatCard icon={PartyPopper} label="Festival Sale" value={stats.festivalSale} tone="tomato" />
        <StatCard icon={Salad} label="Custom Grocery" value={stats.customGrocery || "0/0"} tone="basil" subtext="Configured Staples" />
        <StatCard icon={DollarSign} label="Sales Revenue" value={`$${stats.revenue}`} />
        <StatCard
          icon={AlertTriangle}
          label="Out of Stock"
          value={stats.outOfStock}
          tone={stats.outOfStock > 0 ? "tomato" : "basil"}
        />
      </div>

      <div className="card-elevated rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Orders — Last 7 Days
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f7f2" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4b564e" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4b564e" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(22,48,31,0.12)" }}
                formatter={(value, name) => [name === "revenue" ? `$${value}` : value, name === "revenue" ? "Revenue" : "Orders"]}
              />
              <Bar dataKey="orders" fill="#2d5f3f" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.outOfStock > 0 && (
        <div className="card-elevated rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-tomato-500 shrink-0" />
            <p className="text-sm text-ink">
              {stats.outOfStock} product{stats.outOfStock !== 1 && "s"} currently out of stock.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            Manage inventory →
          </Link>
        </div>
      )}
    </div>
  );
}
