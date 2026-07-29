import { useState } from "react";
import { Link } from "react-router-dom";
import { LocateFixed, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { findZoneByPostcode } from "../../data/deliveryZones";

export default function PostcodeCheck({ className = "" }) {
  const [postcode, setPostcode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null); // { zone } | { zone: null } | { locateUnavailable: true } | null

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    setChecking(true);
    setResult(null);
    // Simulated lookup — swap for a real serviceability API once one exists.
    await new Promise((r) => setTimeout(r, 500));
    setResult({ zone: findZoneByPostcode(postcode) });
    setChecking(false);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        // No geocoding service configured — let the shopper know instead of failing silently.
        setChecking(false);
        setResult({ zone: null, locateUnavailable: true });
      },
      () => setChecking(false),
      { timeout: 5000 }
    );
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium text-ink-soft mb-2">Delivery and pickup options</p>

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 flex items-center gap-2 bg-cream shadow-soft focus-within:shadow-soft-lg rounded-full pl-4 pr-2 py-1 transition-shadow">
          <input
            type="text"
            inputMode="numeric"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value);
              setResult(null);
            }}
            placeholder="Enter your postal code"
            aria-label="Postal code"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink placeholder:text-ink-soft/60 py-2"
          />
          <button
            type="button"
            onClick={handleLocate}
            aria-label="Use my current location"
            title="Use my current location"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-ink-soft hover:text-basil-600 hover:bg-basil-50 transition-colors"
          >
            <LocateFixed size={17} />
          </button>
        </div>

        <button
          type="submit"
          disabled={checking || !postcode.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-basil-600 text-white text-sm font-semibold hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {checking && <Loader2 size={15} className="animate-spin" />}
          Check
        </button>
      </form>

      {result && (
        <div className="mt-3 text-sm">
          {result.locateUnavailable ? (
            <p className="text-ink-soft">
              We couldn't detect your postcode automatically — please type it in above.
            </p>
          ) : result.zone ? (
            <p className="flex items-start gap-1.5 text-basil-600">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>
                Delivered to your area on <strong>{result.zone.days}</strong>,{" "}
                {result.zone.time}. {result.zone.reducedCharge} delivery on orders over{" "}
                {result.zone.freeAbove} ({result.zone.standardCharge} below that).
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-tomato-500">
              <XCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                We don't currently deliver to this postcode. See our full{" "}
                <Link to="/delivery-information" className="underline hover:text-tomato-600">
                  delivery coverage
                </Link>
                .
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
