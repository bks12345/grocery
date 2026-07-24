import { Link } from "react-router-dom";
import { ArrowRight, Trash2, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ui/ProductCard";

export default function Wishlist() {
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-tomato-100 flex items-center justify-center">
          <Heart size={24} className="text-tomato-500" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-ink-soft">
          Save products you love here so you can find them again easily.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-basil-600 text-white px-6 py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          Browse Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Your Wishlist</h1>
          <p className="text-ink-soft text-sm mt-1">
            {items.length} item{items.length !== 1 && "s"} saved
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-tomato-500 transition-colors"
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
