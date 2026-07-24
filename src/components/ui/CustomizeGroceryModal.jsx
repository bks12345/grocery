import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Users, Salad, HeartPulse, ClipboardList, Calendar, Lightbulb, Loader2 } from "lucide-react";
import * as groceryEstimateService from "../../services/groceryEstimateService";

const foodCategories = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "non-vegetarian", label: "Non-Vegetarian" },
  { id: "eggetarian", label: "Eggetarian" },
  { id: "vegan", label: "Vegan" },
];

const dietaryOptions = ["No Preference", "Low Oil", "Low Salt", "Gluten Free", "Others"];

const durationOptions = [
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
];

export default function CustomizeGroceryModal({ onClose }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const saved = groceryEstimateService.loadPreferences();

  const [adults, setAdults] = useState(saved?.adults ?? 2);
  const [children, setChildren] = useState(saved?.children ?? 2);
  const [foodCategory, setFoodCategory] = useState(saved?.foodCategory ?? "");
  const [dietaryPreferences, setDietaryPreferences] = useState(
    saved?.dietaryPreferences ?? ["No Preference"]
  );
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [durationDays, setDurationDays] = useState(saved?.durationDays ?? 30);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalMembers = adults + children;

  // Close on Escape, lock body scroll while open — standard modal a11y behavior.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const adjustAdults = (delta) => setAdults((n) => Math.max(1, Math.min(20, n + delta)));
  const adjustChildren = (delta) => setChildren((n) => Math.max(0, Math.min(20, n + delta)));

  const toggleDietary = (option) => {
    setDietaryPreferences((prev) => {
      if (option === "No Preference") return ["No Preference"];
      const withoutNoPref = prev.filter((p) => p !== "No Preference");
      return withoutNoPref.includes(option)
        ? withoutNoPref.filter((p) => p !== option)
        : [...withoutNoPref, option];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (totalMembers < 1) {
      setError("Please add at least 1 family member.");
      return;
    }
    if (!foodCategory) {
      setError("Please select a food preference.");
      return;
    }

    const prefs = { adults, children, foodCategory, dietaryPreferences, notes, durationDays };

    setSubmitting(true);
    try {
      const result = await groceryEstimateService.estimateGrocery(prefs);
      groceryEstimateService.savePreferences(prefs);
      onClose();
      navigate("/grocery-estimate", { state: { result, prefs } });
    } catch (err) {
      setError(err.message || "Couldn't estimate your grocery list. Please try again.");
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-grocery-title"
    >
      {/* Backdrop: dimmed + blurred, click anywhere on it to close */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-basil-50 flex items-center justify-center shrink-0">
              <Salad size={20} className="text-basil-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="customize-grocery-title" className="font-display text-lg font-semibold text-ink">
                Customize Grocery
              </h2>
              <p className="text-sm text-ink-soft/70 mt-0.5">
                Tell us about your family and preferences, we'll estimate your monthly grocery needs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-basil-50 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* 1. Family members */}
          <fieldset className="rounded-2xl bg-cream shadow-soft p-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-ink px-1">
              <Users size={16} className="text-basil-600" aria-hidden="true" />
              1. Number of Family Members
            </legend>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StepperButton label="Decrease adults" onClick={() => adjustAdults(-1)}>
                  <Minus size={14} />
                </StepperButton>
                <div className="flex flex-col items-center min-w-[3rem]">
                  <span className="text-base font-semibold text-ink">{adults}</span>
                  <span className="text-[11px] text-ink-soft/60">Adults</span>
                </div>
                <StepperButton label="Increase adults" onClick={() => adjustAdults(1)}>
                  <Plus size={14} />
                </StepperButton>
              </div>
              <div className="flex items-center gap-3">
                <StepperButton label="Decrease children" onClick={() => adjustChildren(-1)}>
                  <Minus size={14} />
                </StepperButton>
                <div className="flex flex-col items-center min-w-[3rem]">
                  <span className="text-base font-semibold text-ink">{children}</span>
                  <span className="text-[11px] text-ink-soft/60">Children</span>
                </div>
                <StepperButton label="Increase children" onClick={() => adjustChildren(1)}>
                  <Plus size={14} />
                </StepperButton>
              </div>
            </div>
            <p className="text-xs text-ink-soft/60 mt-2 text-right">
              {totalMembers} Member{totalMembers !== 1 ? "s" : ""} ({adults} Adult{adults !== 1 ? "s" : ""}, {children} Child{children !== 1 ? "ren" : ""})
            </p>
          </fieldset>

          {/* 2. Food category */}
          <fieldset className="rounded-2xl bg-cream shadow-soft p-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-ink px-1">
              <Salad size={16} className="text-basil-600" aria-hidden="true" />
              2. Food Preferences / Category
            </legend>
            <p className="text-xs text-ink-soft/60 mt-1 px-1">Select the type of food items you usually prefer.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {foodCategories.map((option) => (
                <PillButton
                  key={option.id}
                  selected={foodCategory === option.id}
                  onClick={() => setFoodCategory(option.id)}
                >
                  {option.label}
                </PillButton>
              ))}
            </div>
          </fieldset>

          {/* 3. Dietary preferences (optional) */}
          <fieldset className="rounded-2xl bg-cream shadow-soft p-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-ink px-1">
              <HeartPulse size={16} className="text-basil-600" aria-hidden="true" />
              3. Dietary Preferences <span className="font-normal text-ink-soft/60">(Optional)</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <PillButton
                  key={option}
                  selected={dietaryPreferences.includes(option)}
                  onClick={() => toggleDietary(option)}
                >
                  {option}
                </PillButton>
              ))}
            </div>
          </fieldset>

          {/* 4. Duration */}
          <fieldset className="rounded-2xl bg-cream shadow-soft p-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-ink px-1">
              <Calendar size={16} className="text-basil-600" aria-hidden="true" />
              4. Grocery Duration
            </legend>
            <p className="text-xs text-ink-soft/60 mt-1 px-1">How long should this estimate cover?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {durationOptions.map((option) => (
                <PillButton
                  key={option.days}
                  selected={durationDays === option.days}
                  onClick={() => setDurationDays(option.days)}
                >
                  {option.label}
                </PillButton>
              ))}
            </div>
          </fieldset>

          {/* 5. Additional requirements */}
          <label className="rounded-2xl bg-cream shadow-soft p-4 flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardList size={16} className="text-basil-600" aria-hidden="true" />
              5. Additional Requirements <span className="font-normal text-ink-soft/60">(Optional)</span>
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. We need more fruits, less oil, prefer organic products, etc."
              className="px-3 py-2.5 rounded-xl bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink text-sm resize-none"
            />
          </label>

          <div className="flex items-start gap-2 rounded-2xl bg-basil-50 p-3.5">
            <Lightbulb size={16} className="text-basil-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-basil-700">
              We will estimate your grocery list for{" "}
              {durationOptions.find((o) => o.days === durationDays)?.label.toLowerCase() || `${durationDays} days`}{" "}
              based on your family size and preferences.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-tomato-500 text-center">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 rounded-full text-sm font-medium text-ink-soft border border-ink-soft/15 hover:bg-basil-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-basil-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Estimating..." : "Estimate My Grocery"}
            </button>
          </div>

          <p className="text-[11px] text-ink-soft/50 text-center">
            Your preferences are only used to provide better suggestions.
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}

function StepperButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-basil-600 shadow-soft hover:bg-basil-50 transition-colors"
    >
      {children}
    </button>
  );
}

function PillButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
        selected
          ? "bg-basil-600 text-white border-basil-600 shadow-soft"
          : "bg-white text-ink-soft border-ink-soft/15 hover:border-basil-400"
      }`}
    >
      {children}
    </button>
  );
}
