import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Zap, Banknote, CreditCard, Smartphone, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import * as orderService from "../services/orderService";

const FREE_DELIVERY_THRESHOLD = 700;
const STANDARD_FEE = 49;
const EXPRESS_FEE = 99;

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(initialAddress);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  // `user` loads asynchronously (session restore on refresh isn't instant),
  // so pre-filling via useState's initial value alone would often run
  // before the user is available. Fill in name/phone once they load,
  // without clobbering anything the person has already typed.
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  // clearCart() after a successful order would otherwise make `items` empty
  // while Checkout is still mounted, which — without this flag — would
  // immediately redirect back to /cart instead of on to the confirmation
  // page. This flag tells the empty-cart guard below to stand down once an
  // order has actually been placed.
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  const deliveryFee =
    deliveryMethod === "express"
      ? EXPRESS_FEE
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_FEE;
  const total = subtotal + deliveryFee;

  const handleAddressChange = (field) => (e) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);

    try {
      const { orderId, estimatedDelivery } = await orderService.placeOrder(
        {
          items,
          address,
          deliveryMethod,
          paymentMethod,
          subtotal,
          deliveryFee,
          total,
        },
        user?.id || null
      );

      orderPlacedRef.current = true;
      const itemCount = items.length;
      clearCart();
      navigate("/order-confirmation", {
        replace: true,
        state: { orderId, estimatedDelivery, total, itemCount, paymentMethod },
      });
    } catch (err) {
      setError(err.message || "Something went wrong placing your order.");
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return null; // useEffect above redirects; avoid a flash of the empty form
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>
      <p className="text-ink-soft text-sm mt-1">
        Almost there — just a few details and you're done.
      </p>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Left: forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Delivery address */}
          <div className="card-elevated rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={address.fullName}
                onChange={handleAddressChange("fullName")}
                autoComplete="name"
                required
              />
              <Field
                label="Phone number"
                type="tel"
                value={address.phone}
                onChange={handleAddressChange("phone")}
                autoComplete="tel"
                required
              />
              <Field
                label="Address"
                value={address.addressLine}
                onChange={handleAddressChange("addressLine")}
                autoComplete="street-address"
                required
                className="sm:col-span-2"
              />
              <Field
                label="City"
                value={address.city}
                onChange={handleAddressChange("city")}
                autoComplete="address-level2"
                required
              />
              <Field
                label="State"
                value={address.state}
                onChange={handleAddressChange("state")}
                autoComplete="address-level1"
                required
              />
              <Field
                label="PIN code"
                value={address.pincode}
                onChange={handleAddressChange("pincode")}
                autoComplete="postal-code"
                required
              />
            </div>
          </div>

          {/* Delivery method */}
          <div className="card-elevated rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Delivery Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <RadioCard
                icon={Truck}
                title="Standard Delivery"
                detail={
                  subtotal >= FREE_DELIVERY_THRESHOLD
                    ? "Free — 2 to 3 days"
                    : `$${STANDARD_FEE} — 2 to 3 days`
                }
                selected={deliveryMethod === "standard"}
                onSelect={() => setDeliveryMethod("standard")}
              />
              <RadioCard
                icon={Zap}
                title="Express Delivery"
                detail={`$${EXPRESS_FEE} — next day`}
                selected={deliveryMethod === "express"}
                onSelect={() => setDeliveryMethod("express")}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="card-elevated rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              <RadioCard
                icon={Banknote}
                title="Cash on Delivery"
                detail="Pay when your order arrives"
                selected={paymentMethod === "cod"}
                onSelect={() => setPaymentMethod("cod")}
              />
              <RadioCard
                icon={CreditCard}
                title="Credit / Debit Card"
                detail="Card payment integration coming soon"
                selected={paymentMethod === "card"}
                onSelect={() => setPaymentMethod("card")}
                disabled
              />
              <RadioCard
                icon={Smartphone}
                title="UPI / Mobile Wallet"
                detail="Wallet integration coming soon"
                selected={paymentMethod === "upi"}
                onSelect={() => setPaymentMethod("upi")}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-1">
          <div className="card-elevated rounded-3xl p-6 sticky top-40">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-ink line-clamp-1">{product.name}</p>
                    <p className="text-ink-soft/60 text-xs">Qty {quantity}</p>
                  </div>
                  <span className="text-ink font-medium shrink-0">
                    ${product.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 text-sm mt-4 pt-4 border-t border-basil-50">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="text-ink font-medium">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <span>Delivery</span>
                <span className="text-ink font-medium">
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-basil-50">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-xl font-semibold text-ink">${total}</span>
            </div>

            {error && (
              <p className="text-sm text-tomato-500 mt-3" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={placing}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {placing ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Placing order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...inputProps }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="font-medium text-ink-soft">{label}</span>
      <input
        {...inputProps}
        className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
      />
    </label>
  );
}

function RadioCard({ icon: Icon, title, detail, selected, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-cream"
          : selected
          ? "bg-basil-50 shadow-soft"
          : "bg-cream hover:bg-basil-50/60"
      }`}
    >
      <div
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
          selected && !disabled ? "bg-basil-600 text-white" : "bg-white text-ink-soft shadow-soft"
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-soft/70">{detail}</p>
      </div>
    </button>
  );
}
