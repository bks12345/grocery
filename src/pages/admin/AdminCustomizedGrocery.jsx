import { useEffect, useState, useMemo } from "react";
import {
  Salad,
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Power,
} from "lucide-react";
import * as customizedGroceryService from "../../services/customizedGroceryService";
import InsertGroceryProductModal from "../../components/admin/InsertGroceryProductModal";
import EditGroceryItemModal from "../../components/admin/EditGroceryItemModal";
import { useStoreFeatures } from "../../hooks/useStoreFeatures";

const dietLabels = {
  all: { label: "All Diets", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  vegetarian: { label: "Vegetarian", badge: "bg-green-50 text-green-700 border-green-200" },
  "non-vegetarian": { label: "Non-Veg", badge: "bg-tomato-50 text-tomato-700 border-tomato-200" },
  eggetarian: { label: "Egg", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  vegan: { label: "Vegan", badge: "bg-teal-50 text-teal-700 border-teal-200" },
};

export default function AdminCustomizedGrocery() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Master Store Feature Toggle
  const { customizeGroceryActive, toggleCustomizeGrocery } = useStoreFeatures();
  const [togglingService, setTogglingService] = useState(false);

  // Modals
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showToast = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleService = async () => {
    setTogglingService(true);
    try {
      const next = !customizeGroceryActive;
      await toggleCustomizeGrocery(next);
      showToast(
        next
          ? "Customize Grocery service is now ACTIVE on customer storefront."
          : "Customize Grocery service has been DEACTIVATED on storefront."
      );
    } catch {
      showToast("Failed to update Customize Grocery service status.", "error");
    } finally {
      setTogglingService(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await customizedGroceryService.getCustomizedGroceryItems();
      setItems(data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load customized grocery items.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggleActive = async (item) => {
    setUpdatingId(item.id);
    const nextStatus = item.isActive === false ? true : false;
    try {
      await customizedGroceryService.toggleCustomizedGroceryItem(item.id, nextStatus);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: nextStatus } : i))
      );
      showToast(
        nextStatus
          ? `"${item.name}" is now ACTIVE in customer grocery estimates.`
          : `"${item.name}" is now PAUSED from customer grocery estimates.`
      );
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInsertProduct = async (productConfig) => {
    try {
      const created = await customizedGroceryService.addCustomizedGroceryItem(productConfig);
      setItems((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
      showToast(`Successfully inserted "${created.name}" into Customized Grocery.`);
      setInsertModalOpen(false);
    } catch {
      showToast("Failed to insert product.", "error");
    }
  };

  const handleSaveEdit = async (id, updates) => {
    try {
      const updated = await customizedGroceryService.updateCustomizedGroceryItem(id, updates);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
      );
      showToast("Item configurations saved successfully.");
      setEditingItem(null);
    } catch {
      showToast("Failed to save changes.", "error");
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from Customized Grocery?`)) {
      return;
    }
    setUpdatingId(item.id);
    try {
      await customizedGroceryService.deleteCustomizedGroceryItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Removed "${item.name}" from Customized Grocery.`);
    } catch {
      showToast("Failed to remove item.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        "Reset Customized Grocery catalog back to standard starter staples? Any custom products will be restored to defaults."
      )
    ) {
      return;
    }
    setUpdatingId("reset");
    try {
      const defaults = await customizedGroceryService.resetCustomizedGroceryToDefaults();
      setItems(defaults);
      showToast("Restored default staple products successfully.");
    } catch {
      showToast("Failed to reset defaults.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => {
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        i.name?.toLowerCase().includes(s) ||
        i.category?.toLowerCase().includes(s) ||
        i.productId?.toLowerCase().includes(s);

      const matchDiet =
        selectedDiet === "all" ||
        (Array.isArray(i.diets) &&
          (i.diets.includes("all") || i.diets.includes(selectedDiet)));

      const matchCat =
        selectedCategory === "all" || i.category === selectedCategory;

      const isActive = i.isActive !== false;
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && isActive) ||
        (selectedStatus === "inactive" && !isActive);

      return matchSearch && matchDiet && matchCat && matchStatus;
    });
  }, [items, search, selectedDiet, selectedCategory, selectedStatus]);

  // Categories list
  const categories = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  }, [items]);

  // Metrics
  const stats = useMemo(() => {
    if (!items) return { total: 0, active: 0, inactive: 0, avgPrice: 0 };
    const total = items.length;
    const active = items.filter((i) => i.isActive !== false).length;
    const inactive = total - active;
    const avgPrice = total
      ? Math.round(items.reduce((s, i) => s + (Number(i.price) || 0), 0) / total)
      : 0;
    return { total, active, inactive, avgPrice };
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-elevated text-sm font-medium text-white transition-all animate-modal-pop ${
            feedback.type === "error" ? "bg-tomato-600" : "bg-basil-700"
          }`}
        >
          {feedback.type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-basil-50 text-basil-600 flex items-center justify-center shadow-soft">
              <Salad size={22} />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Customized Grocery Planner
            </h1>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Insert products from your backend catalog and configure monthly consumption rations to power customer grocery estimates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Master Active / Deactivate Toggle Button */}
          <button
            type="button"
            role="switch"
            aria-checked={customizeGroceryActive}
            disabled={togglingService}
            onClick={handleToggleService}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all shadow-soft self-start sm:self-auto cursor-pointer disabled:opacity-50 ${
              customizeGroceryActive
                ? "bg-basil-50/80 border-basil-200 text-basil-800 hover:bg-basil-100/80"
                : "bg-gray-50 border-gray-200 text-ink-soft hover:bg-gray-100"
            }`}
          >
            <Power
              size={14}
              className={customizeGroceryActive ? "text-basil-600" : "text-ink-soft/60"}
            />
            <span className="text-xs font-semibold">
              {togglingService
                ? "Saving..."
                : customizeGroceryActive
                ? "Service Active"
                : "Service Deactivated"}
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                customizeGroceryActive ? "bg-basil-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  customizeGroceryActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          <button
            onClick={() => setInsertModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 hover:shadow-glow transition-all"
          >
            <Plus size={15} /> Insert Store Products
          </button>

          <button
            onClick={handleResetDefaults}
            disabled={updatingId === "reset"}
            title="Reset to default starter staples"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-basil-100 text-ink-soft hover:text-basil-600 hover:bg-basil-50 text-xs font-medium shadow-soft transition-colors"
          >
            <RotateCcw
              size={14}
              className={updatingId === "reset" ? "animate-spin" : ""}
            />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-xs text-ink-soft">Total Configured Items</p>
          <p className="font-display text-xl font-bold text-ink mt-1">{stats.total}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4 border-l-4 border-basil-600">
          <p className="text-xs text-ink-soft">Active in Estimator</p>
          <p className="font-display text-xl font-bold text-basil-700 mt-1">{stats.active}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4 border-l-4 border-amber-400">
          <p className="text-xs text-ink-soft">Paused / Inactive</p>
          <p className="font-display text-xl font-bold text-ink mt-1">{stats.inactive}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-xs text-ink-soft">Average Price / Unit</p>
          <p className="font-display text-xl font-bold text-ink mt-1">
            ${stats.avgPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staple or product name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Diet Filter */}
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            className="px-3 py-2 rounded-full bg-white shadow-soft text-xs font-medium text-ink outline-none"
          >
            <option value="all">All Diets</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="vegan">Vegan</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-full bg-white shadow-soft text-xs font-medium text-ink outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-full bg-white shadow-soft text-xs font-medium text-ink outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Item Counter */}
      <div className="text-xs text-ink-soft px-1">
        <span>
          Showing {filteredItems.length} of {stats.total} configured items
        </span>
      </div>

      {/* Products Table */}
      <div className="card-elevated rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-ink-soft text-sm">No grocery items match the selected filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedDiet("all");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="mt-2 text-xs font-semibold text-basil-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 uppercase tracking-wide border-b border-basil-50 bg-cream/40">
                  <th className="px-5 py-3.5 font-medium">Staple / Product</th>
                  <th className="px-4 py-3.5 font-medium">Category</th>
                  <th className="px-4 py-3.5 font-medium">Diet Compatibility</th>
                  <th className="px-4 py-3.5 font-medium">Price / Unit</th>
                  <th className="px-4 py-3.5 font-medium">Adult Ration / Mo</th>
                  <th className="px-4 py-3.5 font-medium text-center">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isActive = item.isActive !== false;
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-basil-50 last:border-0 transition-colors ${
                        !isActive ? "bg-gray-50/50 opacity-80" : "hover:bg-basil-50/30"
                      }`}
                    >
                      {/* Product details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover bg-cream shrink-0 border border-basil-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-basil-50 text-basil-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-ink leading-snug">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {item.productId ? (
                                <span className="px-1.5 py-0.2 bg-basil-100 text-basil-800 rounded-md font-semibold text-[10px]">
                                  Linked SKU: {item.productId}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 bg-cream text-ink-soft rounded-md font-medium text-[10px]">
                                  Custom Staple
                                </span>
                              )}
                              {item.dietaryTag && item.dietaryTag !== "none" && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md font-medium text-[10px]">
                                  Tag: {item.dietaryTag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-ink-soft bg-cream px-2.5 py-1 rounded-full border border-basil-100/50">
                          {item.category}
                        </span>
                      </td>

                      {/* Diet badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(item.diets || ["all"]).map((d) => {
                            const conf = dietLabels[d] || dietLabels.all;
                            return (
                              <span
                                key={d}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${conf.badge}`}
                              >
                                {conf.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-semibold text-ink">
                        ${Number(item.price || 0).toLocaleString()}
                        <span className="text-xs text-ink-soft font-normal"> / {item.unit}</span>
                      </td>

                      {/* Adult Ration */}
                      <td className="px-4 py-3.5 font-medium text-ink">
                        <span className="bg-basil-50 text-basil-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                          {item.perAdult} {item.unit}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          disabled={isUpdating}
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                            isActive
                              ? "bg-basil-50 text-basil-700 hover:bg-basil-100 border border-basil-200"
                              : "bg-gray-100 text-ink-soft hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isActive ? (
                            <CheckCircle2 size={13} className="text-basil-600" />
                          ) : (
                            <XCircle size={13} className="text-ink-soft/60" />
                          )}
                          <span>{isActive ? "Active" : "Paused"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Edit Rations & Configuration"
                            className="p-2 rounded-full hover:bg-basil-50 text-ink-soft hover:text-basil-600 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            disabled={isUpdating}
                            title="Remove from Customized Grocery"
                            className="p-2 rounded-full hover:bg-tomato-100 text-ink-soft hover:text-tomato-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insert Store Product Modal */}
      {insertModalOpen && (
        <InsertGroceryProductModal
          existingItems={items || []}
          onClose={() => setInsertModalOpen(false)}
          onInsert={handleInsertProduct}
        />
      )}

      {/* Edit Grocery Item Modal */}
      {editingItem && (
        <EditGroceryItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
