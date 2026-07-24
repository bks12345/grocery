import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import * as adminCategoryService from "../../services/adminCategoryService";

const emptyForm = { name: "", subcategoriesText: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [editing, setEditing] = useState(null); // null closed, {} new, {...} editing
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => adminCategoryService.getAllCategories().then(setCategories);

  useEffect(() => {
    load();
  }, []);

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      subcategoriesText: (cat.subcategories || []).join(", "),
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError(null);

    const subcategories = form.subcategoriesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editing?.id) {
        await adminCategoryService.editCategory(editing.id, {
          name: form.name,
          subcategories,
        });
      } else {
        await adminCategoryService.createCategory({
          name: form.name,
          color: "bg-basil-100",
          subcategories,
        });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || "Couldn't save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminCategoryService.removeCategory(id);
      await load();
    } catch (err) {
      alert(err.message); // eslint-disable-line no-alert -- simple demo feedback for a blocked delete
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {categories ? `${categories.length} categories` : "Loading..."}
        </p>
        <button
          onClick={() => openEdit({})}
          className="flex items-center gap-2 bg-basil-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {!categories ? (
        <div className="card-elevated rounded-3xl p-16 flex justify-center">
          <Loader2 className="animate-spin text-basil-600" size={24} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card-elevated rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-basil-600 text-white flex items-center justify-center text-xs font-semibold">
                    {cat.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink line-clamp-1">{cat.name}</p>
                    <p className="text-xs text-ink-soft/60">
                      {(cat.subcategories || []).length} subcategories
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="p-1.5 rounded-full hover:bg-basil-50 text-ink-soft hover:text-basil-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    aria-label={`Delete ${cat.name}`}
                    className="p-1.5 rounded-full hover:bg-tomato-100/60 text-ink-soft hover:text-tomato-500"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-md">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-display text-lg font-semibold text-ink">
                {editing.id ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-basil-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Subcategories (comma-separated)</span>
                <input
                  value={form.subcategoriesText}
                  onChange={(e) => setForm((f) => ({ ...f, subcategoriesText: e.target.value }))}
                  placeholder="e.g. Citrus Fruits, Berries, Tropical Fruits"
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
                  {editing.id ? "Save Changes" : "Add Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
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
