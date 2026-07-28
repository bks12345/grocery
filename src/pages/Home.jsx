import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Package } from "lucide-react";
import * as productService from "../services/productService";
import * as categoryService from "../services/categoryService";
import { useAsync } from "../hooks/useAsync";
import { getCategoryImage, getCategoryImageFallback } from "../data/images";
import ProductCard from "../components/ui/ProductCard";
import FestivalSale from "../components/ui/FestivalSale";
import SafeImage from "../components/ui/SafeImage";
import HeroSlider from "../components/ui/HeroSlider";
import { ProductGridSkeleton, CategoryCardSkeleton, ProductCardSkeleton } from "../components/ui/Skeletons";
import Slider from "../components/ui/Slider";
import ScrollReveal from "../components/ui/ScrollReveal";

const heroSlides = [
  {
    eyebrow: "Fresh picks, every morning",
    title: "Pantry staples that feel straight from the source.",
    subtitle:
      "Shop grains, flours, and everyday pantry staples — delivered to your door at prices that make sense.",
    image: getCategoryImage("grains-flour"),
    imageFallback: getCategoryImageFallback("grains-flour"),
    primaryCta: { label: "Shop Now", to: "/shop" },
    secondaryCta: { label: "Explore Bulk Packs", to: "/shop?bulk=true" },
  },
  {
    eyebrow: "Stock up & save",
    title: "Family bulk packs, better value per kg.",
    subtitle:
      "Rice, dal, oil, and atta in bulk sizes built for the whole family — fewer trips to the store, more savings in your pocket.",
    image: getCategoryImage("pulses-beans"),
    imageFallback: getCategoryImageFallback("pulses-beans"),
    primaryCta: { label: "Shop Bulk Packs", to: "/shop?bulk=true" },
    secondaryCta: { label: "Browse All", to: "/shop" },
  },
  {
    eyebrow: "Everyday essentials",
    title: "Cooking essentials, honestly sourced.",
    subtitle:
      "From pure honey to everyday cooking oils — quality you can trust for the essentials that stock your kitchen.",
    image: getCategoryImage("cooking-essentials"),
    imageFallback: getCategoryImageFallback("cooking-essentials"),
    primaryCta: { label: "Shop Essentials", to: "/shop?category=cooking-essentials" },
    secondaryCta: { label: "View Categories", to: "/categories" },
  },
];

const trustPoints = [
  { icon: Truck, label: "Fast Delivery", detail: "Order before 6pm for same-day delivery" },
  { icon: ShieldCheck, label: "Secure Payment", detail: "COD, cards & wallets supported" },
  { icon: RotateCcw, label: "Easy Returns", detail: "7-day hassle-free returns" },
  { icon: Package, label: "Bulk Savings", detail: "Family packs at lower per-kg prices" },
];

