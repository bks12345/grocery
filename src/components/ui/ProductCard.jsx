import { Heart, Plus, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PriceTag from "./PriceTag";
import SafeImage from "./SafeImage";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductImage, getProductImageFallback } from "../../data/images";

export default function ProductCard({ product }) {
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
    <div className="card-elevated group relative flex flex-col h-full rounded-3xl overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {/* {product.isBookable && (
          <span className="text-xs font-semibold bg-basil-600 text-white px-2.5 py-1 rounded-full shadow-soft">
            Book by Part
          </span>
        )} */}
        {product.isCombo && (
          <span className="text-xs font-semibold bg-basil-600 text-white px-2.5 py-1 rounded-full shadow-soft">
            Combo Deal
          </span>
        )}
        {product.isBulk && (
          <span className="text-xs font-semibold bg-mango-400 text-basil-900 px-2.5 py-1 rounded-full shadow-soft">
            Bulk Pack
          </span>
        )}
        {product.oldPrice && (
          <span className="text-xs font-semibold bg-tomato-500 text-white px-2.5 py-1 rounded-full shadow-soft">
            Sale
          </span>
        )}
        {product.isNew && (
          <span className="text-xs font-semibold bg-basil-600 text-white px-2.5 py-1 rounded-full shadow-soft">
            New
          </span>
        )}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={() => toggleWishlist(product)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full glass-panel backdrop-blur-xl shadow-soft hover:scale-105 transition-transform"
      >
        <Heart
          size={17}
          className={saved ? "fill-tomato-500 text-tomato-500" : "text-ink-soft"}
        />
      </button>

      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="block h-36 overflow-hidden bg-basil-50"
      >
        <SafeImage
          src={getProductImage(product)}
          fallbackSrc={getProductImageFallback(product)}
          alt={product.name}
          className="w-full h-36 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-xs uppercase tracking-wide text-ink-soft/70">
          {product.brand}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-ink leading-snug line-clamp-2 hover:text-basil-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-ink-soft">
          <Star size={13} className="fill-mango-400 text-mango-400" />
          <span>{product.rating}</span>
          <span className="text-ink-soft/50">({product.reviewsCount})</span>
        </div>

        <p className="text-xs text-ink-soft/70">{product.weight}</p>

        {/* {product.bulkNote && (
          <p className="text-xs text-basil-600 font-medium">{product.bulkNote}</p>
        )} */}
        {product.bulkNote && product.isCombo && product.comboItems && (
          <p className="text-xs text-basil-600 font-medium">
            {product.comboItems.length} items included
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {product.isBookable ? (
            <>
              <div className="flex flex-col">
                <span className="text-[10px] text-ink-soft/60 uppercase tracking-wide">From</span>
                <PriceTag price={Math.min(...product.parts.map((p) => p.price))} size="sm" />
              </div>
              {/* <Link
                to={`/product/${product.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-basil-600 text-white hover:bg-basil-700 hover:shadow-glow transition-all"
              >
                Book Now
              </Link> */}
            </>
          ) : (
            <>
              <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
              <button
                onClick={handleAdd}
                aria-label={`Add ${product.name} to cart`}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                  added
                    ? "bg-basil-700 scale-105"
                    : "bg-basil-600 hover:bg-basil-700 hover:shadow-glow hover:-translate-y-0.5"
                } text-white`}
              >
                {added ? <Check size={16} /> : <Plus size={18} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
