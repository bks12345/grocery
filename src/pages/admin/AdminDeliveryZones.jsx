import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  addPostcodesToZone,
  removePostcodeFromZone,
  deleteDeliveryZone,
  resetDeliveryZonesToDefaults,
} from "../../services/adminDeliveryService";

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    postcodesText: "",
    freeAbove: "$50",
    reducedCharge: "$1",
    belowRange: "$0 – $49.99",
    standardCharge: "$4.99",
    days: "Sunday to Friday",
    time: "4pm – 9pm",
    highlight: false,
  });

  // Quick Postcode Input per zone { [zoneId]: string }
  const [quickInputs, setQuickInputs] = useState({});

  useEffect(() => {
    loadZones();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadZones = async () => {
    setLoading(true);
    try {
      const data = await getAllDeliveryZones();
      setZones(data);
    } catch (err) {
      showToast("Failed to load delivery zones", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingZone(null);
    setFormData({
      name: "",
      postcodesText: "",
      freeAbove: "$50",
      reducedCharge: "$1",
      belowRange: "$0 – $49.99",
      standardCharge: "$4.99",
      days: "Sunday to Friday",
      time: "4pm – 9pm",
      highlight: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      postcodesText: (zone.postcodes || []).join(", "),
      freeAbove: zone.freeAbove || "$50",
      reducedCharge: zone.reducedCharge || "$1",
      belowRange: zone.belowRange || "$0 – $49.99",
      standardCharge: zone.standardCharge || "$4.99",
      days: zone.days || "Sunday to Friday",
      time: zone.time || "4pm – 9pm",
      highlight: Boolean(zone.highlight),
    });
    setModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Zone name is required", "error");
      return;
    }

    const postcodes = formData.postcodesText
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      if (editingZone) {
        await updateDeliveryZone(editingZone.id, {
          name: formData.name.trim(),
          postcodes,
          freeAbove: formData.freeAbove.trim(),
          reducedCharge: formData.reducedCharge.trim(),
          belowRange: formData.belowRange.trim(),
          standardCharge: formData.standardCharge.trim(),
          days: formData.days.trim(),
          time: formData.time.trim(),
          highlight: formData.highlight,
        });
        showToast(`Updated delivery zone: ${formData.name}`);
      } else {
        await createDeliveryZone({
          name: formData.name.trim(),
          postcodes,
          freeAbove: formData.freeAbove.trim(),
          reducedCharge: formData.reducedCharge.trim(),
          belowRange: formData.belowRange.trim(),
          standardCharge: formData.standardCharge.trim(),
          days: formData.days.trim(),
          time: formData.time.trim(),
          highlight: formData.highlight,
        });
        showToast(`Created new delivery zone: ${formData.name}`);
      }

      setModalOpen(false);
      await loadZones();
    } catch (err) {
      showToast("Failed to save delivery zone", "error");
    }
  };

  const handleDeleteZone = async (zone) => {
    if (!window.confirm(`Are you sure you want to delete delivery zone "${zone.name}"?`)) return;
    try {
      await deleteDeliveryZone(zone.id);
      showToast(`Deleted zone: ${zone.name}`);
      await loadZones();
    } catch (err) {
      showToast("Failed to delete zone", "error");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Are you sure you want to reset all delivery zones to default settings?")) return;
    try {
      await resetDeliveryZonesToDefaults();
      showToast("Reset all delivery zones to default");
      await loadZones();
    } catch (err) {
      showToast("Failed to reset defaults", "error");
    }
  };

  const handleQuickAddPostcode = async (zoneId) => {
    const inputVal = quickInputs[zoneId] || "";
    const incomingCodes = inputVal
      .split(/[\s,]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (incomingCodes.length === 0) return;

    try {
      await addPostcodesToZone(zoneId, incomingCodes);
      setQuickInputs((prev) => ({ ...prev, [zoneId]: "" }));
      showToast(`Added ${incomingCodes.length} postal code(s)`);
      await loadZones();
    } catch (err) {
      showToast("Failed to add postal code", "error");
    }
  };

  const handleRemovePostcode = async (zoneId, postcode) => {
    try {
      await removePostcodeFromZone(zoneId, postcode);
      showToast(`Removed postal code ${postcode}`);
      await loadZones();
    } catch (err) {
      showToast("Failed to remove postal code", "error");
    }
  };

  // Filtered zones by name or containing a postcode
  const filteredZones = zones.filter((zone) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = zone.name?.toLowerCase().includes(query);
    const postcodeMatch = zone.postcodes?.some((p) => String(p).toLowerCase().includes(query));
    return nameMatch || postcodeMatch;
  });

  const totalPostcodesCount = zones.reduce(
    (sum, z) => sum + (Array.isArray(z.postcodes) ? z.postcodes.length : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-elevated text-sm font-medium text-white transition-all animate-modal-pop ${
            toast.type === "error" ? "bg-tomato-600" : "bg-basil-700"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
            <Truck className="text-basil-600" size={24} />
            Delivery Zones & Postal Codes
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Manage active service areas, eligible delivery postcodes, timings, and shipping fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            title="Reset to default zones"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-basil-200 text-ink-soft hover:text-ink hover:bg-white text-xs sm:text-sm font-medium transition-colors"
          >
            <RotateCcw size={15} /> Reset Defaults
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-basil-600 text-white text-xs sm:text-sm font-semibold hover:bg-basil-700 hover:shadow-glow transition-all"
          >
            <Plus size={16} /> Add Zone
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card-elevated rounded-3xl p-5 bg-white">
          <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold uppercase tracking-wider mb-1">
            <MapPin size={15} className="text-basil-600" /> Active Zones
          </div>
          <p className="text-2xl font-bold text-ink">{zones.length}</p>
        </div>

        <div className="card-elevated rounded-3xl p-5 bg-white">
          <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck size={15} className="text-mango-600" /> Total Postal Codes
          </div>
          <p className="text-2xl font-bold text-ink">{totalPostcodesCount}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 card-elevated rounded-3xl p-5 bg-white">
          <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={15} className="text-amber-500" /> Pop-up Eligible
          </div>
          <p className="text-2xl font-bold text-ink">Live on Site</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by area name or postal code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-basil-100 shadow-soft focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-sm text-ink placeholder:text-ink-soft/60"
        />
      </div>

      {/* Zones List */}
      {loading ? (
        <div className="text-center py-16 text-ink-soft">Loading delivery zones...</div>
      ) : filteredZones.length === 0 ? (
        <div className="card-elevated rounded-3xl p-12 text-center text-ink-soft bg-white">
          <MapPin size={36} className="mx-auto mb-3 text-basil-300" />
          <p className="font-semibold text-ink text-base">No delivery zones found</p>
          <p className="text-sm mt-1">Try a different search query or add a new zone.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className={`card-elevated rounded-3xl p-5 sm:p-6 bg-white border transition-all ${
                zone.highlight ? "border-mango-300 bg-mango-50/20" : "border-basil-100"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-basil-50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-basil-50 flex items-center justify-center text-basil-600 font-bold">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-ink">{zone.name}</h3>
                      {zone.highlight && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-mango-100 text-mango-700">
                          Highlighted Area
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink-soft">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-basil-600" /> {zone.days}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-basil-600" /> {zone.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rates & Actions */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right text-xs">
                    <span className="font-semibold text-basil-700">Free above {zone.freeAbove}</span>
                    <span className="block text-ink-soft">
                      {zone.reducedCharge} over {zone.belowRange?.split("–")[1]?.trim() || "$0"} / {zone.standardCharge} std
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                    <button
                      onClick={() => handleOpenEditModal(zone)}
                      title="Edit Zone Details"
                      className="p-2 rounded-xl text-ink-soft hover:text-basil-600 hover:bg-basil-50 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone)}
                      title="Delete Zone"
                      className="p-2 rounded-xl text-ink-soft hover:text-tomato-600 hover:bg-tomato-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Postcodes Management Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Assigned Postal Codes ({zone.postcodes?.length || 0})
                  </span>
                </div>

                {/* Postal Code Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {zone.postcodes && zone.postcodes.length > 0 ? (
                    zone.postcodes.map((pc) => (
                      <span
                        key={pc}
                        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-basil-50 text-basil-800 text-xs sm:text-sm font-semibold border border-basil-200/60 hover:border-basil-400 transition-colors"
                      >
                        {pc}
                        <button
                          onClick={() => handleRemovePostcode(zone.id, pc)}
                          title={`Remove ${pc}`}
                          className="opacity-50 hover:opacity-100 hover:text-tomato-600 transition-opacity"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-ink-soft/70 italic">No postal codes assigned yet.</span>
                  )}
                </div>

                {/* Quick Add Postcode Bar */}
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={quickInputs[zone.id] || ""}
                    onChange={(e) =>
                      setQuickInputs((prev) => ({ ...prev, [zone.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleQuickAddPostcode(zone.id);
                      }
                    }}
                    placeholder="Add postal code(s) (e.g. 2148, 2150)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                  <button
                    onClick={() => handleQuickAddPostcode(zone.id)}
                    className="px-3 py-1.5 rounded-xl bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 transition-colors shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Zone Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-modal-fade"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-elevated p-6 sm:p-7 z-10 animate-modal-pop max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink">
                {editingZone ? `Edit Zone: ${editingZone.name}` : "Create Delivery Zone"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-ink-soft hover:text-ink hover:bg-basil-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">
                  Area / Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sydney Metro, Melbourne North"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">
                  Postal Codes (Comma or Space Separated)
                </label>
                <textarea
                  rows={3}
                  value={formData.postcodesText}
                  onChange={(e) => setFormData({ ...formData, postcodesText: e.target.value })}
                  placeholder="2000, 2001, 2170, 2173, 2148"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Delivery Days
                  </label>
                  <input
                    type="text"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                    placeholder="e.g. Sunday to Friday"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Delivery Hours
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 4pm – 9pm"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Free Delivery Above
                  </label>
                  <input
                    type="text"
                    value={formData.freeAbove}
                    onChange={(e) => setFormData({ ...formData, freeAbove: e.target.value })}
                    placeholder="$50"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Standard Charge
                  </label>
                  <input
                    type="text"
                    value={formData.standardCharge}
                    onChange={(e) => setFormData({ ...formData, standardCharge: e.target.value })}
                    placeholder="$4.99"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Reduced Charge
                  </label>
                  <input
                    type="text"
                    value={formData.reducedCharge}
                    onChange={(e) => setFormData({ ...formData, reducedCharge: e.target.value })}
                    placeholder="$1"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase mb-1">
                    Below Range Label
                  </label>
                  <input
                    type="text"
                    value={formData.belowRange}
                    onChange={(e) => setFormData({ ...formData, belowRange: e.target.value })}
                    placeholder="$0 – $49.99"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-basil-100 focus:outline-none focus:ring-2 focus:ring-basil-600/30 text-ink"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                  className="rounded text-basil-600 focus:ring-basil-600 w-4 h-4"
                />
                <label htmlFor="highlight" className="text-xs font-medium text-ink cursor-pointer">
                  Highlight this zone in the Delivery Information table
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-basil-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-basil-200 text-ink-soft hover:text-ink text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-basil-600 text-white text-xs font-semibold hover:bg-basil-700 transition-colors"
                >
                  {editingZone ? "Save Changes" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
