import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  Tag,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Set to true to require an admin login again. Off by default because,
// without a real backend, this "login" is just a frontend check — anyone
// can already read the source or localStorage, so it isn't real security
// either way. Turn this back on once a real backend/auth exists and this
// check is backed by an actual server-side permission, not just UI.
const REQUIRE_ADMIN_LOGIN = false;

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
];

export default function AdminLayout() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!REQUIRE_ADMIN_LOGIN) return;
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/admin" }, replace: true });
    } else if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (REQUIRE_ADMIN_LOGIN && (loading || !isAuthenticated || !isAdmin)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-basil-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mango-600">
              Admin Panel
            </p>
            <h1 className="font-display text-2xl font-semibold text-ink mt-0.5">
              Manage your store
            </h1>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-basil-600"
          >
            <ArrowLeft size={15} /> Back to store
          </NavLink>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <nav className="card-elevated rounded-3xl p-3 flex md:flex-col gap-1 overflow-x-auto h-fit">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-basil-600 text-white"
                      : "text-ink-soft hover:bg-basil-50"
                  }`
                }
              >
                <item.icon size={16} /> {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
