import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import * as adminProductService from "../../services/adminProductService";
import * as adminCategoryService from "../../services/adminCategoryService";
import ProductFormModal from "../../components/admin/ProductFormModal";
import Pagination from "../../components/ui/Pagination";
import { getDiscountPercent, calculateDiscountedPrice } from "../../utils/discount";

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = new, {...} = editing
  const [deletingId, setDeletingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  const loadProducts = async () => {
    try {
      setErrorMessage(null);
      const data = await adminProductService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setErrorMessage(err.message || "Failed to load products from database.");
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
    adminCategoryService.getAllCategories().then(setCategories);
  }, []);

  // Reset to page 1 whenever search, category, stock, or discount filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, stockFilter, discountFilter, pageSize]);

  const handleSave = async (data) => {
    try {
      setErrorMessage(null);
      if (editingProduct?.id) {
        await adminProductService.editProduct(editingProduct.id, data);
      } else {
        await adminProductService.createProduct(data);
      }
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(`Save Failed: ${err.message || "Failed to save product."}`);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmMsg = name
      ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
      : "Are you sure you want to delete this product? This action cannot be undone.";
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(id);
    setErrorMessage(null);
    try {
      await adminProductService.removeProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      const msg = err.message || "Failed to delete product.";
      setErrorMessage(msg);
      alert(`Deletion Failed: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDiscount = async (product, percent) => {
    let updates = {};
    if (percent <= 0) {
      // Revert discount
      updates = {
        price: product.oldPrice || product.price,
        oldPrice: null,
        discountPercent: null,
        isHalfPrice: false,
      };
    } else {
      // Apply percentage discount
      const base = Number(product.oldPrice || product.price) || 0;
      const newPrice = calculateDiscountedPrice(base, percent);
      updates = {
        oldPrice: product.oldPrice || product.price,
        price: newPrice,
        discountPercent: percent,
        isHalfPrice: percent === 50,
      };
    }
    await adminProductService.editProduct(product.id, updates);
    await loadProducts();
  };

  const categoryName = (cat) => {
    if (!cat) return "—";
    if (typeof cat === "object" && cat !== null) {
      if (cat.name) return String(cat.name);
      if (cat.id) {
        return categories.find((c) => c.id === cat.id)?.name || String(cat.id);
      }
      if (cat.slug) {
        return categories.find((c) => c.slug === cat.slug)?.name || String(cat.slug);
      }
      return "—";
    }
    return categories.find((c) => c.id === cat)?.name || String(cat);
  };

  const filtered = (products || []).filter((p) => {
    const s = search.toLowerCase().trim();
    const matchSearch =
      !s ||
      p.name?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s);

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

    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && p.inStock) ||
      (stockFilter === "out_of_stock" && !p.inStock);

    const pct = getDiscountPercent(p);
    const matchDiscount =
      discountFilter === "all" ||
      (discountFilter === "discounted" && pct > 0) ||
      (discountFilter === "regular" && pct === 0);

    return matchSearch && matchCategory && matchStock && matchDiscount;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brand..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-full bg-white shadow-soft text-sm text-ink outline-none cursor-pointer border-none"
          >
            <option value="all">All Categories ({products?.length || 0})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-full bg-white shadow-soft text-sm text-ink outline-none cursor-pointer border-none"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          {/* Discount Filter */}
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-full bg-white shadow-soft text-sm text-ink outline-none cursor-pointer border-none"
          >
            <option value="all">All Pricing</option>
            <option value="discounted">On Sale (% Off)</option>
            <option value="regular">Regular Price Only</option>
          </select>
        </div>

        <button
          onClick={() => setEditingProduct({})}
          className="flex items-center gap-2 bg-basil-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {errorMessage && (
        <div className="bg-tomato-50 border border-tomato-200 text-tomato-700 px-4 py-3 rounded-2xl text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-tomato-500 hover:text-tomato-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

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
                {paginatedProducts.map((p) => {
                  const discount = getDiscountPercent(p);
                  return (
                    <tr key={p.id} className="border-b border-basil-50 last:border-0 hover:bg-basil-50/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-basil-600 text-white text-xs font-semibold shrink-0">
                            {p.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-medium text-ink line-clamp-1">{p.name}</p>
                              {discount > 0 && (
                                <span className="text-[10px] font-bold bg-tomato-100 text-tomato-700 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                                  {discount}% OFF
                                </span>
                              )}
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
                      <td className="px-5 py-3 text-ink font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className={discount > 0 ? "text-tomato-600 font-bold" : ""}>${p.price}</span>
                          {p.oldPrice && (
                            <span className="text-xs text-ink-soft/50 line-through">${p.oldPrice}</span>
                          )}
                        </div>
                      </td>
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
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1">
                            <select
                              value={discount || 0}
                              onChange={(e) => handleSetDiscount(p, Number(e.target.value))}
                              title="Quick Percentage Discount"
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer outline-none transition-all ${
                                discount > 0
                                  ? "bg-tomato-500 text-white hover:bg-tomato-600 shadow-soft"
                                  : "bg-cream text-ink-soft hover:bg-tomato-50 hover:text-tomato-600"
                              }`}
                            >
                              <option value="0" className="bg-white text-ink">0% (Regular)</option>
                              <option value="10" className="bg-white text-ink">10% OFF</option>
                              <option value="15" className="bg-white text-ink">15% OFF</option>
                              <option value="20" className="bg-white text-ink">20% OFF</option>
                              <option value="25" className="bg-white text-ink">25% OFF</option>
                              <option value="30" className="bg-white text-ink">30% OFF</option>
                              <option value="40" className="bg-white text-ink">40% OFF</option>
                              <option value="50" className="bg-white text-ink">50% OFF</option>
                            </select>
                          </div>
                          <button
                            onClick={() => setEditingProduct(p)}
                            aria-label={`Edit ${p.name}`}
                            className="p-2 rounded-full hover:bg-basil-50 text-ink-soft hover:text-basil-600 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            aria-label={`Delete ${p.name}`}
                            className="p-2 rounded-full hover:bg-tomato-100/60 text-ink-soft hover:text-tomato-500 transition-colors"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {products && filtered.length > 0 && (
          <div className="px-5 py-3.5 bg-basil-50/20 border-t border-basil-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-ink-soft">
              Showing <strong className="text-ink font-semibold">{filtered.length > 0 ? startIndex + 1 : 0}</strong> to{" "}
              <strong className="text-ink font-semibold">{Math.min(startIndex + pageSize, filtered.length)}</strong> of{" "}
              <strong className="text-ink font-semibold">{filtered.length}</strong> products
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-ink-soft">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-white border border-basil-100 text-ink font-medium outline-none cursor-pointer"
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
              />
            </div>
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
