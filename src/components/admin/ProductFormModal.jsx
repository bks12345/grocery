import { useState } from "react";
import { X, Loader2, Upload, Star, Trash2, Plus, Percent } from "lucide-react";
import { uploadMultipleProductImages } from "../../services/adminProductService";
import {
  getDiscountPercent,
  calculateDiscountedPrice,
  calculateDiscountPercent,
} from "../../utils/discount";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  oldPrice: "",
  discountPercent: "",
  weight: "",
  description: "",
  image: "",
  images: [],
  inStock: true,
  isBulk: false,
  isFeatured: false,
  isBestSeller: false,
  isNew: false,
  isCombo: false,
  isHalfPrice: false,
  comboItems: [],
};

export default function ProductFormModal({ categories, allProducts = [], initial, onSave, onClose }) {
  const initialImages = Array.isArray(initial?.images) && initial.images.length > 0
    ? initial.images
    : (initial?.image ? [initial.image] : []);

  const initialDiscount = initial ? getDiscountPercent(initial) : 0;

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...initial,
    category: initial?.categoryId || (typeof initial?.category === 'object' ? initial.category.id : initial?.category) || "",
    price: initial?.price ?? "",
    oldPrice: initial?.oldPrice ?? "",
    discountPercent: initialDiscount > 0 ? initialDiscount : "",
    isHalfPrice: Boolean(initial?.isHalfPrice || initialDiscount === 50),
    image: initialImages[0] || initial?.image || "",
    images: initialImages,
    comboItems: initial?.comboItems ?? [],
  }));
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (e) => {
    const newPriceVal = e.target.value;
    setForm((prev) => {
      const p = Number(newPriceVal);
      const old = Number(prev.oldPrice);
      let newDiscount = prev.discountPercent;
      if (old > 0 && p > 0 && old > p) {
        newDiscount = calculateDiscountPercent(old, p);
      } else if (p >= old && old > 0) {
        newDiscount = "";
      }
      return {
        ...prev,
        price: newPriceVal,
        discountPercent: newDiscount,
        isHalfPrice: Number(newDiscount) === 50,
      };
    });
  };

  const handleOldPriceChange = (e) => {
    const newOldVal = e.target.value;
    setForm((prev) => {
      const old = Number(newOldVal);
      const currPrice = Number(prev.price);
      const currPct = Number(prev.discountPercent);

      let newPrice = prev.price;
      let newDiscount = prev.discountPercent;

      if (old > 0) {
        if (currPct > 0) {
          newPrice = calculateDiscountedPrice(old, currPct);
        } else if (currPrice > 0 && old > currPrice) {
          newDiscount = calculateDiscountPercent(old, currPrice);
        }
      }
      return {
        ...prev,
        oldPrice: newOldVal,
        price: newPrice,
        discountPercent: newDiscount,
        isHalfPrice: Number(newDiscount) === 50,
      };
    });
  };

  const handleDiscountPercentChange = (e) => {
    const rawPct = e.target.value;
    setForm((prev) => {
      if (rawPct === "" || Number(rawPct) <= 0) {
        return {
          ...prev,
          discountPercent: "",
          isHalfPrice: false,
        };
      }
      const pct = Math.min(99, Math.max(1, Number(rawPct)));
      const base = Number(prev.oldPrice || prev.price) || 0;
      const effectiveOldPrice = prev.oldPrice || (prev.price ? String(prev.price) : "");
      const newPrice = base > 0 ? calculateDiscountedPrice(base, pct) : prev.price;

      return {
        ...prev,
        oldPrice: effectiveOldPrice,
        price: base > 0 ? newPrice : prev.price,
        discountPercent: pct,
        isHalfPrice: pct === 50,
      };
    });
  };

  const handleApplyPresetDiscount = (pct) => {
    setForm((prev) => {
      const base = Number(prev.oldPrice || prev.price) || 0;
      if (base <= 0) {
        return {
          ...prev,
          discountPercent: pct,
          isHalfPrice: pct === 50,
        };
      }
      const newOldPrice = prev.oldPrice || String(prev.price);
      const newPrice = calculateDiscountedPrice(base, pct);
      return {
        ...prev,
        oldPrice: newOldPrice,
        price: newPrice,
        discountPercent: pct,
        isHalfPrice: pct === 50,
      };
    });
  };

  const handleClearDiscount = () => {
    setForm((prev) => ({
      ...prev,
      price: prev.oldPrice || prev.price,
      oldPrice: "",
      discountPercent: "",
      isHalfPrice: false,
    }));
  };

  const handleHalfPriceToggle = (checked) => {
    if (checked) {
      handleApplyPresetDiscount(50);
    } else {
      handleClearDiscount();
    }
  };

  const handleMultiImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError(null);
    try {
      const uploadedUrls = await uploadMultipleProductImages(files);
      if (uploadedUrls.length > 0) {
        setForm((prev) => {
          const nextImages = [...prev.images, ...uploadedUrls];
          return {
            ...prev,
            images: nextImages,
            image: nextImages[0] || prev.image,
          };
        });
      }
    } catch (err) {
      setError(err.message || "Failed to upload some images. Please try again.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleAddUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const nextImages = [...prev.images, trimmed];
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || prev.image,
      };
    });
    setUrlInput("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || "",
      };
    });
  };

  const handleSetPrimary = (indexToPrimary) => {
    setForm((prev) => {
      const item = prev.images[indexToPrimary];
      const rest = prev.images.filter((_, idx) => idx !== indexToPrimary);
      const nextImages = [item, ...rest];
      return {
        ...prev,
        images: nextImages,
        image: item,
      };
    });
  };

  const toggleComboItem = (productId) => {
    setForm((prev) => ({
      ...prev,
      comboItems: prev.comboItems.includes(productId)
        ? prev.comboItems.filter((id) => id !== productId)
        : [...prev.comboItems, productId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.category || !form.price) {
      setError("Name, category, and price are required.");
      return;
    }
    if (form.isCombo && form.comboItems.length < 2) {
      setError("A combo deal needs at least 2 included products selected.");
      return;
    }

    setSaving(true);
    try {
      const primaryImage = form.images[0] || form.image || "";
      const finalDiscount = Number(form.discountPercent) > 0 ? Number(form.discountPercent) : null;
      await onSave({
        ...form,
        image: primaryImage,
        images: form.images.length > 0 ? form.images : (primaryImage ? [primaryImage] : []),
        category: { id: form.category }, // Pass as object since backend expects it, or just use categoryId
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        discountPercent: finalDiscount,
        isHalfPrice: finalDiscount === 50 || Boolean(form.isHalfPrice),
        comboItems: form.isCombo ? form.comboItems : undefined,
        rating: initial?.rating ?? 4.0,
        reviewsCount: initial?.reviewsCount ?? 0,
      });
    } catch (err) {
      setError(err.message || "Couldn't save product.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="font-display text-lg font-semibold text-ink">
            {initial ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-basil-50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Field label="Product name" value={form.name} onChange={handleChange("name")} required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" value={form.brand} onChange={handleChange("brand")} />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink-soft">Category</span>
              <select
                value={form.category}
                onChange={handleChange("category")}
                required
                className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Price, Regular Price, and Percentage Off */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              label="Selling Price ($)"
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={handlePriceChange}
              required
            />
            <Field
              label="Regular / Old Price ($)"
              type="number"
              min="0"
              step="any"
              value={form.oldPrice}
              placeholder="e.g. 100"
              onChange={handleOldPriceChange}
            />
            <Field
              label="Discount (% OFF)"
              type="number"
              min="0"
              max="99"
              step="1"
              value={form.discountPercent}
              placeholder="e.g. 20"
              onChange={handleDiscountPercentChange}
            />
          </div>

          {/* Quick Preset Percentage Off Bar */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-tomato-50/70 border border-tomato-100">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Percent size={13} className="text-tomato-500" />
                Quick % Off Deals:
              </span>
              {Number(form.discountPercent) > 0 && (
                <button
                  type="button"
                  onClick={handleClearDiscount}
                  className="text-[11px] font-semibold text-tomato-600 hover:text-tomato-800 underline"
                >
                  Clear Discount
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 15, 20, 25, 30, 40, 50].map((pct) => {
                const isActive = Number(form.discountPercent) === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyPresetDiscount(pct)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-tomato-500 text-white shadow-soft scale-105"
                        : "bg-white text-ink-soft hover:text-tomato-600 hover:bg-white/90 border border-tomato-100"
                    }`}
                  >
                    {pct}% OFF
                  </button>
                );
              })}
            </div>

            {Number(form.discountPercent) > 0 && form.oldPrice && form.price && (
              <div className="text-[11px] font-medium text-tomato-700 bg-white/80 px-2.5 py-1 rounded-xl border border-tomato-100/70">
                🎉 Customer gets <strong>{form.discountPercent}% OFF</strong> — Saves{" "}
                <strong>${(Number(form.oldPrice) - Number(form.price)).toFixed(2)}</strong>{" "}
                (Was ${form.oldPrice}, Now ${form.price})
              </div>
            )}
          </div>

          <Field label="Weight / quantity" placeholder="e.g. 1 kg, 500 ml" value={form.weight} onChange={handleChange("weight")} />

          {/* Multiple Product Images */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink-soft">
                Product Images ({form.images.length})
              </span>
              <span className="text-xs text-ink-soft/60">
                First image is Primary (Cover)
              </span>
            </div>

            {/* Upload Button & Add via URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 bg-basil-50 text-basil-700 px-4 py-2.5 rounded-2xl font-medium hover:bg-basil-100/70 cursor-pointer border border-basil-200/60 transition-colors text-xs sm:text-sm">
                {uploadingImages ? <Loader2 size={16} className="animate-spin text-basil-600" /> : <Upload size={16} className="text-basil-600" />}
                <span>{uploadingImages ? "Compressing & Uploading..." : "Upload Photos (Multiple)"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultiImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </label>

              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrlImage();
                    }
                  }}
                  className="px-3.5 py-2 text-xs rounded-full bg-cream shadow-soft outline-none text-ink flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  disabled={!urlInput.trim()}
                  className="px-3 py-2 rounded-full bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 disabled:opacity-40 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Uploaded Images Thumbnails Grid */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-cream/70 border border-basil-100/60 max-h-48 overflow-y-auto">
                {form.images.map((imgUrl, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden bg-white shadow-soft aspect-square border-2 transition-all ${
                        isPrimary ? "border-basil-600 ring-2 ring-basil-600/20" : "border-basil-100 hover:border-basil-300"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Product preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Badge */}
                      {isPrimary && (
                        <span className="absolute top-1 left-1 bg-basil-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                          <Star size={9} fill="currentColor" /> Cover
                        </span>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            title="Set as Primary Cover Image"
                            className="p-1 rounded-full bg-white text-basil-700 hover:bg-basil-50 shadow-soft"
                          >
                            <Star size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove this image"
                          className="p-1 rounded-full bg-white text-tomato-500 hover:bg-tomato-50 shadow-soft"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-ink-soft/60 italic text-center py-2">
                No images added yet. Click Upload Photos to select one or multiple images.
              </p>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={handleChange("description")}
              className="px-4 py-3 rounded-2xl bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <Checkbox label="In stock" checked={form.inStock} onChange={handleChange("inStock")} />
            <Checkbox label="Half price (50% off)" checked={form.isHalfPrice} onChange={(e) => handleHalfPriceToggle(e.target.checked)} />
            <Checkbox label="Bulk pack" checked={form.isBulk} onChange={handleChange("isBulk")} />
            <Checkbox label="Featured" checked={form.isFeatured} onChange={handleChange("isFeatured")} />
            <Checkbox label="Best seller" checked={form.isBestSeller} onChange={handleChange("isBestSeller")} />
            <Checkbox label="Combo deal" checked={form.isCombo} onChange={handleChange("isCombo")} />
          </div>

          {form.isCombo && (
            <div>
              <p className="text-sm font-medium text-ink-soft mb-1.5">
                Included products <span className="text-ink-soft/50">(pick at least 2)</span>
              </p>
              <div className="max-h-40 overflow-y-auto rounded-2xl bg-cream shadow-soft p-2 flex flex-col gap-1">
                {allProducts
                  .filter((p) => !p.isCombo && p.id !== initial?.id)
                  .map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm text-ink px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.comboItems.includes(p.id)}
                        onChange={() => toggleComboItem(p.id)}
                        className="accent-basil-600"
                      />
                      <span className="flex-1">{p.name}</span>
                      <span className="text-ink-soft/60 text-xs">${p.price}</span>
                    </label>
                  ))}
              </div>
              {form.comboItems.length > 0 && (
                <p className="text-xs text-ink-soft/60 mt-1.5">
                  {form.comboItems.length} selected — combined individual price: $
                  {allProducts
                    .filter((p) => form.comboItems.includes(p.id))
                    .reduce((sum, p) => sum + p.price, 0)}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-tomato-500">{error}</p>}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {initial ? "Save Changes" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-ink-soft hover:bg-basil-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <input
        {...inputProps}
        className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-basil-600" />
      {label}
    </label>
  );
}
