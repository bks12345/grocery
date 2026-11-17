import { useEffect, useState, useMemo } from "react";
import {
  Beef,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
  Drumstick,
  Droplet,
  Droplets,
  Heart,
  Bean,
  Brain,
  Skull,
  Footprints,
  Waves,
  Wind,
  Shell,
  Upload,
  Power,
} from "lucide-react";
import * as goatService from "../../services/goatService";
import { useStoreFeatures } from "../../hooks/useStoreFeatures";

const partIcons = {
  beef: Beef,
  drumstick: Drumstick,
  droplet: Droplet,
  droplets: Droplets,
  heart: Heart,
  bean: Bean,
  brain: Brain,
  skull: Skull,
  footprints: Footprints,
  waves: Waves,
  wind: Wind,
  shell: Shell,
};

const groupStyles = {
  cut: { bg: "bg-tomato-100", icon: "text-tomato-500", label: "Primal Cut", badge: "bg-tomato-50 text-tomato-600" },
  organ: { bg: "bg-mango-100", icon: "text-mango-600", label: "Organ", badge: "bg-mango-50 text-mango-600" },
  extra: { bg: "bg-cream-100", icon: "text-ink-soft", label: "Specialty Cut", badge: "bg-cream text-ink-soft" },
};

function GoatCutThumb({ part }) {
  const [imgError, setImgError] = useState(false);
  const Icon = partIcons[part.icon] || Beef;
  const style = groupStyles[part.group] || groupStyles.cut;

  if (part.image && !imgError) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-cream">
        <img
          src={part.image}
          alt={part.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
      <Icon size={18} className={style.icon} />
    </div>
  );
}

