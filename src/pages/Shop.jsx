import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, LayoutGrid, List as ListIcon, AlertTriangle, SearchX } from "lucide-react";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { useAsync } from "../hooks/useAsync";
import ProductCard from "../components/ui/ProductCard";
import ProductListItem from "../components/ui/ProductListItem";
import FilterSidebar from "../components/ui/FilterSidebar";
import Pagination from "../components/ui/Pagination";
import { ProductGridSkeleton, ProductListSkeleton } from "../components/ui/Skeletons";

const PAGE_SIZE = 8;
const VIEW_MODE_KEY = "daalbhat_shop_view_mode";

const defaultFilters = {
  category: "",
  minPrice: 0,
  maxPrice: Infinity,
  brands: [],
  minRating: 0,
  inStockOnly: false,
  bulkOnly: false,
  comboOnly: false,
  festivalSaleOnly: false,
  bestSellerOnly: false,
  newOnly: false,
  featuredOnly: false,
  discountOnly: false,
};

const promoLabels = {
  "flash-sale": "Flash Sale",
  "limited-time": "Limited-Time Deals",
  "weekly-deals": "Weekly Deals",
  clearance: "Clearance Sale",
};

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
  { value: "latest", label: "Latest" },
  { value: "best-selling", label: "Best Selling" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...defaultFilters,
    category: searchParams.get("category") || "",
    bulkOnly: searchParams.get("bulk") === "true",
    comboOnly: searchParams.get("combo") === "true",
    festivalSaleOnly: searchParams.get("sale") === "true",
    bestSellerOnly: searchParams.get("bestseller") === "true",
    newOnly: searchParams.get("new") === "true",
    featuredOnly: searchParams.get("featured") === "true",
    discountOnly: searchParams.get("discount") === "true",
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "relevance");
  const [promo, setPromo] = useState(() => searchParams.get("promo") || "");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_MODE_KEY) || "grid"
  );

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // Storage unavailable — view choice just won't persist across visits
    }
  };

  // Reference/taxonomy data — fetched once via the service layer
  const { data: categories } = useAsync(() => categoryService.getCategories(), []);
  const { data: brands } = useAsync(() => productService.getBrands(), []);

  // The actual product query — this is what a real backend list endpoint
  // would receive as query params (GET /api/products?category=...&page=...)
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .queryProducts({ ...filters, search, sort, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, search, sort, page]);

  // Re-sync when the user arrives via a link with different query params
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category") || "",
      bulkOnly: searchParams.get("bulk") === "true",
      comboOnly: searchParams.get("combo") === "true",
      festivalSaleOnly: searchParams.get("sale") === "true",
      bestSellerOnly: searchParams.get("bestseller") === "true",
      newOnly: searchParams.get("new") === "true",
      featuredOnly: searchParams.get("featured") === "true",
      discountOnly: searchParams.get("discount") === "true",
    }));
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort") || "relevance");
    setPromo(searchParams.get("promo") || "");
  }, [searchParams]);

  useEffect(() => setPage(1), [filters, search, sort]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const activeCategory = categories?.find((c) => c.id === filters.category);

  const pageTitle =
    activeCategory?.name ||
    (filters.bestSellerOnly && "Best Sellers") ||
    (filters.newOnly && "Latest Products") ||
    (filters.featuredOnly && "Featured Products") ||
    (filters.bulkOnly && "Family Bulk Packs") ||
    (filters.comboOnly && "Combo Deals") ||
    (filters.festivalSaleOnly && "Festival Offers") ||
    (filters.discountOnly && (promoLabels[promo] || "Deals & Discounts")) ||
    "Shop All Products";

  // Single source of truth for turning the current view (filters + search +
  // sort + promo label) into a URL query string, used by every handler below
  // so none of them can silently drop a param the others rely on.
  const buildParams = ({ filters: f, search: s, sort: so, promo: pr }) => {
    const params = {};
    if (f.category) params.category = f.category;
    if (f.bulkOnly) params.bulk = "true";
    if (f.comboOnly) params.combo = "true";
    if (f.festivalSaleOnly) params.sale = "true";
    if (f.bestSellerOnly) params.bestseller = "true";
    if (f.newOnly) params.new = "true";
    if (f.featuredOnly) params.featured = "true";
    if (f.discountOnly) params.discount = "true";
    if (pr) params.promo = pr;
    if (s.trim()) params.search = s.trim();
    if (so && so !== "relevance") params.sort = so;
    return params;
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
    setSort("relevance");
    setPromo("");
    setSearchParams({});
  };

  const handleFiltersChange = (next) => {
    setFilters(next);
    setSearchParams(buildParams({ filters: next, search, sort, promo }));
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearchParams(buildParams({ filters, search: value, sort, promo }));
  };

  const handleSortChange = (value) => {
    setSort(value);
    setSearchParams(buildParams({ filters, search, sort: value, promo }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {pageTitle}
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          {loading
            ? "Searching..."
            : `${result.total} product${result.total !== 1 ? "s" : ""} found`}
          {search.trim() && !loading && (
            <>
              {" "}
              for <span className="font-medium text-ink">"{search}"</span>
            </>
          )}
        </p>
      </div>

      {/* Search this list */}
      <div className="relative max-w-md mb-6">
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
        />
        <input
          id="shop-search"
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products by name, brand, or category..."
          className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg text-sm placeholder:text-ink-soft/50 outline-none transition-shadow"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-basil-50 text-ink-soft"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop sidebar (temporarily hidden, kept for future use)
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            brands={brands || []}
            categories={categories || []}
          />
        </div>
        */}

        {/* Mobile filter drawer (temporarily hidden, kept for future use)
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-cream p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Filters</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 rounded-full hover:bg-basil-50"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
                brands={brands || []}
            categories={categories || []}
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-4 py-2.5 rounded-full bg-basil-600 text-white font-medium"
              >
                Show {result.total} results
              </button>
            </div>
          </div>
        )}
        */}

        {/* Product grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Filters toggle (temporarily hidden along with the sidebar, kept for future use)
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-full shadow-soft text-sm font-medium bg-white"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            */}

            <div className="flex items-center gap-2 ml-auto">
              {/* Grid/List view toggle */}
              <div className="flex items-center gap-0.5 bg-white shadow-soft rounded-full p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    viewMode === "grid" ? "bg-basil-600 text-white" : "text-ink-soft hover:bg-basil-50"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    viewMode === "list" ? "bg-basil-600 text-white" : "text-ink-soft hover:bg-basil-50"
                  }`}
                >
                  <ListIcon size={15} />
                </button>
              </div>

              <label htmlFor="sort" className="text-sm text-ink-soft hidden sm:inline">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm shadow-soft rounded-full px-3 py-2 outline-none focus:shadow-soft-lg transition-shadow bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 mx-auto rounded-full bg-tomato-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-tomato-500" aria-hidden="true" />
              </div>
              <p className="mt-4 text-ink-soft">
                Something went wrong loading products. Please try again.
              </p>
            </div>
          ) : loading ? (
            viewMode === "grid" ? (
              <ProductGridSkeleton count={PAGE_SIZE} />
            ) : (
              <ProductListSkeleton count={PAGE_SIZE} />
            )
          ) : result.items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
                <SearchX size={24} className="text-basil-600" aria-hidden="true" />
              </div>
              <p className="mt-4 text-ink-soft">
                No products match your filters. Try adjusting or clearing them.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-5 py-2 rounded-full bg-basil-600 text-white text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                  {result.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {result.items.map((product) => (
                    <ProductListItem key={product.id} product={product} />
                  ))}
                </div>
              )}
              <Pagination
                currentPage={page}
                totalPages={result.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
