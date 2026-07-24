import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import * as orderService from "../../services/orderService";

const statusOptions = ["confirmed", "shipped", "delivered", "cancelled"];

const statusStyles = {
  confirmed: "bg-basil-50 text-basil-700",
  shipped: "bg-mango-100 text-mango-600",
  delivered: "bg-basil-600 text-white",
  cancelled: "bg-tomato-100 text-tomato-500",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => orderService.getAllOrders().then((data) =>
    setOrders(data.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)))
  );

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = (orders || []).filter((o) =>
    `${o.orderId} ${o.address?.fullName || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full max-w-xs">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order # or name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
        />
      </div>

      <div className="card-elevated rounded-3xl overflow-hidden">
        {!orders ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-soft text-sm py-16">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 uppercase tracking-wide border-b border-basil-50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.orderId} className="border-b border-basil-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">#{order.orderId}</td>
                    <td className="px-5 py-3 text-ink-soft">{order.address?.fullName || "Guest"}</td>
                    <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{order.items.length}</td>
                    <td className="px-5 py-3 text-ink font-medium">${order.total}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          disabled={updatingId === order.orderId}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full outline-none capitalize cursor-pointer ${statusStyles[order.status] || "bg-basil-50 text-basil-700"}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="bg-white text-ink capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                        {updatingId === order.orderId && (
                          <Loader2 size={13} className="animate-spin text-ink-soft" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
