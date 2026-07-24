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
        <nav
          aria-label="Shop by category"
          className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar"
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
      </div>
    </div>
  );
}
