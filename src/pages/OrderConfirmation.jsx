import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2, Package, Calendar, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const location = useLocation();
  const state = location.state;

  // Guard against someone landing here directly without placing an order
  if (!state?.orderId) {
    return <Navigate to="/" replace />;
  }

  const { orderId, estimatedDelivery, total, itemCount, paymentMethod } = state;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-basil-600" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
        Order placed!
      </h1>
      <p className="mt-2 text-ink-soft">
        Thanks for shopping with us — a confirmation has been sent for order{" "}
        <span className="font-medium text-ink">#{orderId}</span>.
      </p>

      <div className="card-elevated rounded-3xl p-6 mt-8 text-left">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-ink-soft">Order number</span>
          <span className="text-sm font-medium text-ink">#{orderId}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-basil-50">
          <span className="text-sm text-ink-soft">Items</span>
          <span className="text-sm font-medium text-ink">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-basil-50">
          <span className="text-sm text-ink-soft">Payment method</span>
          <span className="text-sm font-medium text-ink">
            {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-basil-50">
          <span className="text-sm text-ink-soft">Total paid</span>
          <span className="font-display text-lg font-semibold text-ink">${total}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center mt-6 text-sm text-ink-soft">
        <Package size={16} className="text-basil-600" />
        <span>Estimated delivery:</span>
        <span className="font-medium text-ink flex items-center gap-1">
          <Calendar size={14} /> {estimatedDelivery}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-basil-600 text-white px-6 py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          Continue Shopping <ArrowRight size={17} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white shadow-soft text-ink px-6 py-3 rounded-full font-medium hover:shadow-soft-lg transition-shadow"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
