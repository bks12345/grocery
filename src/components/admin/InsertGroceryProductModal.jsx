import { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Plus,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import * as adminProductService from "../../services/adminProductService";

const dietOptions = [
  { id: "all", label: "All Diets" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "non-vegetarian", label: "Non-Vegetarian" },
  { id: "eggetarian", label: "Eggetarian" },
  { id: "vegan", label: "Vegan" },
];

const categoryPresets = [
  "Grains & Cereals",
  "Cooking Essentials",
  "Lentils & Pulses",
  "Vegetables",
  "Protein",
  "Dairy",
  "Beverages",
  "Spices & Seasoning",
  "Snacks & Packaged",
  "Other",
];

export default function InsertGroceryProductModal({
  existingItems = [],
  onClose,
  onInsert,
}) {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  // Selected product for individual configuration
  const [activeProduct, setActiveProduct] = useState(null);

  // Configuration Form State for active product
  const [config, setConfig] = useState({
    name: "",
    category: "Grains & Cereals",
    unit: "kg",
    perAdult: 1.0,
    price: 0,
    diets: ["all"],
    dietaryTag: "none",
  });

  const existingProductIds = useMemo(() => {
    return new Set(
      existingItems.map((i) => i.productId).filter(Boolean)
    );
  }, [existingItems]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = await adminProductService.getAllProducts();
        setProducts(all || []);
      } catch (e) {
        console.error("Failed to load products for customized grocery:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When admin selects a product to configure
  const handleSelectProduct = (prod) => {
    setActiveProduct(prod);

    // Auto-detect sensible unit & category
    const weightLower = (prod.weight || "").toLowerCase();
    let detectedUnit = "kg";
    if (weightLower.includes("l") || weightLower.includes("liter") || weightLower.includes("ltr")) {
      detectedUnit = "L";
    } else if (weightLower.includes("g") && !weightLower.includes("kg")) {
      detectedUnit = "g";
    } else if (weightLower.includes("pc") || weightLower.includes("piece")) {
      detectedUnit = "pcs";
    } else if (weightLower.includes("pack")) {
      detectedUnit = "pack";
    }

    const catSlug = typeof prod.category === "string" ? prod.category.toLowerCase() : "";
    let detectedCat = "Grains & Cereals";
    if (catSlug.includes("oil") || catSlug.includes("ghee")) detectedCat = "Cooking Essentials";
    else if (catSlug.includes("spice") || catSlug.includes("seasoning")) detectedCat = "Cooking Essentials";
    else if (catSlug.includes("lentil") || catSlug.includes("pulse")) detectedCat = "Grains & Cereals";
    else if (catSlug.includes("dairy")) detectedCat = "Dairy";
    else if (catSlug.includes("bev") || catSlug.includes("tea")) detectedCat = "Beverages";
    else if (catSlug.includes("meat") || catSlug.includes("egg")) detectedCat = "Protein";

    setConfig({
      name: prod.name,
      category: detectedCat,
      unit: detectedUnit,
      perAdult: detectedUnit === "g" ? 250 : detectedUnit === "pcs" ? 10 : 1.5,
      price: Number(prod.price) || 0,
      diets: ["all"],
      dietaryTag:
        prod.name.toLowerCase().includes("oil")
          ? "oil"
          : prod.name.toLowerCase().includes("salt")
          ? "salt"
          : "none",
    });
  };

  const toggleDiet = (dietId) => {
    setConfig((prev) => {
      if (dietId === "all") {
        return { ...prev, diets: ["all"] };
      }
      const withoutAll = prev.diets.filter((d) => d !== "all");
      const exists = withoutAll.includes(dietId);
      const next = exists
        ? withoutAll.filter((d) => d !== dietId)
        : [...withoutAll, dietId];
      return {
        ...prev,
        diets: next.length === 0 ? ["all"] : next,
      };
    });
  };

  const handleConfirmInsert = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    setSubmitting(true);
    try {
      const itemToInsert = {
        productId: activeProduct.id,
        name: config.name.trim() || activeProduct.name,
        category: config.category,
        unit: config.unit,
        perAdult: Number(config.perAdult) || 1.0,
        price: Number(config.price) || Number(activeProduct.price) || 0,
        diets: config.diets,
        dietaryTag: config.dietaryTag,
        image:
          activeProduct.image ||
          (Array.isArray(activeProduct.images) ? activeProduct.images[0] : "") ||
          "",
        inStock: activeProduct.inStock !== false,
        isActive: true,
      };

      await onInsert(itemToInsert);
      setActiveProduct(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products list
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const s = search.toLowerCase().trim();
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
        p.categoryId === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  const categories = useMemo(() => {
    if (!products) return [];
    const set = new Set();
    products.forEach((p) => {
      const c =
        typeof p.category === "object" && p.category !== null
          ? p.category.name || p.category.slug
          : p.category || p.categoryId;
      if (c) set.add(String(c));
    });
    return Array.from(set);
  }, [products]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-modal-fade"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-elevated border border-basil-100 flex flex-col overflow-hidden animate-modal-pop">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-basil-100 flex items-center justify-between bg-cream/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-basil-50 text-basil-600 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-base">
                Insert Store Products into Customized Grocery
              </h3>
              <p className="text-xs text-ink-soft">
                Select products from your backend catalog to power customer grocery calculations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:text-ink hover:bg-basil-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content: Split into Product Picker and Configuration Pane */}
        <div className="flex-1 overflow-hidden grid md:grid-cols-12 min-h-0">
          {/* Left Column: Product Browser (7 cols) */}
          <div className="md:col-span-7 border-r border-basil-50 flex flex-col p-4 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name or brand..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-basil-600/20"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink-soft focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-ink-soft gap-2">
                  <Loader2 size={24} className="animate-spin text-basil-600" />
                  <p className="text-xs">Loading store products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-xs text-ink-soft">
                  No store products match your search.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isInserted = existingProductIds.has(p.id);
                  const isSelected = activeProduct?.id === p.id;
                  const thumb =
                    p.image ||
                    (Array.isArray(p.images) ? p.images[0] : null);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-basil-50/80 border-basil-600 shadow-sm"
                          : isInserted
                          ? "bg-cream/40 border-basil-100/60 opacity-80 hover:opacity-100"
                          : "bg-white border-basil-100 hover:border-basil-300 hover:bg-basil-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-cream border border-basil-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-cream text-basil-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-soft">
                            <span className="font-semibold text-basil-700">
                              ${Number(p.price || 0).toLocaleString()}
                            </span>
                            {p.weight && <span>• {p.weight}</span>}
                            {isInserted && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-md font-semibold text-[10px]">
                                In Plan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                          isSelected
                            ? "bg-basil-600 text-white"
                            : "bg-cream text-ink-soft hover:bg-basil-100 hover:text-basil-700"
                        }`}
                      >
                        {isSelected ? "Configuring" : isInserted ? "Update" : "Select"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Consumption & Rations Configuration (5 cols) */}
          <div className="md:col-span-5 p-5 bg-gradient-to-b from-white to-basil-50/20 overflow-y-auto flex flex-col justify-between">
            {!activeProduct ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-soft">
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-mango-600 mb-3">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-semibold text-ink text-sm">Select a Product</h4>
                <p className="text-xs mt-1 text-ink-soft/80 max-w-xs">
                  Click any product on the left to set its monthly ration per adult, category, and diet options.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmInsert} className="space-y-4">
                <div className="pb-3 border-b border-basil-100 flex items-start gap-3">
                  {activeProduct.image ? (
                    <img
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      className="w-12 h-12 rounded-xl object-cover border border-basil-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-basil-50 flex items-center justify-center text-basil-600 font-bold shrink-0">
                      {activeProduct.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-ink text-sm leading-snug">
                      {activeProduct.name}
                    </h4>
                    <p className="text-xs text-basil-700 font-semibold mt-0.5">
                      Store Price: ${Number(activeProduct.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Display Name in Grocery Plan *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-basil-600/20"
                  />
                </div>

                {/* Grid: Unit and Price */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Unit (kg, L, pcs) *
                    </label>
                    <input
                      type="text"
                      required
                      value={config.unit}
                      onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Price / Unit ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.price}
                      onChange={(e) => setConfig({ ...config, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none"
                    />
                  </div>
                </div>

                {/* Per Adult Monthly Consumption */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-ink">
                      Monthly Ration per Adult *
                    </label>
                    <span className="text-[11px] text-basil-700 font-semibold">
                      {config.perAdult} {config.unit} / mo
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={config.perAdult}
                    onChange={(e) => setConfig({ ...config, perAdult: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-basil-600/20"
                  />
                  <p className="text-[11px] text-ink-soft mt-1">
                    Family estimates multiply this by (Adults + Children × 0.6) × (Days / 30).
                  </p>
                </div>

                {/* Plan Category */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Grocery Plan Category
                  </label>
                  <select
                    value={config.category}
                    onChange={(e) => setConfig({ ...config, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none"
                  >
                    {categoryPresets.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Diet Compatibility */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Diet Compatibility
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {dietOptions.map((diet) => {
                      const active = config.diets.includes(diet.id);
                      return (
                        <button
                          key={diet.id}
                          type="button"
                          onClick={() => toggleDiet(diet.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            active
                              ? "bg-basil-600 border-basil-600 text-white"
                              : "bg-white border-basil-100 text-ink-soft hover:bg-basil-50"
                          }`}
                        >
                          {diet.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Tag */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Special Dietary Tag
                  </label>
                  <select
                    value={config.dietaryTag}
                    onChange={(e) => setConfig({ ...config, dietaryTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-basil-100 text-xs text-ink focus:outline-none"
                  >
                    <option value="none">Standard (No special rule)</option>
                    <option value="oil">Cooking Oil (30% less on Low Oil preference)</option>
                    <option value="salt">Salt (30% less on Low Salt preference)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-basil-100 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 hover:shadow-glow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Insert to Customized Grocery
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProduct(null)}
                    className="px-3 py-2.5 rounded-xl bg-cream text-ink-soft hover:bg-basil-100 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
