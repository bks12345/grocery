const ratingOptions = [4, 3, 2];

export default function FilterSidebar({ filters, onChange, onClear, brands = [], categories = [] }) {
  const toggleBrand = (brand) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: next });
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="card-elevated rounded-3xl p-5 divide-y divide-basil-50">
      <div className="flex items-center justify-between pb-4">
        <h2 className="font-semibold text-ink">Filters</h2>
        <button
          onClick={onClear}
          className="text-xs font-medium text-basil-600 hover:text-basil-700"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div className="py-5 first:pt-0">
        <h3 className="text-sm font-semibold text-ink mb-3">Category</h3>
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={filters.category === ""}
              onChange={() => onChange({ ...filters, category: "" })}
              className="accent-basil-600"
            />
            All categories
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.id}
                onChange={() => onChange({ ...filters, category: cat.id })}
                className="accent-basil-600"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="py-5">
        <h3 className="text-sm font-semibold text-ink mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink-soft">$</span>
            <input
              type="number"
              min="0"
              value={filters.minPrice || ""}
              onChange={(e) =>
                onChange({ ...filters, minPrice: Number(e.target.value) || 0 })
              }
              placeholder="0"
              aria-label="Minimum price"
              className="w-20 px-2 py-1.5 rounded-lg shadow-soft text-sm outline-none focus:shadow-soft-lg transition-shadow"
            />
          </div>
          <span className="text-ink-soft text-sm">–</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink-soft">$</span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice === Infinity ? "" : filters.maxPrice}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...filters,
                  maxPrice: raw === "" ? Infinity : Number(raw),
                });
              }}
              placeholder="No max"
              aria-label="Maximum price"
              className="w-20 px-2 py-1.5 rounded-lg shadow-soft text-sm outline-none focus:shadow-soft-lg transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Brand */}
      <div className="py-5">
        <h3 className="text-sm font-semibold text-ink mb-3">Brand</h3>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="accent-basil-600"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="py-5">
        <h3 className="text-sm font-semibold text-ink mb-3">Rating</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === 0}
              onChange={() => onChange({ ...filters, minRating: 0 })}
              className="accent-basil-600"
            />
            Any rating
          </label>
          {ratingOptions.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r}
                onChange={() => onChange({ ...filters, minRating: r })}
                className="accent-basil-600"
              />
              {r}★ & up
            </label>
          ))}
        </div>
      </div>

      {/* Availability & Bulk */}
      <div className="py-5 flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange({ ...filters, inStockOnly: e.target.checked })
            }
            className="accent-basil-600"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={filters.bulkOnly}
            onChange={(e) =>
              onChange({ ...filters, bulkOnly: e.target.checked })
            }
            className="accent-basil-600"
          />
          Bulk packs only
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={filters.comboOnly}
            onChange={(e) =>
              onChange({ ...filters, comboOnly: e.target.checked })
            }
            className="accent-basil-600"
          />
          Combo deals only
        </label>
      </div>
      </div>
    </aside>
  );
}
