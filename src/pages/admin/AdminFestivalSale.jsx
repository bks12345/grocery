import { useState, useEffect } from "react";
import {
  PartyPopper,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Check,
  Plus,
  Save,
  Tag,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { getDiscountPercent } from "../../utils/discount";
import {
  getFestivalSaleConfig,
  updateFestivalSaleConfig,
  toggleProductFestivalSale,
  bulkSetFestivalSale,
} from "../../services/festivalSaleService";
import { queryProducts } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { useCountdown } from "../../hooks/useCountdown";
import { getProductImage, getProductImageFallback } from "../../data/images";
import SafeImage from "../../components/ui/SafeImage";
import FestiveIcon, { FESTIVE_ICON_MAP, FESTIVE_EMOJI_PRESETS } from "../../components/ui/FestiveIcon";
import Pagination from "../../components/ui/Pagination";

function formatToDateTimeLocal(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export default function AdminFestivalSale() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Festival Sale Config State
  const [config, setConfig] = useState({
    active: true,
    emoji: "🎉",
    name: "Dashain Festival Sale",
    discountLabel: "Up to 30% OFF",
    subtitle: "Stock up on festival favorites before the celebration ends.",
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  });

  // Product Catalog State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'on_sale', 'not_on_sale'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Live countdown timer based on config.endDate
  const timeLeft = useCountdown(config.endDate);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [confData, prodData, catData] = await Promise.all([
        getFestivalSaleConfig(),
        queryProducts(),
        getAllCategories(),
      ]);
      if (confData) setConfig(confData);
      setProducts(prodData?.items || []);
      setCategories(catData || []);
    } catch (err) {
      showToast("Error loading festival sale data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateFestivalSaleConfig(config);
      showToast("Festival sale configuration saved successfully!");
    } catch (err) {
      showToast("Failed to save configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePresetDays = (daysToAdd) => {
    const target = new Date(Date.now() + daysToAdd * 86400000);
    target.setSeconds(0);
    target.setMilliseconds(0);
    setConfig((prev) => ({
      ...prev,
      endDate: target.toISOString(),
    }));
  };

  const handlePresetEndOfMonth = () => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setConfig((prev) => ({
      ...prev,
      endDate: target.toISOString(),
    }));
  };

  const handleToggleProduct = async (productId, currentStatus) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFestivalSale: nextStatus } : p))
    );

    try {
      await toggleProductFestivalSale(productId, nextStatus);
      showToast(nextStatus ? "Added product to Festival Sale" : "Removed product from Festival Sale");
    } catch (err) {
      showToast("Failed to update product status", "error");
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isFestivalSale: currentStatus } : p))
      );
    }
  };

  const handleBulkSet = async (isFestivalSale) => {
    const targetIds = filteredProducts.map((p) => p.id);
    if (targetIds.length === 0) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (targetIds.includes(p.id) ? { ...p, isFestivalSale } : p))
    );

    try {
      await bulkSetFestivalSale(targetIds, isFestivalSale);
      showToast(
        isFestivalSale
          ? `Added ${targetIds.length} products to Festival Sale`
          : `Removed ${targetIds.length} products from Festival Sale`
      );
    } catch (err) {
      showToast("Bulk update failed", "error");
      await loadData();
    }
  };
  const getCategoryName = (cat) => {
    if (!cat) return "General";
    if (typeof cat === "string") {
      const found = categories.find((c) => c.id === cat || c.slug === cat);
      return found?.name || cat;
    }
    if (typeof cat === "object" && cat !== null) {
      if (cat.name) return String(cat.name);
      if (cat.id) {
        const found = categories.find((c) => c.id === cat.id || c.slug === cat.id);
        return found?.name || String(cat.id);
      }
      if (cat.slug) {
        const found = categories.find((c) => c.id === cat.slug || c.slug === cat.slug);
        return found?.name || String(cat.slug);
      }
    }
    return "General";
  };

  // Filter products by search, category, and sale status
  const filteredProducts = products.filter((p) => {
    const s = searchQuery.toLowerCase().trim();
    const matchSearch =
      !s ||
      p.name?.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s);

    const catVal =
      typeof p.category === "object" && p.category !== null
        ? p.category.id || p.category.slug
        : p.category || p.categoryId;

    const matchCategory =
      selectedCategory === "all" ||
      catVal === selectedCategory ||
      p.category === selectedCategory ||
      p.categoryId === selectedCategory ||
      p.category?.slug === selectedCategory;

    const isOnSale = Boolean(p.isFestivalSale || p.onFestivalSale);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "on_sale" && isOnSale) ||
      (filterStatus === "not_on_sale" && !isOnSale);

    return matchSearch && matchCategory && matchStatus;
  });

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  // Clamp current page if totalPages shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const onSaleCount = products.filter((p) => p.isFestivalSale || p.onFestivalSale).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-elevated text-sm font-medium text-white transition-all animate-modal-pop ${
            toast.type === "error" ? "bg-tomato-600" : "bg-basil-700"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
            <PartyPopper className="text-tomato-500" size={24} />
            Festival Sale Console
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Configure countdown timers, festive marketing copy, and manage products on festival sale.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-basil-600 text-white text-sm font-semibold hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Top Section: Sale Timing & Marketing Details */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Timing & Copy Settings */}
        <div className="lg:col-span-7 card-elevated rounded-3xl p-6 bg-white border border-basil-100 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-basil-50">
            <div className="flex items-center gap-2">
              <Sparkles className="text-tomato-500" size={18} />
              <h3 className="font-display font-bold text-ink text-base">Campaign Settings</h3>
            </div>

            {/* Master Active Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className="text-xs font-semibold text-ink-soft">
                {config.active ? "Sale Active" : "Sale Inactive"}
              </span>
              <input
                type="checkbox"
                checked={config.active}
                onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-basil-600 relative"></div>
            </label>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-sm">
            {/* Festival Name */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">
                Festival Campaign Name *
              </label>
              <input
                type="text"
                required
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g. Dashain Festival Sale, Tihar Mega Sale, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink font-medium"
              />
            </div>

            {/* Campaign Icon / Favicon Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-ink uppercase">
                  Campaign Icon / Favicon
                </label>
                <div className="flex items-center gap-1.5 text-xs text-basil-700 font-semibold bg-basil-50 px-2.5 py-1 rounded-full">
                  <span>Current:</span>
                  <FestiveIcon icon={config.emoji} size={14} />
                  <span className="capitalize">{config.emoji || "Flame"}</span>
                </div>
              </div>

              {/* Vector Favicons Grid */}
              <div className="p-3 bg-cream/70 rounded-2xl border border-basil-100/70 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft/70 mb-1.5">
                    Vector Favicons & Badges
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {Object.entries(FESTIVE_ICON_MAP).map(([key, item]) => {
                      const IconComp = item.icon;
                      const isSelected =
                        String(config.emoji).toLowerCase() === key ||
                        config.emoji === item.emoji;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setConfig({ ...config, emoji: key })}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-basil-600 text-white shadow-soft font-semibold scale-[1.02]"
                              : "bg-white text-ink-soft hover:bg-basil-50 hover:text-ink border border-basil-100/50"
                          }`}
                        >
                          <IconComp size={15} className={isSelected ? "text-white" : "text-mango-600"} />
                          <span className="truncate text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emojis Preset Bar */}
                <div className="pt-2 border-t border-basil-100/50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-ink-soft/70 uppercase">Emojis:</span>
                    {FESTIVE_EMOJI_PRESETS.map((em) => {
                      const isSelected = config.emoji === em;
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setConfig({ ...config, emoji: em })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all ${
                            isSelected
                              ? "bg-basil-600 text-white scale-110 shadow-soft ring-2 ring-basil-600/30"
                              : "bg-white hover:bg-basil-50 border border-basil-100/50"
                          }`}
                        >
                          {em}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Write-In Input */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] text-ink-soft/60">Custom:</span>
                    <input
                      type="text"
                      value={config.emoji}
                      onChange={(e) => setConfig({ ...config, emoji: e.target.value })}
                      placeholder="Icon/Emoji"
                      className="w-24 px-2 py-1 text-xs rounded-lg bg-white border border-basil-100 focus:outline-none text-ink text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Badge & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">
                  Discount Tag
                </label>
                <input
                  type="text"
                  value={config.discountLabel}
                  onChange={(e) => setConfig({ ...config, discountLabel: e.target.value })}
                  placeholder="Up to 30% OFF"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink uppercase mb-1">
                  Banner Subtitle
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="Stock up on festival favorites before the celebration ends."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                />
              </div>
            </div>

            {/* End Date & Time Selection */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1 flex items-center justify-between">
                <span>Sale End Date & Time (Countdown Target) *</span>
                <span className="text-tomato-500 lowercase font-normal">
                  {timeLeft.expired ? "Expired" : `${timeLeft.days}d ${timeLeft.hours}h left`}
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  required
                  value={formatToDateTimeLocal(config.endDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setConfig({ ...config, endDate: new Date(e.target.value).toISOString() });
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink text-sm font-mono"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-ink-soft font-semibold uppercase mr-1">
                  Quick Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handlePresetDays(1)}
                  className="px-2.5 py-1 rounded-lg bg-basil-50 hover:bg-basil-100 text-ink-soft hover:text-ink text-xs font-medium transition-colors"
                >
                  +24 Hours
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(3)}
                  className="px-2.5 py-1 rounded-lg bg-basil-50 hover:bg-basil-100 text-ink-soft hover:text-ink text-xs font-medium transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(7)}
                  className="px-2.5 py-1 rounded-lg bg-basil-50 hover:bg-basil-100 text-ink-soft hover:text-ink text-xs font-medium transition-colors"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(14)}
                  className="px-2.5 py-1 rounded-lg bg-basil-50 hover:bg-basil-100 text-ink-soft hover:text-ink text-xs font-medium transition-colors"
                >
                  +14 Days
                </button>
                <button
                  type="button"
                  onClick={handlePresetEndOfMonth}
                  className="px-2.5 py-1 rounded-lg bg-basil-50 hover:bg-basil-100 text-ink-soft hover:text-ink text-xs font-medium transition-colors"
                >
                  End of Month
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 5 Columns: Live Homepage Preview Card */}
        <div className="lg:col-span-5 card-elevated rounded-3xl p-6 bg-gradient-to-br from-tomato-500 via-tomato-500 to-mango-500 text-white flex flex-col justify-between shadow-elevated relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/80 font-bold mb-3">
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> Live Banner Preview
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full ${
                  config.active ? "bg-white/20" : "bg-black/30"
                }`}
              >
                {config.active ? "Active" : "Hidden"}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <FestiveIcon icon={config.emoji} size={14} />
              <span>{config.discountLabel}</span>
            </span>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-3">
              {config.name || "Festival Sale"}
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">
              {config.subtitle || "Shop now before the celebration ends."}
            </p>
          </div>

          {/* Countdown Preview */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-2.5 py-1.5 min-w-[48px]">
                <span className="font-bold text-base sm:text-lg tabular-nums">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">Days</span>
              </div>
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-2.5 py-1.5 min-w-[48px]">
                <span className="font-bold text-base sm:text-lg tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">Hrs</span>
              </div>
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-2.5 py-1.5 min-w-[48px]">
                <span className="font-bold text-base sm:text-lg tabular-nums">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">Min</span>
              </div>
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-2.5 py-1.5 min-w-[48px]">
                <span className="font-bold text-base sm:text-lg tabular-nums">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">Sec</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/90">
              <span>Selected Products:</span>
              <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded-lg">
                {onSaleCount} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Product Selector Catalog */}
      <div className="card-elevated rounded-3xl p-6 bg-white border border-basil-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-basil-50">
          <div>
            <h3 className="font-display font-bold text-ink text-lg flex items-center gap-2">
              <ShoppingBag className="text-basil-600" size={20} />
              Products on Festival Sale ({onSaleCount} Assigned)
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Toggle which products appear in the homepage festival sale carousel and special offers page.
            </p>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkSet(true)}
              className="px-3 py-1.5 rounded-xl border border-basil-200 text-basil-700 hover:bg-basil-50 text-xs font-semibold transition-colors"
            >
              + Add Filtered ({filteredProducts.length})
            </button>
            <button
              onClick={() => handleBulkSet(false)}
              className="px-3 py-1.5 rounded-xl border border-tomato-200 text-tomato-600 hover:bg-tomato-50 text-xs font-semibold transition-colors"
            >
              - Remove Filtered
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or brand..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-xs sm:text-sm text-ink placeholder:text-ink-soft/60"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-cream border border-basil-100 text-xs sm:text-sm text-ink focus:outline-none font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-cream border border-basil-100 text-xs sm:text-sm text-ink focus:outline-none font-medium"
          >
            <option value="all">All Products</option>
            <option value="on_sale">Only In Festival Sale</option>
            <option value="not_on_sale">Not in Festival Sale</option>
          </select>
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="text-center py-16 text-ink-soft text-sm">Loading product catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-ink-soft bg-basil-50/40 rounded-2xl">
            <Tag size={32} className="mx-auto mb-2 text-basil-300" />
            <p className="font-semibold text-ink text-sm">No products found</p>
            <p className="text-xs mt-0.5">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-basil-50/70 text-xs font-semibold text-ink uppercase tracking-wider border-b border-basil-100">
                  <th className="py-3 px-4 rounded-l-xl">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Old Price</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Festival Sale Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-basil-50">
                {paginatedProducts.map((product) => {
                  const isOnSale = Boolean(product.isFestivalSale || product.onFestivalSale);
                  const discountPercent = getDiscountPercent(product);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-basil-50/40 transition-colors ${
                        isOnSale ? "bg-tomato-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-basil-50 overflow-hidden shrink-0 border border-basil-100">
                            <SafeImage
                              src={getProductImage(product)}
                              fallbackSrc={getProductImageFallback(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-ink text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-ink-soft">{product.brand || "Daalbhat"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-ink-soft capitalize">
                        {getCategoryName(product.category || product.categoryId)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-ink text-sm">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-xs text-ink-soft line-through">
                        {product.oldPrice ? `$${Number(product.oldPrice).toFixed(2)}` : "—"}
                      </td>

                      <td className="py-3 px-4">
                        {discountPercent > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-tomato-100 text-tomato-700">
                            {discountPercent}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-ink-soft/60">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleProduct(product.id, isOnSale)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isOnSale
                              ? "bg-tomato-500 text-white hover:bg-tomato-600 shadow-sm"
                              : "bg-basil-50 text-ink-soft hover:bg-basil-100 hover:text-ink"
                          }`}
                        >
                          {isOnSale ? (
                            <>
                              <Check size={14} /> In Festival Sale
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Add to Sale
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-basil-100 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <span className="font-semibold text-ink">
                  {startIndex + 1}–{Math.min(startIndex + pageSize, filteredProducts.length)}
                </span>
                <span>of</span>
                <span className="font-semibold text-ink">{filteredProducts.length}</span>
                <span>products</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-1.5">
                  <span>Items per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-cream border border-basil-100 text-xs font-medium text-ink focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-0"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}
