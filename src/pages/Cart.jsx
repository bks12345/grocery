import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, ArrowRight, Tag, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProductImage, getProductImageFallback } from "../data/images";
import SafeImage from "../components/ui/SafeImage";
import PriceTag from "../components/ui/PriceTag";
import * as couponService from "../services/couponService";

const FREE_DELIVERY_THRESHOLD = 700;
const DELIVERY_FEE = 49;

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [promoStatus, setPromoStatus] = useState(null); // 'applied' | 'invalid' | null
  const [promoError, setPromoError] = useState("");
  const [applying, setApplying] = useState(false);
  const [discount, setDiscount] = useState(0);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const coupon = await couponService.validateCoupon(promoCode);
      const amount =
        coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      setDiscount(amount);
      setAppliedCode(coupon.code);
      setPromoStatus("applied");
    } catch (err) {
      setDiscount(0);
      setAppliedCode(null);
      setPromoStatus("invalid");
      setPromoError(err.message || "Invalid promo code.");
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
          <ShoppingCart size={26} className="text-basil-600" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Your cart is empty
        </h1>
        <p className="mt-2 text-ink-soft">
          Looks like you haven't added anything yet. Let's fix that.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-basil-600 text-white px-6 py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your Cart</h1>
      <p className="text-ink-soft text-sm mt-1">
        {items.length} item{items.length !== 1 && "s"} in your cart
      </p>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="card-elevated rounded-3xl p-4 flex gap-4 items-center"
            >
              <Link
                to={`/product/${product.id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden bg-basil-50"
              >
                <SafeImage
                  src={getProductImage(product)}
                  fallbackSrc={getProductImageFallback(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-ink-soft/60">
                  {product.brand}
                </p>
                <Link
                  to={`/product/${product.id}`}
                  className="font-medium text-ink hover:text-basil-600 transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-ink-soft/70 mt-0.5">{product.weight}</p>
                <div className="mt-2 sm:hidden">
                  <PriceTag price={product.price} size="sm" />
                </div>
              </div>

              <div className="hidden sm:block">
                <PriceTag price={product.price} size="sm" />
              </div>

              <div className="flex items-center bg-cream shadow-soft rounded-full shrink-0">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="w-8 h-8 flex items-center justify-center hover:bg-basil-50 rounded-full transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-sm font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  aria-label={`Increase quantity of ${product.name}`}
                  className="w-8 h-8 flex items-center justify-center hover:bg-basil-50 rounded-full transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              <p className="hidden md:block w-20 text-right font-semibold text-ink shrink-0">
                ${product.price * quantity}
              </p>

              <button
                onClick={() => removeItem(product.id)}
                aria-label={`Remove ${product.name} from cart`}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-ink-soft hover:bg-tomato-100 hover:text-tomato-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <Link
            to="/shop"
            className="self-start text-sm font-medium text-basil-600 hover:text-basil-700 mt-2"
          >
            ← Continue shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card-elevated rounded-3xl p-6 sticky top-40">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="text-ink font-medium">${subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-basil-600">
                  <span>Discount ({appliedCode})</span>
                  <span className="font-medium">−${discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-ink-soft">
                <span>Delivery</span>
                <span className="text-ink font-medium">
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-ink-soft/60">
                  Add ${FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery
                </p>
              )}
            </div>

            {/* Promo code */}
            <form onSubmit={handleApplyPromo} className="mt-4">
              <label htmlFor="promo" className="text-xs font-medium text-ink-soft">
                Promo code
              </label>
              <div className="relative mt-1.5">
                <Tag
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50"
                />
                <input
                  id="promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoStatus(null);
                  }}
                  placeholder="Try WELCOME10"
                  className="w-full pl-9 pr-16 py-2 rounded-full bg-cream shadow-soft focus:shadow-soft-lg text-sm outline-none transition-shadow"
                />
                <button
                  type="submit"
                  disabled={applying || !promoCode.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-basil-600 hover:text-basil-700 px-2 py-1 disabled:opacity-50 flex items-center gap-1"
                >
                  {applying && <Loader2 size={11} className="animate-spin" />}
                  Apply
                </button>
              </div>
              {promoStatus === "applied" && (
                <p className="text-xs text-basil-600 mt-1.5">Promo code applied!</p>
              )}
              {promoStatus === "invalid" && (
                <p className="text-xs text-tomato-500 mt-1.5">{promoError}</p>
              )}
            </form>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-basil-50">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-xl font-semibold text-ink">${total}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
            >
              Proceed to Checkout <ArrowRight size={17} />
            </button>

            <p className="flex items-center gap-1.5 justify-center text-xs text-ink-soft/60 mt-3">
              <ShoppingBag size={12} /> Secure checkout, cash on delivery available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
