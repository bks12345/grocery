import { Link } from "react-router-dom";
import * as categoryService from "../services/categoryService";
import { useAsync } from "../hooks/useAsync";
import { getCategoryImage, getCategoryImageFallback } from "../data/images";
import SafeImage from "../components/ui/SafeImage";
import { CategoryCardSkeleton } from "../components/ui/Skeletons";

export default function Categories() {
  const { data: categories, loading } = useAsync(
    () => categoryService.getCategories(),
    []
  );
  const { data: counts } = useAsync(
    () => categoryService.getCategoryProductCounts(),
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Shop by Category
      </h1>
      <p className="text-ink-soft text-sm mt-1">
        Browse everything, neatly sorted into {categories?.length ?? "…"} categories.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
        {loading || !categories
          ? Array.from({ length: 12 }).map((_, i) => <CategoryCardSkeleton key={i} />)
          : categories.map((cat) => {
              const count = counts?.[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="card-elevated group flex flex-col items-center text-center gap-3 p-6 rounded-3xl"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-soft">
                    <SafeImage
                      src={getCategoryImage(cat.id)}
                      fallbackSrc={getCategoryImageFallback(cat.id)}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      fallbackClassName={`w-full h-full ${cat.color}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{cat.name}</p>
                    <p className="text-xs text-ink-soft/70 mt-0.5">
                      {count} product{count !== 1 && "s"}
                    </p>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