export default function Home() {
  const { data: categories, loading: categoriesLoading } = useAsync(
    () => categoryService.getCategories(),
    []
  );
  const { data: featured, loading: featuredLoading } = useAsync(
    () => productService.getFeaturedProducts(),
    []
  );
  const { data: bestSellers, loading: bestSellersLoading } = useAsync(
    () => productService.getBestSellers(),
    []
  );
  const { data: bulkProducts, loading: bulkLoading } = useAsync(
    () => productService.getBulkProducts(),
    []
  );
  const { data: comboDeals, loading: comboLoading } = useAsync(
    () => productService.getComboDeals(),
    []
  );
  const { data: latestProducts, loading: latestLoading } = useAsync(
    () => productService.queryProducts({ sort: "latest", pageSize: 6 }).then((r) => r.items),
    []
  );

  return (
    <div>
      {/* Hero */}
      <HeroSlider slides={heroSlides} />

      {/* Trust bar */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-2">
          <div className="card-elevated rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8">
            {trustPoints.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-basil-50 flex items-center justify-center">
                  <Icon size={18} className="text-basil-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-soft/70 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Festival Sale — hides itself entirely when no sale is active */}
      <FestivalSale />

      {/* Categories */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Shop by Category
            </h2>
            <p className="text-ink-soft text-sm mt-1">Everything you need, neatly sorted.</p>
          </div>
          <Link
            to="/categories"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Slider
          items={categories || []}
          loading={categoriesLoading || !categories}
          skeletonCount={8}
          getKey={(cat) => cat.id}
          ariaLabel="Shop by category"
          autoplay
          autoplayInterval={3500}
          loop
          gapClassName="gap-4"
          slideClassName="basis-[calc((100%-1rem)/2)] sm:basis-[calc((100%-2rem)/3)] md:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-5rem)/6)] xl:basis-[calc((100%-7rem)/8)]"
          renderSkeleton={() => <CategoryCardSkeleton />}
          renderItem={(cat) => (
            <Link
              to={`/shop?category=${cat.id}`}
              className="card-elevated group flex flex-col items-center gap-3 p-5 rounded-3xl h-full"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-soft">
                <SafeImage
                  src={getCategoryImage(cat.id)}
                  fallbackSrc={getCategoryImageFallback(cat.id)}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackClassName={`w-full h-full ${cat.color}`}
                />
              </div>
              <span className="text-sm font-medium text-ink text-center">
                {cat.name}
              </span>
            </Link>
          )}
        />
      </section>
      </ScrollReveal>

      {/* Bulk deals — highlighted per spec */}
      <section className="relative bg-gradient-to-br from-basil-900 via-basil-900 to-basil-700 overflow-hidden">
        {/* Decorative glow shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-mango-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-basil-400/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-mango-400 text-xs font-semibold uppercase tracking-wide">
                Stock up & save
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-cream mt-1">
                Family Bulk Packs
              </h2>
              <p className="text-cream/60 text-sm mt-1 max-w-md">
                Buy in bulk for the week or the month — better value per kg for the whole family.
              </p>
            </div>
            <Link
              to="/shop?bulk=true"
              className="group hidden sm:flex items-center gap-1 text-sm font-medium text-mango-400 hover:text-mango-500"
            >
              View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {bulkLoading || !bulkProducts ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <>
              {/* Mobile: horizontal scroll-snap slider */}
              <div className="sm:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
                {bulkProducts.map((product) => (
                  <div key={product.id} className="snap-start shrink-0 w-[78%]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Tablet & up: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {bulkProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Combo deals */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-basil-600 text-xs font-semibold uppercase tracking-wide">
              Bundle & save
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1">
              Combo Deals
            </h2>
            <p className="text-ink-soft text-sm mt-1 max-w-md">
              Handpicked bundles at a better price than buying each item separately.
            </p>
          </div>
          <Link
            to="/shop?combo=true"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Slider
          items={comboDeals || []}
          loading={comboLoading || !comboDeals}
          skeletonCount={4}
          ariaLabel="Combo deals"
          autoplay
          autoplayInterval={4000}
          loop
          showDots
          gapClassName="gap-5"
          slideClassName="basis-full sm:basis-[calc((100%-1.25rem)/2)] md:basis-[calc((100%-2.5rem)/3)] lg:basis-[calc((100%-3.75rem)/4)]"
          renderSkeleton={() => <ProductCardSkeleton />}
          renderItem={(product) => <ProductCard product={product} />}
        />
      </section>
      </ScrollReveal>

      {/* Featured products */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Featured Products
            </h2>
            <p className="text-ink-soft text-sm mt-1">Hand-picked favorites from the store.</p>
          </div>
          <Link
            to="/shop?featured=true"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredLoading || !featured ? (
          <ProductGridSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      </ScrollReveal>

      {/* Latest products */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Latest Products
            </h2>
            <p className="text-ink-soft text-sm mt-1">Freshly added to the store.</p>
          </div>
          <Link
            to="/shop?sort=latest"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Slider
          items={latestProducts || []}
          loading={latestLoading || !latestProducts}
          skeletonCount={4}
          ariaLabel="Latest products"
          autoplay
          autoplayInterval={3000}
          loop
          gapClassName="gap-5"
          slideClassName="basis-full sm:basis-[calc((100%-1.25rem)/2)] md:basis-[calc((100%-2.5rem)/3)] lg:basis-[calc((100%-3.75rem)/4)]"
          renderSkeleton={() => <ProductCardSkeleton />}
          renderItem={(product) => <ProductCard product={product} />}
        />
      </section>
      </ScrollReveal>

      {/* Best sellers */}
      <section className="bg-gradient-to-b from-mango-100/50 to-mango-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                Best Sellers
              </h2>
              <p className="text-ink-soft text-sm mt-1">Most loved by our customers.</p>
            </div>
            <Link
              to="/shop?bestseller=true"
              className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
            >
              View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {bestSellersLoading || !bestSellers ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
