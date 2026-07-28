import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Beef,
  Drumstick,
  Droplet,
  Droplets,
  Heart,
  Bean,
  Brain,
  Skull,
  Footprints,
  Waves,
  Wind,
  Shell,
} from "lucide-react";
import { goatParts, goatQtyStep, goatHeroImage, goatFeatureImages } from "../data/goatParts";
import { useCart } from "../context/CartContext";
import SafeImage from "../components/ui/SafeImage";

// Maps each part's `icon` key (data/goatParts.js) to its component, and each
// `group` to a color pairing — organs and extras get a distinct palette from
// primal cuts so the grid reads as a clear, categorized diagram at a glance.
const partIcons = {
  beef: Beef,
  drumstick: Drumstick,
  droplet: Droplet,
  droplets: Droplets,
  heart: Heart,
  bean: Bean,
  brain: Brain,
  skull: Skull,
  footprints: Footprints,
  waves: Waves,
  wind: Wind,
  shell: Shell,
};

const groupStyles = {
  cut: { bg: "bg-tomato-100", icon: "text-tomato-500" },
  organ: { bg: "bg-mango-100", icon: "text-mango-600" },
  extra: { bg: "bg-cream-100", icon: "text-ink-soft" },
};

function GoatPartIllustration({ part, size = "md" }) {
  // Tries, in order: your own local photo -> the built-in backup photo (if
  // any) -> the colored icon tile. Matches the same local-photo-first
  // pattern used for categories/products (see public/images/README.md).
  const sources = useMemo(
    () => [`/images/goat-parts/${part.id}.jpg`, part.image].filter(Boolean),
    [part.id, part.image]
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  const Icon = partIcons[part.icon] || Beef;
  const style = groupStyles[part.group] || groupStyles.cut;
  const dims = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const iconSize = size === "sm" ? 16 : 20;

  if (sourceIndex < sources.length) {
    return (
      <div className={`${dims} rounded-full overflow-hidden shrink-0 ${style.bg}`}>
        <img
          src={sources[sourceIndex]}
          alt={part.name}
          loading="lazy"
          onError={() => setSourceIndex((i) => i + 1)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${dims} rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
      <Icon
        size={iconSize}
        className={style.icon}
        style={{ transform: part.rotate ? `rotate(${part.rotate}deg)` : undefined }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function BookGoat() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  // selections: { [partId]: quantityInKg }
  const [selections, setSelections] = useState({});
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const selectedIds = Object.keys(selections);

  const togglePart = (part) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[part.id] != null) {
        delete next[part.id];
      } else {
        next[part.id] = part.minQty;
      }
      return next;
    });
    setFeedback(null);
  };

  const setQuantity = (part, qty) => {
    const clamped = Math.max(part.minQty, Math.round(qty / goatQtyStep) * goatQtyStep);
    setSelections((prev) => ({ ...prev, [part.id]: clamped }));
  };

  const removeSelection = (partId) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[partId];
      return next;
    });
  };

  const selectionDetails = useMemo(
    () =>
      selectedIds.map((id) => {
        const part = goatParts.find((p) => p.id === id);
        const qty = selections[id];
        return { ...part, quantity: qty, total: Math.round(qty * part.pricePerKg) };
      }),
    [selections, selectedIds]
  );

  const totalWeight = selectionDetails.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = selectionDetails.reduce((sum, s) => sum + s.total, 0);

  const handleAddToCart = () => {
    if (selectionDetails.length === 0) {
      setFeedback({ type: "error", message: "Select at least one part before adding to cart." });
      return;
    }
    selectionDetails.forEach((item) => {
      addItem(
        {
          id: `goat_${item.id}`,
          name: `Goat ${item.name}`,
          price: item.pricePerKg,
          weight: "per kg",
          category: "meat-seafood",
          inStock: true,
          image: `/images/goat-parts/${item.id}.jpg`,
          fallbackImage: item.image,
        },
        item.quantity
      );
    });
    setFeedback({ type: "success", message: "Added to your cart!" });
  };

  const handleCheckout = () => {
    if (selectionDetails.length === 0) {
      setFeedback({ type: "error", message: "Select at least one part before checking out." });
      return;
    }
    handleAddToCart();
    navigate("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-elevated h-56 sm:h-72 lg:h-80">
        <SafeImage
          src={goatHeroImage}
          alt="Healthy farm-raised goat"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackClassName="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            <ShieldCheck size={13} aria-hidden="true" />
            100% Healthy Goat · Farm Raised · Halal
          </span>
          <h1 className="mt-4 font-display text-2xl sm:text-4xl font-semibold text-white">Book a Goat</h1>
          <p className="mt-2 text-sm sm:text-base text-white/85">
            Select the parts you need and place your order — fresh, hygienic, and delivered to your door.
          </p>
        </div>
      </div>

      {/* Feature image cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {goatFeatureImages.map((feature) => (
          <div
            key={feature.id}
            className="relative rounded-2xl overflow-hidden shadow-soft h-32 sm:h-36 group"
          >
            <SafeImage
              src={feature.image}
              alt={feature.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              fallbackClassName="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-3.5">
              <p className="text-sm font-semibold text-white">{feature.title}</p>
              <p className="text-xs text-white/80">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
        {/* 1. Parts grid */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink mb-3">1. Select Goat Body Parts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {goatParts.map((part) => {
              const selected = selections[part.id] != null;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => togglePart(part)}
                  aria-pressed={selected}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                    selected
                      ? "border-basil-600 bg-basil-50 shadow-soft"
                      : "border-ink-soft/10 bg-white hover:border-basil-300"
                  }`}
                >
                  {selected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-basil-600 text-white flex items-center justify-center">
                      <Check size={12} aria-hidden="true" />
                    </span>
                  )}
                  <GoatPartIllustration part={part} />
                  <span className="text-sm font-medium text-ink">{part.name}</span>
                  <span className="text-xs text-ink-soft/60">${part.pricePerKg.toLocaleString()} /kg</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: 2. Quantity editor, 3. Selection summary */}
        <div className="lg:col-span-1 flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">2. Enter Quantity / Weight</h2>
          {selectionDetails.length === 0 ? (
            <p className="text-sm text-ink-soft/60 rounded-2xl bg-white shadow-soft p-5 text-center">
              Select parts to set their quantity.
            </p>
          ) : (
            <div className="rounded-2xl bg-white shadow-soft overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-soft/60 text-xs uppercase tracking-wide bg-cream">
                    <th className="px-4 py-3 font-medium">Part</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {selectionDetails.map((item) => (
                    <tr key={item.id} className="border-t border-basil-50">
                      <td className="px-4 py-3 text-ink font-medium">
                        {item.name}
                        <p className="text-xs text-ink-soft/60 font-normal mt-0.5">
                          ${item.pricePerKg.toLocaleString()}/kg · ${item.total.toLocaleString()} total
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQuantity(item, item.quantity - goatQtyStep)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-cream text-basil-600 hover:bg-basil-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-[2rem] text-center font-medium text-ink">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item, item.quantity + goatQtyStep)}
                            aria-label={`Increase ${item.name} quantity`}
                            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-cream text-basil-600 hover:bg-basil-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeSelection(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1.5 rounded-full text-tomato-500 hover:bg-tomato-100/50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Selection summary */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white shadow-soft p-5">
            <h3 className="font-display text-base font-semibold text-ink">3. Your Selection</h3>

            {selectionDetails.length === 0 ? (
              <p className="text-sm text-ink-soft/60 mt-4">No parts selected yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {selectionDetails.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <GoatPartIllustration part={item} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink-soft/60">
                          {item.quantity} kg · ${item.pricePerKg.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">${item.total.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeSelection(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1 rounded-full text-tomato-500 hover:bg-tomato-100/50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 pt-4 border-t border-basil-100 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Total Weight</span>
                <span className="text-ink font-medium">{totalWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between text-base mt-1">
                <span className="font-medium text-ink">Total Amount</span>
                <span className="font-semibold text-basil-700">${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {feedback && (
              <p
                role="status"
                className={`mt-3 text-xs text-center ${
                  feedback.type === "error" ? "text-tomato-500" : "text-basil-700"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
            >
              <ShoppingCart size={15} aria-hidden="true" />
              Add to Cart
            </button>
            <button
              onClick={handleCheckout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-ink-soft border border-ink-soft/15 hover:bg-basil-50 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-soft/70 border-t border-basil-100 pt-5">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-basil-600" /> Halal Certified
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={14} className="text-basil-600" /> Farm Fresh
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check size={14} className="text-basil-600" /> Hygienically Packed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Truck size={14} className="text-basil-600" /> Home Delivery Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-basil-600" /> Secure Payment
        </span>
      </div>
    </div>
  );
}
