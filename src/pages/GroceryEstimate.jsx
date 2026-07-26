import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  Pencil,
  Users,
  Salad,
  Leaf,
  Calendar,
  Download,
  ShoppingCart,
  Lightbulb,
  MessageCircleQuestion,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CustomizeGroceryModal from "../components/ui/CustomizeGroceryModal";
import ProductCard from "../components/ui/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeletons";
import { useAsync } from "../hooks/useAsync";
import * as productService from "../services/productService";

const foodCategoryLabels = {
  vegetarian: "Vegetarian",
  "non-vegetarian": "Non-Vegetarian",
  eggetarian: "Eggetarian",
  vegan: "Vegan",
};

export default function GroceryEstimate() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [tab, setTab] = useState("list"); // 'list' | 'breakdown'
  const [editOpen, setEditOpen] = useState(false);
  const [addedAll, setAddedAll] = useState(false);
  const { data: comboDeals, loading: comboLoading } = useAsync(
    () => productService.getComboDeals(),
    []
  );

  // Guard: someone landed here directly (refresh, shared link) without
  // having gone through the modal — send them back to build an estimate.
  if (!state?.result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
          <Salad size={26} className="text-basil-600" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          No grocery estimate yet
        </h1>
        <p className="mt-2 text-ink-soft">
          Tell us about your family and preferences to generate one.
        </p>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-2 mt-6 bg-basil-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
        >
          Customize Grocery
        </button>
        {editOpen && <CustomizeGroceryModal onClose={() => setEditOpen(false)} />}
      </div>
    );
  }

  const { result } = state;
  const { items, summary } = result;

  const categories = [...new Set(items.map((i) => i.category))];
  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
    total: items.filter((i) => i.category === cat).reduce((s, i) => s + i.estimatedPrice, 0),
  }));

  const handleAddAll = () => {
    items.forEach((item) => {
      addItem(
        {
          id: `grocery_${item.key}`,
          name: item.name,
          price: Math.max(1, Math.round(item.estimatedPrice / item.quantity)),
          weight: `1 ${item.unit}`,
          category: "grocery-estimate",
          inStock: true,
        },
        Math.max(1, Math.round(item.quantity))
      );
    });
    setAddedAll(true);
  };

  const handleDownload = () => {
    const lines = [
      "Estimated Grocery List",
      `Family: ${summary.familyMembers} members (${summary.adults} Adults, ${summary.children} Children)`,
      `Duration: ${summary.durationDays} days`,
      "",
      ...items.map((i) => `${i.name}: ${i.quantity} ${i.unit} — $${i.estimatedPrice}`),
      "",
      `Total Estimated Cost: $${summary.totalCost}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-estimate.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-basil-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-basil-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink">
              Your Estimated Grocery is Ready!
            </h1>
            <p className="text-sm text-ink-soft/70 mt-0.5">
              Based on {summary.familyMembers} family members for {summary.durationDays} days
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-full text-sm font-medium text-ink-soft border border-ink-soft/15 hover:bg-basil-50 transition-colors"
        >
          <Pencil size={14} aria-hidden="true" />
          Edit Preferences
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-basil-100">
            <button
              onClick={() => setTab("list")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "list" ? "border-basil-600 text-basil-700" : "border-transparent text-ink-soft hover:text-basil-600"
              }`}
            >
              Estimated Grocery List
            </button>
            <button
              onClick={() => setTab("breakdown")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "breakdown" ? "border-basil-600 text-basil-700" : "border-transparent text-ink-soft hover:text-basil-600"
              }`}
            >
              Category Breakdown
            </button>
          </div>

          {tab === "list" ? (
            <div className="mt-4 rounded-2xl bg-white shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-soft/60 text-xs uppercase tracking-wide bg-cream">
                    <th className="px-4 sm:px-5 py-3 font-medium">Item</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Quantity</th>
                    <th className="px-4 sm:px-5 py-3 font-medium hidden sm:table-cell">Unit</th>
                    <th className="px-4 sm:px-5 py-3 font-medium text-right">Estimated Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.key} className="border-t border-basil-50">
                      <td className="px-4 sm:px-5 py-3 text-ink font-medium">{item.name}</td>
                      <td className="px-4 sm:px-5 py-3 text-ink-soft">
                        {item.quantity} <span className="sm:hidden text-ink-soft/60">{item.unit}</span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-ink-soft hidden sm:table-cell">{item.unit}</td>
                      <td className="px-4 sm:px-5 py-3 text-right text-ink font-medium">
                        ${item.estimatedPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4 border-t border-basil-100 bg-cream">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-basil-700 hover:underline"
                >
                  <Download size={14} aria-hidden="true" />
                  Download Full List
                </button>
                <p className="text-sm">
                  <span className="text-ink-soft">Total Estimated Cost </span>
                  <span className="font-semibold text-ink">${summary.totalCost.toLocaleString()}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {categoryBreakdown.map((group) => (
                <div key={group.category} className="rounded-2xl bg-white shadow-soft p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink text-sm">{group.category}</h3>
                    <span className="text-sm font-semibold text-basil-700">${group.total.toLocaleString()}</span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {group.items.map((item) => (
                      <li key={item.key} className="flex items-center justify-between text-sm text-ink-soft">
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} {item.unit} · ${item.estimatedPrice.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-basil-50 p-3.5">
            <Lightbulb size={16} className="text-basil-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-basil-700">
              This is an estimated list. You can add, remove or change items as per your need.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="rounded-2xl bg-white shadow-soft p-5">
            <h3 className="font-display text-base font-semibold text-ink">Summary</h3>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <SummaryRow icon={Users} label="Family Members" value={`${summary.familyMembers} Members`} />
              <SummaryRow
                icon={Salad}
                label="Food Category"
                value={foodCategoryLabels[summary.foodCategory] || summary.foodCategory}
              />
              <SummaryRow
                icon={Leaf}
                label="Dietary Preference"
                value={summary.dietaryPreferences?.length ? summary.dietaryPreferences.join(", ") : "No Preference"}
              />
              <SummaryRow icon={Calendar} label="Estimated Duration" value={`${summary.durationDays} Days`} />
            </dl>

            <div className="mt-4 pt-4 border-t border-basil-100 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Total Items</span>
                <span className="text-ink font-medium">{summary.totalItems}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Total Quantity</span>
                <span className="text-ink font-medium">{summary.totalQuantity.toFixed(1)} kg / L</span>
              </div>
              <div className="flex justify-between text-base mt-1">
                <span className="font-medium text-ink">Estimated Total</span>
                <span className="font-semibold text-basil-700">${summary.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleAddAll}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
            >
              <ShoppingCart size={15} aria-hidden="true" />
              Add All to Cart
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="w-full mt-2 px-6 py-2.5 rounded-full text-sm font-medium text-ink-soft border border-ink-soft/15 hover:bg-basil-50 transition-colors"
            >
              Customize More
            </button>

            {addedAll && (
              <p role="status" className="mt-3 text-xs text-basil-700 text-center">
                Added to your cart!{" "}
                <Link to="/cart" className="underline font-medium">
                  View cart
                </Link>
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-soft p-5 flex items-center gap-3">
            <MessageCircleQuestion size={22} className="text-basil-600 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Need Help?</p>
              <p className="text-xs text-ink-soft/70">Our experts are here to help you.</p>
            </div>
            <Link
              to="/about"
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-basil-50 text-basil-700 hover:bg-basil-100 transition-colors shrink-0"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Combo packs */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-basil-600 text-xs font-semibold uppercase tracking-wide">
              Bundle & save
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mt-1">
              Combo Packs
            </h2>
            <p className="text-ink-soft text-sm mt-1 max-w-md">
              Round out your estimate with these bundled deals.
            </p>
          </div>
          <Link
            to="/shop?combo=true"
            className="group hidden sm:flex items-center gap-1 text-sm font-medium text-basil-600 hover:text-basil-700 shrink-0"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {comboLoading || !comboDeals ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {comboDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {editOpen && <CustomizeGroceryModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-ink-soft">
        <Icon size={14} className="text-basil-600" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-ink font-medium text-right">{value}</dd>
    </div>
  );
}