export default function AdminGoatStock() {
  const [parts, setParts] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [editingPart, setEditingPart] = useState(null); // null = closed, {} = new, {...} = editing
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [togglingService, setTogglingService] = useState(false);
  const { goatBookingActive, toggleGoat } = useStoreFeatures();

  const loadParts = async () => {
    const data = await goatService.getAllGoatParts();
    setParts(data);
  };

  useEffect(() => {
    loadParts();
  }, []);

  const showToast = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleService = async () => {
    setTogglingService(true);
    try {
      const next = !goatBookingActive;
      await toggleGoat(next);
      showToast(
        next
          ? "Goat Booking service is now ACTIVE. Accepting customer pre-orders."
          : "Goat Booking service has been DEACTIVATED. Hidden from storefront.",
        next ? "success" : "error"
      );
    } catch {
      showToast("Failed to update service status.", "error");
    } finally {
      setTogglingService(false);
    }
  };

  const handleToggleStock = async (part) => {
    setUpdatingId(part.id);
    const newStatus = part.inStock === false ? true : false;
    try {
      await goatService.toggleGoatPartStock(part.id, newStatus);
      await loadParts();
      showToast("Stock updated successfully.");
    } catch {
      showToast("Failed to update stock status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSavePart = async (formData) => {
    setUpdatingId(formData.id || "saving");
    try {
      if (formData.id && parts.some((p) => p.id === formData.id)) {
        await goatService.updateGoatPart(formData.id, formData);
        showToast("Cut updated successfully.");
      } else {
        await goatService.createGoatPart(formData);
        showToast("Cut added successfully.");
      }
      setEditingPart(null);
      await loadParts();
    } catch {
      showToast("Failed to save goat cut.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePart = async (part) => {
    if (!window.confirm(`Are you sure you want to delete "${part.name}"?`)) return;
    setUpdatingId(part.id);
    try {
      await goatService.deleteGoatPart(part.id);
      await loadParts();
      showToast("Cut deleted successfully.");
    } catch {
      showToast("Failed to delete part.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all goat parts and stock back to default cuts?")) return;
    setUpdatingId("reset");
    try {
      await goatService.resetGoatPartsToDefaults();
      await loadParts();
      showToast("Restored default cuts successfully.");
    } catch {
      showToast("Failed to reset defaults.", "error");
    } finally {
      setUpdatingId(null);
    }
  };


  const filteredParts = useMemo(() => {
    if (!parts) return [];
    return parts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.group && p.group.toLowerCase().includes(search.toLowerCase()));
      const matchGroup = selectedGroup === "all" || p.group === selectedGroup;
      const isPartInStock = p.inStock !== false;
      const matchStock =
        selectedStock === "all" ||
        (selectedStock === "inStock" && isPartInStock) ||
        (selectedStock === "outOfStock" && !isPartInStock);
      return matchSearch && matchGroup && matchStock;
    });
  }, [parts, search, selectedGroup, selectedStock]);

  const stats = useMemo(() => {
    if (!parts) return { total: 0, inStock: 0, outOfStock: 0, avgPrice: 0 };
    const total = parts.length;
    const inStock = parts.filter((p) => p.inStock !== false).length;
    const outOfStock = total - inStock;
    const avgPrice = total ? Math.round(parts.reduce((sum, p) => sum + (p.pricePerKg || 0), 0) / total) : 0;
    return { total, inStock, outOfStock, avgPrice };
  }, [parts]);

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header with Service Activate / Deactivate Toggle (Just like Festival Sale) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
            <Beef className="text-mango-600" size={24} />
            Goat Stock & Booking Management
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Configure live cut availability, pricing per kg, and toggle customer booking visibility.
          </p>
        </div>

        {/* Master Active / Deactivate Toggle Button */}
        <button
          type="button"
          role="switch"
          aria-checked={goatBookingActive}
          disabled={togglingService}
          onClick={handleToggleService}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all shadow-soft self-start sm:self-auto cursor-pointer disabled:opacity-50 ${
            goatBookingActive
              ? "bg-basil-50/80 border-basil-200 text-basil-800 hover:bg-basil-100/80"
              : "bg-gray-50 border-gray-200 text-ink-soft hover:bg-gray-100"
          }`}
        >
          <Power
            size={14}
            className={goatBookingActive ? "text-basil-600" : "text-ink-soft/60"}
          />
          <span className="text-xs font-semibold">
            {togglingService
              ? "Saving..."
              : goatBookingActive
              ? "Service Active"
              : "Service Deactivated"}
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              goatBookingActive ? "bg-basil-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                goatBookingActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-xs text-ink-soft">Total Goat Cuts</p>
          <p className="font-display text-xl font-bold text-ink mt-1">{stats.total}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4 border-l-4 border-basil-600">
          <p className="text-xs text-ink-soft">In Stock (Live)</p>
          <p className="font-display text-xl font-bold text-basil-700 mt-1">{stats.inStock}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4 border-l-4 border-tomato-500">
          <p className="text-xs text-ink-soft">Out of Stock (Hidden)</p>
          <p className="font-display text-xl font-bold text-tomato-600 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-xs text-ink-soft">Average Price / kg</p>
          <p className="font-display text-xl font-bold text-ink mt-1">${stats.avgPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium flex items-center justify-between transition-all ${
            feedback.type === "error"
              ? "bg-tomato-100 text-tomato-600"
              : "bg-basil-600 text-white shadow-soft"
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goat parts..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 rounded-full bg-white shadow-soft text-xs font-medium text-ink outline-none"
          >
            <option value="all">All Groups</option>
            <option value="cut">Primal Cuts</option>
            <option value="organ">Organs</option>
            <option value="extra">Specialty / Extras</option>
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="px-3 py-2 rounded-full bg-white shadow-soft text-xs font-medium text-ink outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="inStock">In Stock Only</option>
            <option value="outOfStock">Out of Stock Only</option>
          </select>

          {/* Add Part Button */}
          <button
            onClick={() => setEditingPart({ inStock: true, minQty: 0.5, pricePerKg: 1000, group: "cut", icon: "beef" })}
            className="flex items-center gap-1.5 bg-basil-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-basil-700 hover:shadow-glow transition-all"
          >
            <Plus size={14} /> Add Cut
          </button>

          {/* Reset Defaults */}
          <button
            onClick={handleResetDefaults}
            disabled={updatingId === "reset"}
            title="Reset to default 16 cuts"
            className="flex items-center gap-1 bg-white text-ink-soft hover:text-basil-600 px-3 py-2 rounded-full text-xs font-medium shadow-soft hover:bg-basil-50 transition-colors"
          >
            <RotateCcw size={13} className={updatingId === "reset" ? "animate-spin" : ""} /> Reset
          </button>
        </div>
      </div>

      {/* Cut Counter */}
      <div className="text-xs text-ink-soft px-1">
        <span>Showing {filteredParts.length} of {stats.total} cuts</span>
      </div>

      {/* Parts Table */}
      <div className="card-elevated rounded-3xl overflow-hidden">
        {!parts ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-ink-soft text-sm">No goat cuts match the selected filters.</p>
            <button
              onClick={() => { setSearch(""); setSelectedGroup("all"); setSelectedStock("all"); }}
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
                  <th className="px-5 py-3.5 font-medium">Cut / Part</th>
                  <th className="px-4 py-3.5 font-medium">Group</th>
                  <th className="px-4 py-3.5 font-medium">Price / kg</th>
                  <th className="px-4 py-3.5 font-medium">Min Order</th>
                  <th className="px-5 py-3.5 font-medium text-center">Available Stock</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => {
                  const isInStock = part.inStock !== false;
                  const isUpdating = updatingId === part.id;
                  const style = groupStyles[part.group] || groupStyles.cut;

                  return (
                    <tr
                      key={part.id}
                      className={`border-b border-basil-50 last:border-0 transition-colors ${
                        !isInStock ? "bg-tomato-50/20" : "hover:bg-basil-50/30"
                      }`}
                    >
                      {/* Cut Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <GoatCutThumb part={part} />
                          <div>
                            <p className="font-semibold text-ink">{part.name}</p>
                            <span className="text-xs text-ink-soft/60">ID: {part.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-semibold text-ink">
                        ${part.pricePerKg?.toLocaleString()} <span className="text-xs text-ink-soft font-normal">/kg</span>
                      </td>

                      {/* Min Qty */}
                      <td className="px-4 py-3.5 text-ink-soft">
                        {part.minQty || 0.5} kg
                      </td>

                      {/* Stock Toggle Switch */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(part)}
                          disabled={isUpdating}
                          aria-label={`Toggle stock for ${part.name}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                            isInStock
                              ? "bg-basil-50 text-basil-700 hover:bg-basil-100 border border-basil-200"
                              : "bg-tomato-100 text-tomato-600 hover:bg-tomato-200 border border-tomato-200"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isInStock ? (
                            <CheckCircle2 size={13} className="text-basil-600" />
                          ) : (
                            <XCircle size={13} className="text-tomato-500" />
                          )}
                          <span>{isInStock ? "In Stock" : "Out of Stock"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPart(part)}
                            aria-label={`Edit ${part.name}`}
                            className="p-2 rounded-full hover:bg-basil-50 text-ink-soft hover:text-basil-600 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeletePart(part)}
                            disabled={isUpdating}
                            aria-label={`Delete ${part.name}`}
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

      {/* Edit / Add Modal */}
      {editingPart !== null && (
        <GoatPartModal
          initial={editingPart.id ? editingPart : null}
          onSave={handleSavePart}
          onClose={() => setEditingPart(null)}
        />
      )}
    </div>
  );
}

function GoatPartModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id || `g_${Date.now().toString().slice(-4)}`,
    name: initial?.name || "",
    pricePerKg: initial?.pricePerKg ?? 1000,
    minQty: initial?.minQty ?? 0.5,
    group: initial?.group || "cut",
    icon: initial?.icon || "beef",
    image: initial?.image || "",
    inStock: initial?.inStock ?? true,
    stockKg: initial?.stockKg ?? 50,
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const res = await goatService.uploadGoatPartImage(file);
      if (res?.imageUrl) {
        setForm((prev) => ({ ...prev, image: res.imageUrl }));
      }
    } catch (err) {
      setError(err.message || "Failed to upload cut photo. Please try again or paste an image URL.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.pricePerKg) {
      setError("Name and Price per kg are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        pricePerKg: Number(form.pricePerKg),
        minQty: Number(form.minQty),
        stockKg: Number(form.stockKg),
      });
    } catch (err) {
      setError(err.message || "Failed to save.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Beef size={20} className="text-basil-600" />
            {initial ? `Edit "${initial.name}"` : "Add New Goat Cut"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-basil-50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink-soft">Cut / Part Name *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Ribs, Shoulder, Brain"
              required
              className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-soft">Price per kg ($) *</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.pricePerKg}
                onChange={(e) => setForm((prev) => ({ ...prev, pricePerKg: e.target.value }))}
                required
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-soft">Minimum Order Qty (kg)</span>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={form.minQty}
                onChange={(e) => setForm((prev) => ({ ...prev, minQty: e.target.value }))}
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-soft">Category Group</span>
              <select
                value={form.group}
                onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm"
              >
                <option value="cut">Primal Cut (Meat)</option>
                <option value="organ">Organ</option>
                <option value="extra">Specialty / Extra</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-soft">Icon</span>
              <select
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm"
              >
                <option value="beef">Beef / Meat</option>
                <option value="drumstick">Drumstick / Leg</option>
                <option value="droplet">Droplet</option>
                <option value="droplets">Droplets (Fat)</option>
                <option value="heart">Heart</option>
                <option value="bean">Bean (Kidney)</option>
                <option value="brain">Brain</option>
                <option value="skull">Head / Skull</option>
                <option value="footprints">Trotters / Feet</option>
                <option value="waves">Intestine / Waves</option>
                <option value="wind">Lung / Wind</option>
                <option value="shell">Tail / Shell</option>
              </select>
            </label>
          </div>

          {/* Image Upload / URL */}
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">Cut Photo / Image</span>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL or Base64 (optional)"
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft outline-none text-ink text-sm w-full"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center gap-2 bg-cream text-basil-600 px-4 py-2 rounded-full font-medium hover:bg-basil-50 cursor-pointer border border-basil-100 transition-colors text-xs sm:text-sm">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{uploadingImage ? "Optimizing & Uploading..." : "Upload Cut Photo"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
                {form.image && (
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-cream shadow-soft flex-shrink-0 border border-basil-100">
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                      className="p-1 text-tomato-500 hover:text-tomato-600 rounded-full hover:bg-tomato-50 text-xs"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="p-4 rounded-2xl bg-cream/70 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">In Stock Status</p>
              <p className="text-xs text-ink-soft">
                {form.inStock ? "In Stock" : "Out of Stock"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-ink-soft/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-soft/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-basil-600"></div>
            </label>
          </div>

          {error && <p className="text-xs text-tomato-500 font-medium">{error}</p>}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 text-sm"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {initial ? "Save Changes" : "Add Goat Cut"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-ink-soft hover:bg-basil-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
