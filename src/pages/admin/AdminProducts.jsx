import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import * as adminProductService from "../../services/adminProductService";
import * as adminCategoryService from "../../services/adminCategoryService";
import ProductFormModal from "../../components/admin/ProductFormModal";

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = new, {...} = editing
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = () => adminProductService.getAllProducts().then(setProducts);

  useEffect(() => {
    loadProducts();
    adminCategoryService.getAllCategories().then(setCategories);
  }, []);

  const handleSave = async (data) => {
    if (editingProduct?.id) {
      await adminProductService.editProduct(editingProduct.id, data);
    } else {
      await adminProductService.createProduct(data);
    }
    setEditingProduct(null);
    await loadProducts();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminProductService.removeProduct(id);
      await loadProducts();
    } finally {
      setDeletingId(null);
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || id;

  const filtered = (products || []).filter((p) =>
    `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
          />
        </div>
        <button
          onClick={() => setEditingProduct({})}
          className="flex items-center gap-2 bg-basil-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card-elevated rounded-3xl overflow-hidden">
        {!products ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-soft text-sm py-16">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 uppercase tracking-wide border-b border-basil-50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-basil-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-basil-600 text-white text-xs font-semibold shrink-0">
                          {p.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-ink line-clamp-1">{p.name}</p>
                            {p.isCombo && (
                              <span className="text-[10px] font-semibold bg-basil-50 text-basil-700 px-1.5 py-0.5 rounded-full shrink-0">
                                Combo
                              </span>
                            )}
                            {p.isBulk && (
                              <span className="text-[10px] font-semibold bg-mango-100 text-mango-600 px-1.5 py-0.5 rounded-full shrink-0">
                                Bulk
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-soft/60">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{categoryName(p.category)}</td>
                    <td className="px-5 py-3 text-ink font-medium">${p.price}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.inStock ? "bg-basil-50 text-basil-700" : "bg-tomato-100 text-tomato-500"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          aria-label={`Edit ${p.name}`}
                          className="p-2 rounded-full hover:bg-basil-50 text-ink-soft hover:text-basil-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          aria-label={`Delete ${p.name}`}
                          className="p-2 rounded-full hover:bg-tomato-100/60 text-ink-soft hover:text-tomato-500"
                        >
                          {deletingId === p.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct !== null && (
        <ProductFormModal
          categories={categories}
          allProducts={products || []}
          initial={editingProduct.id ? editingProduct : null}
          onSave={handleSave}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
