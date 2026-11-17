import { Heart, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PriceTag from "./PriceTag";
import SafeImage from "./SafeImage";
import { useWishlist } from "../../context/WishlistContext";
import { getProductImage, getProductImageFallback } from "../../data/images";
import { getDiscountPercent } from "../../utils/discount";

export default function ProductListItem({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const discountPercent = getDiscountPercent(product);

  return (
    <div className="card-elevated rounded-3xl p-4 flex items-center gap-4">
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-basil-50"
      >
        <SafeImage
          src={getProductImage(product)}
          fallbackSrc={getProductImageFallback(product)}
          alt={product.name}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full"
        />
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {discountPercent > 0 && !product.isCombo ? (
            <span className={`text-[10px] font-bold bg-tomato-500 text-white px-2 py-0.5 rounded-full shadow-soft ${discountPercent >= 50 ? "animate-pulse" : ""}`}>
              {discountPercent}% OFF
            </span>
          ) : null}
          {product.isCombo && (
            <span className="text-[10px] font-semibold bg-basil-600 text-white px-2 py-0.5 rounded-full">
              Combo
            </span>
          )}
          {product.isBulk && (
            <span className="text-[10px] font-semibold bg-mango-400 text-basil-900 px-2 py-0.5 rounded-full">
              Bulk
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-ink-soft/60">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-ink hover:text-basil-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-ink-soft mt-1">
          <Star size={12} className="fill-mango-400 text-mango-400" />
          <span>{product.rating}</span>
          <span className="text-ink-soft/50">({product.reviewsCount})</span>
          <span className="text-ink-soft/40 mx-1">•</span>
          <span>{product.weight}</span>
        </div>

        {product.description && (
          <p className="hidden sm:block text-sm text-ink-soft/80 mt-1.5 line-clamp-2 max-w-xl">
            {product.description}
          </p>
        )}

        {product.bulkNote && (
          <p className="text-xs text-basil-600 font-medium mt-1">{product.bulkNote}</p>
        )}
        {product.isCombo && product.comboItems && (
          <p className="text-xs text-basil-600 font-medium mt-1">
            {product.comboItems.length} items included
          </p>
        )}
      </div>

      {/* Price + actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {product.isBookable ? (
          <>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-ink-soft/60 uppercase tracking-wide">From</span>
              <PriceTag price={Math.min(...product.parts.map((p) => p.price))} size="sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={saved}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-shadow"
              >
                <Heart size={15} className={saved ? "fill-tomato-500 text-tomato-500" : "text-ink-soft"} />
              </button>
            </div>
          </>
        ) : (
          <>
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={saved}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-shadow"
              >
                <Heart size={15} className={saved ? "fill-tomato-500 text-tomato-500" : "text-ink-soft"} />
              </button>
              <Link
                to={`/product/${product.id}`}
                aria-label={`View ${product.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-basil-600 hover:bg-basil-700 hover:shadow-glow transition-all text-white"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
