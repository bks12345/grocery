import { useState } from "react";
import { X, Save, Loader2, Salad } from "lucide-react";

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

export default function EditGroceryItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item.name || "",
    category: item.category || "Grains & Cereals",
    unit: item.unit || "kg",
    perAdult: Number(item.perAdult) || 1.0,
    price: Number(item.price) || 0,
    diets: Array.isArray(item.diets) && item.diets.length > 0 ? item.diets : ["all"],
    dietaryTag: item.dietaryTag || "none",
    isActive: item.isActive !== false,
  });
  const [saving, setSaving] = useState(false);

  const toggleDiet = (dietId) => {
    setForm((prev) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(item.id, {
        name: form.name.trim(),
        category: form.category,
        unit: form.unit,
        perAdult: Number(form.perAdult) || 1.0,
        price: Number(form.price) || 0,
        diets: form.diets,
        dietaryTag: form.dietaryTag,
        isActive: form.isActive,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-modal-fade"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-elevated border border-basil-100 overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-basil-100 flex items-center justify-between bg-cream/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-basil-50 text-basil-600 flex items-center justify-center">
              <Salad size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-sm">
                Edit Grocery Item Configuration
              </h3>
              <p className="text-[11px] text-ink-soft">
                Customize rations, pricing, and dietary suitability for this staple.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-ink-soft hover:text-ink hover:bg-basil-50 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-basil-600/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none"
              >
                {categoryPresets.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Unit (kg, L, pcs)
              </label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Monthly Ration / Adult *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                required
                value={form.perAdult}
                onChange={(e) => setForm({ ...form, perAdult: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Diets */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Diet Compatibility
            </label>
            <div className="flex flex-wrap gap-1.5">
              {dietOptions.map((diet) => {
                const active = form.diets.includes(diet.id);
                return (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => toggleDiet(diet.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "bg-basil-600 border-basil-600 text-white"
                        : "bg-cream border-basil-100 text-ink-soft hover:bg-basil-50"
                    }`}
                  >
                    {diet.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Dietary Tag */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Dietary Preference Behavior
            </label>
            <select
              value={form.dietaryTag}
              onChange={(e) => setForm({ ...form, dietaryTag: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-cream border border-basil-100 text-xs text-ink focus:outline-none"
            >
              <option value="none">Standard (Always use standard formula)</option>
              <option value="oil">Cooking Oil (Reduce by 30% on Low Oil preference)</option>
              <option value="salt">Salt (Reduce by 30% on Low Salt preference)</option>
            </select>
          </div>

          {/* Active Switch */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">
              Included in Customer Calculator
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-[11px] text-ink-soft">
                {form.isActive ? "Active" : "Inactive"}
              </span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-basil-600 relative"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-basil-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-ink-soft hover:bg-basil-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 hover:shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
