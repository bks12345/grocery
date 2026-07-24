import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Package,
  FolderTree,
  Users,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import * as adminProductService from "../../services/adminProductService";
import * as adminCategoryService from "../../services/adminCategoryService";
import * as authService from "../../services/authService";
import * as orderService from "../../services/orderService";

function StatCard({ icon: Icon, label, value, tone = "basil" }) {
  const toneClasses = {
    basil: "bg-basil-50 text-basil-600",
    mango: "bg-mango-100 text-mango-600",
    tomato: "bg-tomato-100 text-tomato-500",
  };
  return (
    <div className="card-elevated rounded-3xl p-5">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-display text-2xl font-semibold text-ink mt-3">{value}</p>
      <p className="text-xs text-ink-soft/70 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      adminProductService.getAllProducts(),
      adminCategoryService.getAllCategories(),
      authService.getAllUsers(),
      orderService.getAllOrders(),
    ]).then(([products, categories, users, orders]) => {
      if (cancelled) return;

      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const outOfStock = products.filter((p) => !p.inStock).length;
      const customers = users.filter((u) => u.role !== "admin");

      setStats({
        products: products.length,
        categories: categories.length,
        customers: customers.length,
        orders: orders.length,
        revenue,
        outOfStock,
      });

      // Last 7 days of order volume, oldest first
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const data = days.map((d) => {
        const key = d.toDateString();
        const dayOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === key);
        return {
          day: d.toLocaleDateString(undefined, { weekday: "short" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });
      setChartData(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="card-elevated rounded-3xl p-16 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Total Products" value={stats.products} />
        <StatCard icon={FolderTree} label="Total Categories" value={stats.categories} tone="mango" />
        <StatCard icon={Users} label="Total Customers" value={stats.customers} />
        <StatCard icon={ClipboardList} label="Total Orders" value={stats.orders} tone="mango" />
        <StatCard icon={DollarSign} label="Sales Revenue" value={`$${stats.revenue}`} />
        <StatCard
          icon={AlertTriangle}
          label="Out of Stock"
          value={stats.outOfStock}
          tone={stats.outOfStock > 0 ? "tomato" : "basil"}
        />
      </div>

      <div className="card-elevated rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Orders — Last 7 Days
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f7f2" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4b564e" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4b564e" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(22,48,31,0.12)" }}
                formatter={(value, name) => [name === "revenue" ? `$${value}` : value, name === "revenue" ? "Revenue" : "Orders"]}
              />
              <Bar dataKey="orders" fill="#2d5f3f" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.outOfStock > 0 && (
        <div className="card-elevated rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-tomato-500 shrink-0" />
            <p className="text-sm text-ink">
              {stats.outOfStock} product{stats.outOfStock !== 1 && "s"} currently out of stock.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-sm font-medium text-basil-600 hover:text-basil-700"
          >
            Manage inventory →
          </Link>
        </div>
      )}
    </div>
  );
}
