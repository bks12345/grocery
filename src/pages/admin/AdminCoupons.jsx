import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, X, Tag } from "lucide-react";
import * as couponService from "../../services/couponService";

const emptyForm = { code: "", type: "percent", value: "", description: "", expiresAt: "", active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);

  const load = () => couponService.getAllCoupons().then(setCoupons);

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) {
      setError("Code and value are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await couponService.createCoupon({
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        description: form.description || `${form.value}${form.type === "percent" ? "%" : "$"} off`,
        expiresAt: form.expiresAt || null,
        active: true,
      });
      setForm(emptyForm);
      setCreating(false);
      await load();
    } catch (err) {
      setError(err.message || "Couldn't create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    await couponService.updateCoupon(coupon.code, { active: !coupon.active });
    await load();
  };

  const handleDelete = async (code) => {
    setDeletingCode(code);
    try {
      await couponService.deleteCoupon(code);
      await load();
    } finally {
      setDeletingCode(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {coupons ? `${coupons.length} coupons` : "Loading..."}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-basil-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {!coupons ? (
        <div className="card-elevated rounded-3xl p-16 flex justify-center">
          <Loader2 className="animate-spin text-basil-600" size={24} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="card-elevated rounded-3xl p-16 text-center text-ink-soft text-sm">
          No coupons yet — create one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.code} className="card-elevated rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-mango-100 flex items-center justify-center">
                    <Tag size={16} className="text-mango-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink tracking-wide">{coupon.code}</p>
                    <p className="text-xs text-ink-soft/70">{coupon.description}</p>
                    {coupon.expiresAt && (
                      <p className="text-xs text-ink-soft/50 mt-0.5">
                        Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(coupon.code)}
                  disabled={deletingCode === coupon.code}
                  aria-label={`Delete ${coupon.code}`}
                  className="p-1.5 rounded-full hover:bg-tomato-100/60 text-ink-soft hover:text-tomato-500 shrink-0"
                >
                  {deletingCode === coupon.code ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
              <button
                onClick={() => handleToggleActive(coupon)}
                className={`mt-3 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  coupon.active ? "bg-basil-50 text-basil-700" : "bg-tomato-100 text-tomato-500"
                }`}
              >
                {coupon.active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setCreating(false)} />
          <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-md">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-display text-lg font-semibold text-ink">Add Coupon</h2>
              <button
                onClick={() => setCreating(false)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-basil-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                  className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink-soft">Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                  >
                    <option value="percent">Percent off</option>
                    <option value="flat">Flat amount off</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink-soft">
                    Value {form.type === "percent" ? "(%)" : "($)"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Description (optional)</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Expiry date (optional)</span>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                />
              </label>

              {error && <p className="text-sm text-tomato-500">{error}</p>}

              <div className="flex items-center gap-3 mt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  Add Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-ink-soft hover:bg-basil-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
