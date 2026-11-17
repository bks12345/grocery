import { useEffect, useState, Fragment } from "react";
import {
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Trash2,
  AlertTriangle,
  X,
  MailCheck,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Clock,
  Send,
  Power,
} from "lucide-react";
import * as nepalOrderService from "../../services/nepalOrderService";
import { useStoreFeatures } from "../../hooks/useStoreFeatures";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusStyles = {
  pending: "bg-mango-100 text-mango-700 border-mango-300",
  confirmed: "bg-basil-50 text-basil-700 border-basil-200",
  shipped: "bg-sky-100 text-sky-700 border-sky-300",
  delivered: "bg-basil-600 text-white border-basil-600",
  cancelled: "bg-tomato-100 text-tomato-600 border-tomato-200",
};

export default function AdminNepalOrders() {
  const [orders, setOrders] = useState(null);
  const [search, setSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [togglingService, setTogglingService] = useState(false);
  const { nepalOrderActive, toggleNepal } = useStoreFeatures();

  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState(null); // null | 'all' | { type: 'single', orderId: string }
  const [confirmText, setConfirmText] = useState("");

  const handleToggleService = async () => {
    setTogglingService(true);
    try {
      const next = !nepalOrderActive;
      await toggleNepal(next);
      setStatusFeedback(
        next
          ? "Order from Nepal service is now ACTIVE. Accepting customer requests."
          : "Order from Nepal service has been DEACTIVATED. Hidden from storefront."
      );
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch {
      setStatusFeedback("Failed to update Order from Nepal status.");
      setTimeout(() => setStatusFeedback(null), 3500);
    } finally {
      setTogglingService(false);
    }
  };

  const load = async () => {
    try {
      const data = await nepalOrderService.getAllNepalOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      setOrders([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = async (orderIdOrDocId, newStatus) => {
    setUpdatingId(orderIdOrDocId);
    try {
      const updatedOrder = await nepalOrderService.updateNepalOrderStatus(orderIdOrDocId, newStatus);
      const customerEmail = updatedOrder?.senderEmail || updatedOrder?.email || "customer";

      setStatusFeedback(
        `Nepal Order status updated to ${newStatus.toUpperCase()} and notification email sent to ${customerEmail}!`
      );
      setTimeout(() => setStatusFeedback(null), 5000);

      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmSingleDelete = async () => {
    if (!deleteModal || deleteModal.type !== "single") return;
    const targetId = deleteModal.orderId;

    setDeleteModal(null);
    setUpdatingId(targetId);
    try {
      await nepalOrderService.deleteNepalOrder(targetId);
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
      await nepalOrderService.deleteAllNepalOrders();
      await load();
    } catch (e) {
      console.error(e);
      await load();
    }
  };

  // Filtering
  const filtered = (orders || []).filter((o) => {
    const orderKey = `${o.orderId || o.id || ""} ${o.senderName || ""} ${o.recipientName || ""} ${o.senderPhone || ""} ${o.senderEmail || ""} ${o.recipientAddress || ""}`.toLowerCase();
    const matchesSearch = orderKey.includes(search.toLowerCase());
    const matchesStatus =
      activeStatusFilter === "all" || (o.status || "pending").toLowerCase() === activeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = (orders || []).filter((o) => (o.status || "pending").toLowerCase() === "pending").length;
  const confirmedCount = (orders || []).filter((o) => (o.status || "").toLowerCase() === "confirmed").length;
  const deliveredCount = (orders || []).filter((o) => (o.status || "").toLowerCase() === "delivered").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">🇳🇵</span>
            <h1 className="font-display text-2xl font-bold text-ink">Nepal Orders Records</h1>
          </div>
          <p className="text-sm text-ink-soft mt-0.5">
            Manage custom sourcing & delivery requests from Nepal. Status changes send email updates to customers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Master Active / Deactivate Toggle Button */}
          <button
            type="button"
            role="switch"
            aria-checked={nepalOrderActive}
            disabled={togglingService}
            onClick={handleToggleService}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all shadow-soft self-start sm:self-auto cursor-pointer disabled:opacity-50 ${
              nepalOrderActive
                ? "bg-basil-50/80 border-basil-200 text-basil-800 hover:bg-basil-100/80"
                : "bg-gray-50 border-gray-200 text-ink-soft hover:bg-gray-100"
            }`}
          >
            <Power
              size={14}
              className={nepalOrderActive ? "text-basil-600" : "text-ink-soft/60"}
            />
            <span className="text-xs font-semibold">
              {togglingService
                ? "Saving..."
                : nepalOrderActive
                ? "Service Active"
                : "Service Deactivated"}
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                nepalOrderActive ? "bg-basil-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  nepalOrderActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {orders && orders.length > 0 && (
            <button
              onClick={() => {
                setConfirmText("");
                setDeleteModal("all");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-tomato-50 text-tomato-600 rounded-full text-xs font-semibold hover:bg-tomato-100 transition-colors shrink-0"
            >
              <AlertTriangle size={14} />
              Reset All Records
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveStatusFilter("all")}
          className={`card-elevated rounded-2xl p-4 text-left transition-all border ${
            activeStatusFilter === "all"
              ? "bg-basil-50 border-basil-300 ring-2 ring-basil-600/20"
              : "border-transparent hover:border-basil-100"
          }`}
        >
          <span className="text-xs text-ink-soft block font-medium">Total Requests</span>
          <span className="font-display text-2xl font-bold text-ink mt-1 block">
            {orders ? orders.length : 0}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter("pending")}
          className={`card-elevated rounded-2xl p-4 text-left transition-all border ${
            activeStatusFilter === "pending"
              ? "bg-mango-50 border-mango-300 ring-2 ring-mango-500/20"
              : "border-transparent hover:border-mango-100"
          }`}
        >
          <span className="text-xs text-mango-700 block font-medium flex items-center gap-1">
            <Clock size={13} /> Pending Review
          </span>
          <span className="font-display text-2xl font-bold text-mango-600 mt-1 block">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter("confirmed")}
          className={`card-elevated rounded-2xl p-4 text-left transition-all border ${
            activeStatusFilter === "confirmed"
              ? "bg-sky-50 border-sky-300 ring-2 ring-sky-500/20"
              : "border-transparent hover:border-sky-100"
          }`}
        >
          <span className="text-xs text-sky-700 block font-medium">Confirmed / In Sourcing</span>
          <span className="font-display text-2xl font-bold text-sky-600 mt-1 block">
            {confirmedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter("delivered")}
          className={`card-elevated rounded-2xl p-4 text-left transition-all border ${
            activeStatusFilter === "delivered"
              ? "bg-basil-50 border-basil-300 ring-2 ring-basil-500/20"
              : "border-transparent hover:border-basil-100"
          }`}
        >
          <span className="text-xs text-basil-700 block font-medium">Delivered</span>
          <span className="font-display text-2xl font-bold text-basil-600 mt-1 block">
            {deliveredCount}
          </span>
        </button>
      </div>

      {/* Search Bar & Active Filter Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, item, address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", ...statusOptions].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                activeStatusFilter === status
                  ? "bg-basil-600 text-white shadow-soft"
                  : "bg-white text-ink-soft hover:bg-basil-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Toast Feedback */}
      {statusFeedback && (
        <div className="bg-basil-50 border border-basil-200 text-basil-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5 shadow-soft animate-in fade-in slide-in-from-top-2 duration-200">
          <MailCheck size={18} className="text-basil-600 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Records Table */}
      <div className="card-elevated rounded-3xl overflow-hidden bg-white shadow-soft">
        {!orders ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-basil-50 text-basil-600 flex items-center justify-center mx-auto mb-3">
              <Package size={22} />
            </div>
            <p className="text-ink font-medium text-sm">No Nepal orders found</p>
            <p className="text-xs text-ink-soft mt-1">
              {search || activeStatusFilter !== "all"
                ? "Try clearing filters or changing your search query."
                : "New requests submitted through the 'Order from Nepal' page will be recorded here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 uppercase tracking-wide border-b border-basil-50 bg-cream/40">
                  <th className="px-5 py-3 font-medium">Order Ref #</th>
                  <th className="px-5 py-3 font-medium">Customer Details</th>
                  <th className="px-5 py-3 font-medium">Date Placed</th>
                  <th className="px-5 py-3 font-medium">Items Requested</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const id = order.id || order.orderId;
                  const orderNum = order.orderId || (order.id ? `NEP-${order.id.slice(-6)}` : "NEP-ORDER");
                  const customerName = order.senderName || order.recipientName || "Guest Customer";
                  const phone = order.senderPhone || order.recipientPhone || "";
                  const email = order.senderEmail || order.email || "";
                  const items = Array.isArray(order.items) ? order.items : [];
                  const status = (order.status || "pending").toLowerCase();
                  const isExpanded = expandedId === id;

                  return (
                    <Fragment key={id}>
                      <tr
                        className={`border-b border-basil-50 hover:bg-basil-50/30 transition-colors cursor-pointer ${
                          isExpanded ? "bg-basil-50/25" : ""
                        }`}
                        onClick={() => toggleExpand(id)}
                      >
                        {/* Order # */}
                        <td className="px-5 py-3.5 font-medium text-ink flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-ink-soft" />
                          ) : (
                            <ChevronDown size={16} className="text-ink-soft" />
                          )}
                          <span className="font-mono text-xs font-bold text-basil-800">
                            #{orderNum}
                          </span>
                        </td>

                        {/* Customer Details */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-ink text-sm">{customerName}</p>
                          <p className="text-xs text-ink-soft">{phone || email || "No contact info"}</p>
                        </td>

                        {/* Date Placed */}
                        <td className="px-5 py-3.5 text-ink-soft whitespace-nowrap text-xs">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>

                        {/* Items count */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 bg-basil-50 text-basil-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <Package size={12} /> {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Status selector */}
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(id, e.target.value)}
                              disabled={updatingId === id}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full outline-none capitalize cursor-pointer border ${
                                statusStyles[status] || "bg-basil-50 text-basil-700"
                              }`}
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s} className="bg-white text-ink capitalize">
                                  {s}
                                </option>
                              ))}
                            </select>
                            {updatingId === id && (
                              <Loader2 size={13} className="animate-spin text-basil-600" />
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp shortcut */}
                            {phone && (
                              <a
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Namaste ${customerName}, regarding your Nepal order #${orderNum} with Daalbhat Grocery:`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-basil-600 hover:bg-basil-50 rounded-full transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}

                            {/* Direct Email shortcut */}
                            {email && (
                              <a
                                href={`mailto:${email}?subject=${encodeURIComponent(
                                  `Daalbhat Grocery - Order from Nepal #${orderNum}`
                                )}`}
                                className="p-2 text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                                title="Send Email"
                              >
                                <Mail size={15} />
                              </a>
                            )}

                            {/* Delete single record */}
                            <button
                              onClick={() => setDeleteModal({ type: "single", orderId: id })}
                              disabled={updatingId === id}
                              className="p-2 text-tomato-400 hover:text-tomato-600 hover:bg-tomato-50 rounded-full transition-colors disabled:opacity-50"
                              title="Delete Order Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Order Details Card */}
                      {isExpanded && (
                        <tr className="bg-basil-50/15 border-b border-basil-50">
                          <td colSpan={6} className="p-0">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                              {/* Items Breakdown */}
                              <div className="bg-white p-5 rounded-2xl border border-basil-100 shadow-sm">
                                <h4 className="font-semibold text-ink text-sm flex items-center gap-2 mb-3">
                                  <Package size={16} className="text-basil-600" />
                                  Requested Products & Quantities ({items.length})
                                </h4>

                                {items.length > 0 ? (
                                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {items.map((item, idx) => (
                                      <div
                                        key={item.id || idx}
                                        className="flex items-center justify-between p-3 bg-cream/50 rounded-xl border border-basil-50 text-sm"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <p className="font-medium text-ink truncate">
                                            {idx + 1}. {item.name || "Item"}
                                          </p>
                                        </div>
                                        <span className="shrink-0 font-semibold text-basil-700 bg-white px-2.5 py-1 rounded-lg border border-basil-100 text-xs">
                                          Qty: {item.quantity || "1"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-ink-soft italic">No items listed.</p>
                                )}

                                {order.notes && (
                                  <div className="mt-4 pt-3 border-t border-basil-50">
                                    <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5 mb-1">
                                      <FileText size={13} className="text-mango-600" /> Customer Special Instructions:
                                    </span>
                                    <p className="text-xs text-ink bg-mango-50/60 p-3 rounded-xl border border-mango-100 italic">
                                      "{order.notes}"
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Customer & Delivery Contact Information */}
                              <div className="bg-white p-5 rounded-2xl border border-basil-100 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="font-semibold text-ink text-sm flex items-center gap-2 mb-3">
                                    <MapPin size={16} className="text-basil-600" />
                                    Customer & Delivery Information
                                  </h4>

                                  <div className="space-y-2.5 text-xs text-ink-soft">
                                    <div className="flex items-start gap-2">
                                      <span className="font-semibold text-ink min-w-24">Full Name:</span>
                                      <span className="text-ink">{customerName}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="font-semibold text-ink min-w-24">Phone:</span>
                                      <span className="text-ink flex items-center gap-1">
                                        <Phone size={12} className="text-basil-600" /> {phone || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="font-semibold text-ink min-w-24">Email:</span>
                                      <span className="text-ink flex items-center gap-1">
                                        <Mail size={12} className="text-basil-600" /> {email || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="font-semibold text-ink min-w-24">Delivery Address:</span>
                                      <span className="text-ink leading-relaxed">
                                        {order.recipientAddress || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Contact Bar in Detail Card */}
                                <div className="mt-5 pt-4 border-t border-basil-50 flex items-center gap-2 flex-wrap">
                                  {phone && (
                                    <a
                                      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                        `Namaste ${customerName}, updating you on your Nepal Order #${orderNum}:`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-basil-600 text-white rounded-full text-xs font-semibold hover:bg-basil-700 transition-colors shadow-soft"
                                    >
                                      <MessageCircle size={13} /> Chat on WhatsApp
                                    </a>
                                  )}
                                  {email && (
                                    <a
                                      href={`mailto:${email}?subject=${encodeURIComponent(
                                        `Daalbhat Grocery - Order from Nepal #${orderNum}`
                                      )}`}
                                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-basil-50 text-basil-700 rounded-full text-xs font-semibold hover:bg-basil-100 transition-colors"
                                    >
                                      <Send size={13} /> Email Customer
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modals */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-basil-50">
              <div className="flex items-center gap-2 text-tomato-600 font-semibold">
                <AlertTriangle size={20} />
                {deleteModal === "all" ? "Reset All Nepal Orders" : "Delete Order Record"}
              </div>
              <button
                onClick={() => setDeleteModal(null)}
                className="p-1 text-ink-soft hover:bg-basil-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {deleteModal === "all" ? (
                <>
                  <p className="text-ink-soft mb-4 text-sm leading-relaxed">
                    You are about to permanently delete <strong className="text-tomato-600">ALL Nepal order records</strong>. This action cannot be undone.
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
                  Are you sure you want to delete this order record? This will permanently remove it from the admin panel and database.
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
                onClick={deleteModal === "all" ? confirmResetAll : confirmSingleDelete}
                disabled={deleteModal === "all" && confirmText !== "DELETE"}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-tomato-500 text-white hover:bg-tomato-600 hover:shadow-glow disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                {deleteModal === "all" ? "Wipe Records" : "Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
