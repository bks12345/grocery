import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Star, ChevronRight, Check, X } from "lucide-react";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { getProductImage, getProductImageFallback } from "../data/images";
import PriceTag from "../components/ui/PriceTag";
import SafeImage from "../components/ui/SafeImage";
import ProductCard from "../components/ui/ProductCard";
import PostcodeCheck from "../components/ui/PostcodeCheck";
import ComingSoon from "./ComingSoon";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedParts, setSelectedParts] = useState([]);

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [related, setRelated] = useState([]);
  const [comboItems, setComboItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    setSelectedParts([]);

    productService
      .getProduct(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        const [cat, relatedProducts, combo] = await Promise.all([
          categoryService.getCategory(p.category).catch(() => null),
          productService.getRelatedProducts(p),
          p.isCombo ? productService.getComboItemDetails(p) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setCategory(cat);
        setRelated(relatedProducts);
        setComboItems(combo);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return <ComingSoon title="Product not found" />;
  }

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 animate-pulse">
          <div className="bg-basil-50 rounded-3xl h-80 sm:h-[26rem]" />
          <div className="flex flex-col gap-3">
            <div className="h-3 w-24 bg-basil-50 rounded-full" />
            <div className="h-8 w-3/4 bg-basil-50 rounded-full" />
            <div className="h-4 w-40 bg-basil-50 rounded-full mt-2" />
            <div className="h-8 w-32 bg-basil-50 rounded-full mt-4" />
            <div className="h-20 w-full bg-basil-50 rounded-2xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  const saved = isInWishlist(product.id);

  const togglePart = (partId) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((p) => p !== partId) : [...prev, partId]
    );
  };

  const chosenParts = product.isBookable
    ? product.parts.filter((part) => selectedParts.includes(part.id))
    : [];
  const bookingTotal = chosenParts.reduce((sum, part) => sum + part.price, 0);

  const handleAddToCart = () => {
    if (product.isBookable) {
      if (chosenParts.length === 0) return;
      const bookingProduct = {
        ...product,
        id: `${product.id}::${[...selectedParts].sort().join("-")}`,
        name: `${product.name} — ${chosenParts.map((p) => p.name).join(", ")}`,
        price: bookingTotal,
        oldPrice: null,
        weight: chosenParts.map((p) => p.weight).join(" + "),
        bookedParts: chosenParts,
        baseProductId: product.id,
      };
      addItem(bookingProduct, 1);
    } else {
      addItem(product, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-soft mb-8">
        <Link to="/" className="hover:text-basil-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-basil-600">Shop</Link>
        {category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${category.id}`} className="hover:text-basil-600">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-ink line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative bg-basil-50 rounded-3xl h-80 sm:h-[26rem] md:h-[32rem] overflow-hidden shadow-elevated">
          <SafeImage
            src={getProductImage(product)}
            fallbackSrc={getProductImageFallback(product)}
            alt={product.name}
            className="w-full h-full object-cover"
            fallbackClassName="h-full"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.isBookable && (
              <span className="text-xs font-semibold bg-basil-600 text-white px-2.5 py-1 rounded-full">
                Book by Part
              </span>
            )}
            {product.isCombo && (
              <span className="text-xs font-semibold bg-basil-600 text-white px-2.5 py-1 rounded-full">
                Combo Deal
              </span>
            )}
            {product.isBulk && (
              <span className="text-xs font-semibold bg-mango-400 text-basil-900 px-2.5 py-1 rounded-full">
                Bulk Pack
              </span>
            )}
            {product.oldPrice && (
              <span className="text-xs font-semibold bg-tomato-500 text-white px-2.5 py-1 rounded-full">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wide text-ink-soft/70">
            {product.brand}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-3 text-sm">
            <div className="flex items-center gap-1 text-mango-500">
              <Star size={16} className="fill-mango-400 text-mango-400" />
              <span className="font-medium text-ink">{product.rating}</span>
            </div>
            <span className="text-ink-soft">({product.reviewsCount} reviews)</span>
            <span className="text-ink-soft/40">•</span>
            <span className={product.inStock ? "text-basil-600 font-medium" : "text-tomato-500 font-medium"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-5">
            {product.isBookable ? (
              <>
                <PriceTag
                  price={selectedParts.length > 0 ? bookingTotal : Math.min(...product.parts.map((p) => p.price))}
                  size="lg"
                />
                <p className="text-sm text-ink-soft mt-1.5">
                  {selectedParts.length > 0
                    ? `${chosenParts.length} part${chosenParts.length !== 1 ? "s" : ""} selected`
                    : `Starting price — select parts below`}
                </p>
              </>
            ) : (
              <>
                <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
                <p className="text-sm text-ink-soft mt-1.5">{product.weight}</p>
              </>
            )}
            {product.bulkNote && (
              <p className="text-sm text-basil-600 font-medium mt-1">{product.bulkNote}</p>
            )}
          </div>

          <p className="text-ink-soft leading-relaxed mt-5 max-w-lg">
            {product.description}
          </p>

          {product.isBookable && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-sm font-semibold text-ink mb-1">Select the parts you want</h2>
              <p className="text-xs text-ink-soft/70 mb-3">
                Prices and weights are per part. Pick one or more.
              </p>
              <div className="card-elevated rounded-2xl divide-y divide-basil-50">
                {product.parts.map((part) => {
                  const checked = selectedParts.includes(part.id);
                  return (
                    <label
                      key={part.id}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-basil-50/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePart(part.id)}
                        className="accent-basil-600 w-4 h-4 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink">{part.name}</p>
                        <p className="text-xs text-ink-soft/60">{part.weight}</p>
                      </div>
                      <span className="text-sm font-medium text-ink shrink-0">
                        ${part.price}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedParts.length > 0 && (
                <div className="flex items-center justify-between px-1 mt-3 text-sm">
                  <span className="text-ink-soft">
                    {chosenParts.length} part{chosenParts.length !== 1 ? "s" : ""} selected
                  </span>
                  <span className="font-semibold text-ink">Total: ${bookingTotal}</span>
                </div>
              )}
            </div>
          )}

          {product.isCombo && comboItems.length > 0 && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-sm font-semibold text-ink mb-3">What's included</h2>
              <div className="card-elevated rounded-2xl divide-y divide-basil-50">
                {comboItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-basil-50/50 transition-colors"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-basil-50">
                      <SafeImage
                        src={getProductImage(item)}
                        fallbackSrc={getProductImageFallback(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink line-clamp-1">{item.name}</p>
                      <p className="text-xs text-ink-soft/60">{item.weight}</p>
                    </div>
                    <span className="text-sm text-ink-soft shrink-0">${item.price}</span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center justify-between px-1 mt-3 text-sm">
                <span className="text-ink-soft">
                  Buying separately: $
                  {comboItems.reduce((sum, item) => sum + item.price, 0)}
                </span>
                <span className="font-semibold text-basil-600">
                  You save ${comboItems.reduce((sum, item) => sum + item.price, 0) - product.price}
                </span>
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="flex flex-wrap items-center gap-3 mt-7">
            {!product.isBookable && (
              <div className="flex items-center bg-white shadow-soft rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-basil-50 rounded-full transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-basil-50 rounded-full transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || (product.isBookable && selectedParts.length === 0)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-basil-600 text-white font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {added ? (
                <>
                  <Check size={17} /> {product.isBookable ? "Booked" : "Added"}
                </>
              ) : product.isBookable ? (
                selectedParts.length === 0 ? "Select a part to book" : `Book ${chosenParts.length} part${chosenParts.length !== 1 ? "s" : ""} — $${bookingTotal}`
              ) : (
                "Add to Cart"
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              aria-pressed={saved}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-shadow"
            >
              <Heart
                size={18}
                className={saved ? "fill-tomato-500 text-tomato-500" : "text-ink-soft"}
              />
            </button>
          </div>

          {!product.inStock && (
            <p className="flex items-center gap-1.5 text-sm text-tomato-500 mt-3">
              <X size={15} /> Currently unavailable — check back soon.
            </p>
          )}

          <PostcodeCheck className="mt-7 pt-6 border-t border-basil-50 max-w-lg" />
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-ink mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
