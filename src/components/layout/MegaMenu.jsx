import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import * as categoryService from "../../services/categoryService";
import { useAsync } from "../../hooks/useAsync";
import { getCategoryImage, getCategoryImageFallback } from "../../data/images";
import SafeImage from "../ui/SafeImage";

export default function MegaMenu({ onNavigate }) {
  const { data: categories } = useAsync(() => categoryService.getCategories(), []);

  return (
    <div className="w-[min(92vw,880px)] p-6 grid gap-6">
      {/* Category + subcategory grid */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-5">
        {(categories || []).map((cat) => (
          <div key={cat.id}>
            <Link
              to={`/shop?category=${cat.id}`}
              onClick={onNavigate}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-basil-600 transition-colors"
            >
              {cat.name}
            </Link>
            <ul className="mt-2 flex flex-col gap-1.5">
              {(cat.subcategories || []).map((sub) => (
                <li key={sub}>
                  <Link
                    to={`/shop?category=${cat.id}&search=${encodeURIComponent(sub)}`}
                    onClick={onNavigate}
                    className="text-sm text-ink-soft hover:text-basil-600 transition-colors"
                  >
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Promo panel */}
      {/* <div className="relative rounded-2xl overflow-hidden bg-basil-900 flex flex-col justify-end p-5 min-h-[220px]">
        <SafeImage
          src={getCategoryImage("spices")}
          fallbackSrc={getCategoryImageFallback("spices")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          fallbackClassName="absolute inset-0 w-full h-full"
        />
        <div className="relative">
          <span className="text-mango-400 text-xs font-semibold uppercase tracking-wide">
            New in
          </span>
          <p className="text-cream font-display text-lg font-semibold mt-1">
            Spices &amp; Seasonings
          </p>
          <Link
            to="/shop?category=spices"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-sm font-medium text-cream mt-3 hover:text-mango-400 transition-colors"
          >
            Shop now <ArrowRight size={14} />
          </Link>
        </div>
      </div> */}
    </div>
  );
}
