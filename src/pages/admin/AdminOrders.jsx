import { useEffect, useState, Fragment } from "react";
import { Loader2, Search, ChevronDown, ChevronUp, Package, MapPin, Trash2, AlertTriangle, X } from "lucide-react";
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
  const [expandedId, setExpandedId] = useState(null);
  
  // Custom Modal States
  const [deleteModal, setDeleteModal] = useState(null); // null | 'all' | { type: 'single', orderId: string }
  const [confirmText, setConfirmText] = useState("");

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  const confirmSingleDelete = async () => {
    if (!deleteModal || deleteModal.type !== 'single') return;
    const orderId = deleteModal.orderId;
    
    setDeleteModal(null);
    setUpdatingId(orderId);
    try {
      await orderService.deleteOrder(orderId);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmResetAll = async () => {
    if (confirmText !== "DELETE") return;
    
    setDeleteModal(null);
    setConfirmText("");
    setOrders(null);
    
    try {
      await orderService.deleteAllOrders();
      await load();
    } catch (e) {
      console.error(e);
      await load();
    }
  };

  const filtered = (orders || []).filter((o) =>
    `${o.orderId} ${o.address?.fullName || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        
        {orders && orders.length > 0 && (
          <button
            onClick={() => {
              setConfirmText("");
              setDeleteModal('all');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-tomato-50 text-tomato-600 rounded-full text-sm font-medium hover:bg-tomato-100 transition-colors shrink-0"
          >
            <AlertTriangle size={15} />
            Reset All Orders
          </button>
        )}
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
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <Fragment key={order.orderId}>
                    <tr 
                      className={`border-b border-basil-50 hover:bg-basil-50/30 transition-colors cursor-pointer ${expandedId === order.orderId ? 'bg-basil-50/30' : ''}`}
                      onClick={() => toggleExpand(order.orderId)}
                    >
                      <td className="px-5 py-3 font-medium text-ink flex items-center gap-2">
                        {expandedId === order.orderId ? <ChevronUp size={16} className="text-ink-soft" /> : <ChevronDown size={16} className="text-ink-soft" />}
                        #{order.orderId}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{order.address?.fullName || "Guest"}</td>
                      <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{order.items.length}</td>
                      <td className="px-5 py-3 text-ink font-medium">${order.total}</td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
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
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteModal({ type: 'single', orderId: order.orderId })}
                          disabled={updatingId === order.orderId}
                          className="p-2 text-tomato-400 hover:text-tomato-600 hover:bg-tomato-50 rounded-full transition-colors disabled:opacity-50"
                          title="Delete Order"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedId === order.orderId && (
                      <tr className="bg-basil-50/10 border-b border-basil-50">
                        <td colSpan={7} className="p-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Items List */}
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-ink font-semibold text-sm">
                                <Package size={16} className="text-basil-600" />
                                Order Items
                              </div>
                              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {(order.items || []).map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-basil-50">
                                    <div>
                                      <p className="text-sm font-medium text-ink">{item.name}</p>
                                      <p className="text-xs text-ink-soft/70">Qty: {item.quantity} × ${item.price}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-ink">
                                      ${item.price * item.quantity}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 flex justify-between items-center text-sm font-semibold text-ink border-t border-basil-100 pt-3">
                                <span>Subtotal</span>
                                <span>${order.subtotal}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-semibold text-tomato-500 mt-1">
                                <span>Discount</span>
                                <span>-${order.discount}</span>
                              </div>
                              <div className="flex justify-between items-center text-base font-bold text-basil-700 mt-2">
                                <span>Total Paid</span>
                                <span>${order.total}</span>
                              </div>
                            </div>

                            {/* Delivery Address */}
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-ink font-semibold text-sm">
                                <MapPin size={16} className="text-basil-600" />
                                Delivery Information
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-basil-50 text-sm text-ink-soft space-y-2">
                                <p><strong className="text-ink">Name:</strong> {order.address?.fullName || "N/A"}</p>
                                <p><strong className="text-ink">Email:</strong> {order.address?.email || "N/A"}</p>
                                <p><strong className="text-ink">Phone:</strong> {order.address?.phone || "N/A"}</p>
                                <p><strong className="text-ink">Address:</strong> {order.address?.addressLine || "N/A"}</p>
                                <p><strong className="text-ink">City/State:</strong> {order.address?.city || ""}, {order.address?.state || ""} {order.address?.pincode || ""}</p>
                                
                                <div className="mt-4 pt-4 border-t border-basil-50">
                                  <p><strong className="text-ink">Delivery Method:</strong> <span className="capitalize">{order.deliveryMethod || "Standard"}</span></p>
                                  <p><strong className="text-ink">Payment Method:</strong> <span className="uppercase">{order.paymentMethod || "COD"}</span></p>
                                </div>
                              </div>
                            </div>
                            
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Delete Modals */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-basil-50">
              <div className="flex items-center gap-2 text-tomato-600 font-semibold">
                <AlertTriangle size={20} />
                {deleteModal === 'all' ? "Reset All Orders" : "Delete Order"}
              </div>
              <button 
                onClick={() => setDeleteModal(null)} 
                className="p-1 text-ink-soft hover:bg-basil-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {deleteModal === 'all' ? (
                <>
                  <p className="text-ink-soft mb-4 text-sm leading-relaxed">
                    You are about to permanently delete <strong className="text-tomato-600">ALL orders</strong> from the database. This action cannot be undone and will erase all transaction history.
                  </p>
                  <div className="mb-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5 uppercase tracking-wide">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-2.5 rounded-xl border border-basil-100 bg-basil-50/30 focus:bg-white focus:border-tomato-300 focus:ring-4 focus:ring-tomato-50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </>
              ) : (
                <p className="text-ink-soft text-sm leading-relaxed">
                  Are you sure you want to delete order <strong className="text-ink">#{deleteModal.orderId}</strong>? This will permanently remove the record from the database.
                </p>
              )}
            </div>

            <div className="p-5 bg-basil-50/30 border-t border-basil-50 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-ink-soft hover:bg-white hover:shadow-soft transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteModal === 'all' ? confirmResetAll : confirmSingleDelete}
                disabled={deleteModal === 'all' && confirmText !== "DELETE"}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-tomato-500 text-white hover:bg-tomato-600 hover:shadow-glow disabled:opacity-50 disabled:hover:bg-tomato-500 disabled:hover:shadow-none transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                {deleteModal === 'all' ? "Wipe Database" : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
