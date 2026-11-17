import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Lock,
  LogOut,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/authService";
import * as orderService from "../services/orderService";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Order History", icon: Package },
  { id: "security", label: "Security", icon: Lock },
];

export default function Account() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { state: { from: "/account" }, replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={28} />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-basil-600 text-white flex items-center justify-center font-display text-xl font-semibold shrink-0">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
          <p className="text-ink-soft text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar nav */}
        <nav className="card-elevated rounded-3xl p-3 flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-basil-50 text-basil-700"
                  : "text-ink-soft hover:bg-basil-50/60"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-tomato-500 hover:bg-tomato-100/50 transition-colors whitespace-nowrap"
          >
            <LogOut size={16} /> Log Out
          </button>
        </nav>

        {/* Tab content */}
        <div>
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "orders" && <OrdersTab userId={user.id} />}
          {activeTab === "security" && <SecurityTab userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-elevated rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold text-ink mb-4">
        Personal Information
      </h2>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <Field label="Full name" value={form.name} onChange={handleChange("name")} required />
        <Field
          label="Email (Primary Login - Unchangeable)"
          type="email"
          value={form.email}
          disabled
          readOnly
        />
        <Field label="Phone number" type="tel" value={form.phone} onChange={handleChange("phone")} />

        <div className="sm:col-span-2 flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Save Changes
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-basil-600">
              <CheckCircle2 size={15} /> Saved
            </span>
          )}
          {error && <span className="text-sm text-tomato-500">{error}</span>}
        </div>
      </form>
    </div>
  );
}

const orderStatusStyles = {
  confirmed: "bg-basil-50 text-basil-700 border-basil-200",
  shipped: "bg-mango-100 text-mango-700 border-mango-300",
  delivered: "bg-basil-600 text-white border-basil-600",
  cancelled: "bg-tomato-100 text-tomato-600 border-tomato-200",
};

function OrdersTab({ userId }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    let cancelled = false;
    orderService.getOrderHistory(userId).then((data) => {
      if (!cancelled) {
        setOrders(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="card-elevated rounded-3xl p-10 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="card-elevated rounded-3xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
          <Package size={24} className="text-basil-600" aria-hidden="true" />
        </div>
        <p className="text-ink-soft mt-3 font-medium">You haven't placed any orders yet.</p>
        <p className="text-xs text-ink-soft/70 mt-1">
          When you place an order, its details and delivery tracking will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {orders.map((order) => {
        const isExpanded = expandedOrders[order.orderId] !== false; // Default expanded so items are always visible!
        const items = order.items || [];
        const status = (order.status || "confirmed").toLowerCase();

        return (
          <div
            key={order.orderId}
            className="card-elevated rounded-3xl p-6 bg-white border border-basil-50 transition-all shadow-soft"
          >
            {/* Header: Order ID, Date & Status */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-basil-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-base text-ink">
                    Order #{order.orderId}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-0.5 rounded-full border capitalize ${
                      orderStatusStyles[status] || "bg-basil-50 text-basil-700 border-basil-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs text-ink-soft/70 mt-1">
                  Placed on{" "}
                  {new Date(order.placedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-ink-soft block">Total</span>
                  <span className="font-display text-lg font-bold text-ink">
                    $
                    {typeof order.total === "number"
                      ? order.total.toFixed(2)
                      : Number(order.total || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(order.orderId)}
                  className="p-1.5 rounded-full text-ink-soft hover:bg-basil-50 transition-colors"
                  aria-label="Toggle order details"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {/* Items List */}
            {isExpanded && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Items in this order ({items.length})
                </p>

                <div className="divide-y divide-basil-50/70">
                  {items.map((item, idx) => {
                    const price = Number(item.price ?? 0);
                    const qty = Number(item.quantity ?? 1);
                    const itemTotal = (price * qty).toFixed(2);

                    return (
                      <div
                        key={item.productId || idx}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-basil-100/60 shrink-0 bg-cream"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-basil-50 text-basil-700 font-bold flex items-center justify-center shrink-0 border border-basil-100 text-sm">
                              {(item.name || "P").charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">
                              {item.name || "Item"}
                            </p>
                            <p className="text-xs text-ink-soft mt-0.5">
                              ${price.toFixed(2)} × {qty}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-ink">${itemTotal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary & Delivery Address Footer */}
                <div className="mt-4 pt-4 border-t border-basil-50 grid sm:grid-cols-2 gap-4 text-xs text-ink-soft bg-basil-50/20 p-4 rounded-2xl">
                  <div>
                    <span className="font-semibold text-ink flex items-center gap-1 mb-1">
                      <MapPin size={13} className="text-basil-600" /> Delivery Address
                    </span>
                    <p className="text-ink">
                      {order.address?.fullName || "Valued Customer"}
                    </p>
                    <p>{order.address?.addressLine || ""}</p>
                    <p>
                      {order.address?.city || ""}{" "}
                      {order.address?.pincode ? `, ${order.address.pincode}` : ""}
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="flex justify-between sm:justify-end gap-3">
                      <span>Subtotal:</span>
                      <span className="font-medium text-ink">
                        ${Number(order.subtotal || order.total || 0).toFixed(2)}
                      </span>
                    </p>
                    {Number(order.deliveryFee || 0) > 0 && (
                      <p className="flex justify-between sm:justify-end gap-3">
                        <span>Delivery:</span>
                        <span className="font-medium text-ink">
                          +${Number(order.deliveryFee).toFixed(2)}
                        </span>
                      </p>
                    )}
                    {Number(order.discount || 0) > 0 && (
                      <p className="flex justify-between sm:justify-end gap-3 text-tomato-500 font-medium">
                        <span>Discount:</span>
                        <span>-${Number(order.discount).toFixed(2)}</span>
                      </p>
                    )}
                    <p className="flex justify-between sm:justify-end gap-3 pt-1 border-t border-basil-100 font-bold text-ink text-sm">
                      <span>Total:</span>
                      <span className="text-basil-700">
                        ${Number(order.total || 0).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SecurityTab({ userId }) {
  const isGoogleUser = auth.currentUser?.providerData?.some(
    (p) => p.providerId === "google.com"
  );

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  if (isGoogleUser) {
    return (
      <div className="card-elevated rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Account Security</h2>
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-basil-50 border border-basil-200 text-sm">
          <ShieldCheck size={22} className="shrink-0 text-basil-600 mt-0.5" />
          <div>
            <p className="font-medium text-ink">Signed in with Google</p>
            <p className="mt-1 text-ink-soft">
              Your authentication and password security are managed directly by Google. No separate Daalbhat password is required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.next !== form.confirm) {
      setMessage({ type: "error", text: "New passwords don't match." });
      return;
    }
    if (form.next.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(userId, form.current, form.next);
      setMessage({ type: "success", text: "Password updated successfully." });
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Couldn't update password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-elevated rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold text-ink mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <Field
          label="Current password"
          type="password"
          value={form.current}
          onChange={handleChange("current")}
          required
        />
        <Field
          label="New password"
          type="password"
          value={form.next}
          onChange={handleChange("next")}
          required
        />
        <Field
          label="Confirm new password"
          type="password"
          value={form.confirm}
          onChange={handleChange("confirm")}
          required
        />

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-basil-600" : "text-tomato-500"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-basil-600 text-white py-2.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 self-start px-6"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <input
        {...inputProps}
        className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
      />
    </label>
  );
}
