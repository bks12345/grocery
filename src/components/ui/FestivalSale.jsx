import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, PartyPopper, Sparkles, Plus, Check, ArrowRight } from "lucide-react";
import { festivalSale } from "../../data/festivalSale";
import { useCountdown } from "../../hooks/useCountdown";
import { useAsync } from "../../hooks/useAsync";
import * as productService from "../../services/productService";
import { getProductImage, getProductImageFallback } from "../../data/images";
import { useCart } from "../../context/CartContext";
import PriceTag from "./PriceTag";
import SafeImage from "./SafeImage";
import { ProductGridSkeleton } from "./Skeletons";

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 min-w-[56px] sm:min-w-[64px]">
      <span className="font-display text-lg sm:text-xl font-semibold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-white/70">{label}</span>
    </div>
  );
}

function SaleProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="card-elevated group relative flex flex-col rounded-3xl overflow-hidden bg-white shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[31%] lg:w-[18.4%]">
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 text-xs font-bold bg-tomato-500 text-white px-2.5 py-1 rounded-full shadow-soft">
          -{discountPercent}%
        </span>
      )}

      <Link to={`/product/${product.id}`} className="block h-36 overflow-hidden bg-basil-50">
        <SafeImage
          src={getProductImage(product)}
          fallbackSrc={getProductImageFallback(product)}
          alt={product.name}
          className="w-full h-36 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </Link>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-ink leading-snug line-clamp-2 hover:text-basil-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-ink-soft/70">{product.weight}</p>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
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
        </div>
      </div>
    </div>
  );
}

export default function FestivalSale() {
  const timeLeft = useCountdown(festivalSale.endDate);
  const { data: saleProducts, loading } = useAsync(
    () => productService.getFestivalSaleProducts(),
    []
  );

  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const scrollByAmount = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.82 * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Autoplay: advance every 4s, looping back to the start once the end is
  // reached; paused entirely while the cursor is over the carousel (read
  // via ref so this one interval, created once, always sees the current
  // paused state instead of closing over its value at mount time).
  useEffect(() => {
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: track.clientWidth * 0.82, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Hide entirely once the sale is off or has ended — no empty space left behind.
  if (!festivalSale.active || timeLeft.expired) return null;
  if (!loading && (!saleProducts || saleProducts.length === 0)) return null;

  return (
    <section className="relative bg-gradient-to-br from-tomato-500 via-tomato-500 to-mango-500 overflow-hidden">
      {/* Subtle festive decorations */}
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-basil-400/10 blur-3xl" aria-hidden="true" />
      <PartyPopper
        size={90}
        className="absolute top-6 right-6 text-white/10 rotate-12 hidden md:block"
        aria-hidden="true"
      />
      <Sparkles
        size={48}
        className="absolute bottom-8 left-8 text-white/10 hidden md:block"
        aria-hidden="true"
      />

      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Banner + countdown */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
              {festivalSale.emoji} {festivalSale.discountLabel}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-3">
              {festivalSale.name}
            </h2>
            <p className="text-white/80 text-sm mt-1 max-w-md">{festivalSale.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hrs" />
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <CountdownUnit value={timeLeft.seconds} label="Sec" />
          </div>
        </div>

        {/* Carousel */}
        {loading || !saleProducts ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <div className="relative">
            <div
              ref={trackRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth"
            >
              {saleProducts.map((product) => (
                <SaleProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Nav arrows */}
            <button
              onClick={() => scrollByAmount(-1)}
              aria-label="Previous products"
              className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white shadow-elevated text-ink hover:scale-105 transition-transform"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              aria-label="Next products"
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white shadow-elevated text-ink hover:scale-105 transition-transform"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* View all */}
        <div className="flex justify-center mt-8">
          <Link
            to="/shop?sale=true"
            className="group inline-flex items-center gap-2 bg-white text-tomato-600 px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-elevated hover:-translate-y-0.5 transition-all"
          >
            View All Sale Products
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
