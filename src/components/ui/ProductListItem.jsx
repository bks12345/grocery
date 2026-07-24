import { Heart, Plus, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PriceTag from "./PriceTag";
import SafeImage from "./SafeImage";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductImage, getProductImageFallback } from "../../data/images";

export default function ProductListItem({ product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

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
          {product.isBookable && (
            <span className="text-[10px] font-semibold bg-basil-600 text-white px-2 py-0.5 rounded-full">
              Book by Part
            </span>
          )}
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
          {product.oldPrice && (
            <span className="text-[10px] font-semibold bg-tomato-500 text-white px-2 py-0.5 rounded-full">
              Sale
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
              <Link
                to={`/product/${product.id}`}
                className="px-3 py-2 rounded-full text-xs font-semibold bg-basil-600 text-white hover:bg-basil-700 hover:shadow-glow transition-all"
              >
                Book Now
              </Link>
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
              <button
                onClick={handleAdd}
                aria-label={`Add ${product.name} to cart`}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                  added
                    ? "bg-basil-700 scale-105"
                    : "bg-basil-600 hover:bg-basil-700 hover:shadow-glow"
                } text-white`}
              >
                {added ? <Check size={15} /> : <Plus size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
