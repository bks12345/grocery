import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Lock,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";
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
      await updateProfile(form);
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
        <Field label="Email" type="email" value={form.email} onChange={handleChange("email")} required />
        <Field label="Phone number" type="tel" value={form.phone} onChange={handleChange("phone")} required />

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

function OrdersTab({ userId }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="card-elevated rounded-3xl p-10 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card-elevated rounded-3xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
          <Package size={24} className="text-basil-600" aria-hidden="true" />
        </div>
        <p className="text-ink-soft mt-3">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.orderId} className="card-elevated rounded-3xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-medium text-ink">Order #{order.orderId}</p>
              <p className="text-xs text-ink-soft/70 mt-0.5">
                {new Date(order.placedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="text-xs font-semibold bg-basil-50 text-basil-700 px-3 py-1 rounded-full capitalize">
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {order.items.slice(0, 5).map((item) => (
              <span
                key={item.productId}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-basil-50 text-xs font-semibold text-basil-700"
                title={item.name}
              >
                {item.name?.charAt(0).toUpperCase() || "?"}
              </span>
            ))}
            {order.items.length > 5 && (
              <span className="text-xs text-ink-soft/60">+{order.items.length - 5} more</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-basil-50">
            <span className="text-sm text-ink-soft">
              {order.items.length} item{order.items.length !== 1 && "s"}
            </span>
            <span className="font-display text-lg font-semibold text-ink">${order.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityTab({ userId }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

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
