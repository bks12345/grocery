import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Plus, Check } from "lucide-react";
import PriceTag from "./PriceTag";
import SafeImage from "./SafeImage";
import { useCart } from "../../context/CartContext";
import { getProductImage, getProductImageFallback } from "../../data/images";

function LatestProductRow({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const discountPct = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className="flex items-center gap-3 rounded-2xl p-2 hover:bg-basil-50/60 transition-colors">
      <Link
        to={`/product/${product.id}`}
        className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-basil-50"
      >
        <SafeImage
          src={getProductImage(product)}
          fallbackSrc={getProductImageFallback(product)}
          alt={product.name}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full"
        />
        {discountPct > 0 && (
          <span className="absolute top-1 left-1 text-[9px] font-semibold bg-tomato-500 text-white px-1.5 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-ink hover:text-basil-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1">
          <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
        </div>
      </div>

      <button
        onClick={handleAdd}
        aria-label={`Add ${product.name} to cart`}
        className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
          added ? "bg-basil-700 scale-105" : "bg-basil-600 hover:bg-basil-700 hover:shadow-glow"
        } text-white`}
      >
        {added ? <Check size={15} /> : <Plus size={16} />}
      </button>
    </div>
  );
}

function LatestProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-basil-50" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-3/4 bg-basil-50 rounded-full" />
        <div className="h-5 w-16 bg-basil-50 rounded-full" />
      </div>
      <div className="w-9 h-9 shrink-0 rounded-full bg-basil-50" />
    </div>
  );
}

export default function LatestProductsPanel({ products, loading }) {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-5 flex flex-col lg:h-[480px]">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-display text-lg font-semibold text-ink">Latest Products</h2>
        <Link
          to="/shop?sort=latest"
          className="group flex items-center gap-1 text-xs font-medium text-basil-600 hover:text-basil-700"
        >
          View all
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-1 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {loading || !products
          ? Array.from({ length: 5 }).map((_, i) => <LatestProductRowSkeleton key={i} />)
          : products.map((product) => <LatestProductRow key={product.id} product={product} />)}
      </div>
    </div>
  );
}
