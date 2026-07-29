import { Link, useLocation } from "react-router-dom";
import * as categoryService from "../../services/categoryService";
import { useAsync } from "../../hooks/useAsync";

export default function CategoryBar() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeCategory =
    location.pathname === "/shop" ? params.get("category") : null;
  const { data: categories } = useAsync(() => categoryService.getCategories(), []);

  return (
    <div className="bg-gradient-to-r from-basil-900 via-basil-900 to-basil-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 py-2.5">
          <nav
            aria-label="Shop by category"
            className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
          >
            {(categories || []).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-cream text-basil-900 shadow-soft"
                      : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {location.pathname !== "/order-from-nepal" && (
            <Link
              to="/order-from-nepal"
              className="shrink-0 flex items-center gap-1.5 bg-white text-basil-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full shadow-soft transition-all hover:bg-basil-50 hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              {/* <span className="text-sm sm:text-base leading-none" aria-hidden="true">
                🇳🇵
              </span> */}
              <span className="whitespace-nowrap">Order from Nepal</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
