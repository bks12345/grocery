import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, PackageSearch, ArrowRight } from "lucide-react";
import * as productService from "../../services/productService";

/**
 * Category -> Product picker. Selecting a category loads only that
 * category's products into the second dropdown (via the same
 * productService.queryProducts the rest of the Shop page uses, so it stays
 * in sync with admin-added/edited products). Picking a product jumps
 * straight to its detail page.
 */
export default function CategoryProductPicker({ categories = [] }) {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setProductId("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setProductId("");
    productService
      .queryProducts({ category: categoryId, pageSize: 200, sort: "relevance" })
      .then((res) => {
        if (!cancelled) setProducts(res.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const handleGo = () => {
    if (productId) navigate(`/product/${productId}`);
  };

  return (
    <div className="rounded-3xl bg-white shadow-soft p-5 mb-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
        <Layers size={16} className="text-basil-600" aria-hidden="true" />
        Find a product by category
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="category-picker" className="sr-only">
            Category
          </label>
          <select
            id="category-picker"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg text-sm outline-none transition-shadow"
          >
            <option value="">Select a category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="product-picker" className="sr-only">
            Product
          </label>
          <select
            id="product-picker"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={!categoryId || loading}
            className="w-full px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg text-sm outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!categoryId
                ? "Select a category first"
                : loading
                ? "Loading products…"
                : products.length === 0
                ? "No products in this category"
                : "Select a product…"}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGo}
          disabled={!productId}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-basil-600 text-white text-sm font-semibold hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <PackageSearch size={15} aria-hidden="true" />
          View
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
