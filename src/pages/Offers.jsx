import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Copy, Check, ArrowRight } from "lucide-react";
import * as couponService from "../services/couponService";
import * as productService from "../services/productService";
import ProductCard from "../components/ui/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeletons";

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [saleProducts, setSaleProducts] = useState(null);
  const [bulkProducts, setBulkProducts] = useState(null);
  const [comboDeals, setComboDeals] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    couponService.getActiveCoupons().then(setCoupons);
    productService.queryProducts({ sort: "price-high-low", pageSize: 100 }).then((res) =>
      setSaleProducts(res.items.filter((p) => p.oldPrice))
    );
    productService.getBulkProducts().then(setBulkProducts);
    productService.getComboDeals().then(setComboDeals);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div>
      <section className="bg-basil-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-basil-900">
            Offers & Deals
          </h1>
          <p className="text-ink-soft mt-3">
            Coupon codes, combo bundles, sale items, and bulk-pack savings — all in one place.
          </p>
        </div>
      </section>

      {/* Coupons */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-display text-2xl font-semibold text-ink mb-6">Coupon Codes</h2>
        {coupons.length === 0 ? (
          <p className="text-ink-soft text-sm">No active coupons right now — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="card-elevated rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-mango-100 flex items-center justify-center">
                    <Tag size={16} className="text-mango-600" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink tracking-wide">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-ink-soft/70">{coupon.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-basil-600 hover:text-basil-700 shrink-0 px-3 py-1.5 rounded-full hover:bg-basil-50 transition-colors"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check size={13} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-ink-soft/60 mt-3">
          Apply a code at checkout from your{" "}
          <Link to="/cart" className="text-basil-600 hover:text-basil-700">Cart</Link>.
        </p>
      </section>

      {/* Combo deals */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink">Combo Deals</h2>
          <Link
            to="/shop?combo=true"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {!comboDeals ? (
          <ProductGridSkeleton count={3} />
        ) : comboDeals.length === 0 ? (
          <p className="text-ink-soft text-sm">No combo deals right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {comboDeals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Bulk deals */}
      <section className="relative bg-gradient-to-br from-basil-900 via-basil-900 to-basil-700 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-mango-400/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-cream">
              Family Bulk Packs
            </h2>
            <Link
              to="/shop?bulk=true"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mango-400 hover:text-mango-500"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
          {!bulkProducts ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
              {bulkProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sale items */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-display text-2xl font-semibold text-ink mb-6">On Sale</h2>
        {!saleProducts ? (
          <ProductGridSkeleton count={4} />
        ) : saleProducts.length === 0 ? (
          <p className="text-ink-soft text-sm">No sale items right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {saleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
