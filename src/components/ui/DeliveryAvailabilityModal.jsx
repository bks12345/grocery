import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { PackageCheck, X, MapPinCheck } from "lucide-react";
import { getFeaturedPostcodes } from "../../services/deliveryService";

export default function DeliveryAvailabilityModal() {
  const [open, setOpen] = useState(false);
  const [postcodes, setPostcodes] = useState([]);
  const dialogRef = useRef(null);

  useEffect(() => {
    // Load available postcodes
    getFeaturedPostcodes(6).then((codes) => {
      if (codes && codes.length > 0) {
        setPostcodes(codes);
      }
    });

    const timer = setTimeout(() => {
      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || postcodes.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-availability-title"
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-modal-fade"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-elevated outline-none animate-modal-pop"
      >
        <button
          onClick={handleClose}
          aria-label="Close delivery notice"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-basil-50 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 pt-8 sm:pt-9 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-basil-50 flex items-center justify-center">
            <PackageCheck size={28} className="text-basil-600" aria-hidden="true" />
          </div>
          <h2
            id="delivery-availability-title"
            className="font-display text-2xl font-bold text-ink"
          >
            📦 Delivery Availability
          </h2>

          <p className="mt-3 text-sm sm:text-base text-ink-soft">
            Currently, we deliver only to the following postal codes:
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {postcodes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-2xl bg-basil-600 text-white font-semibold text-sm sm:text-base shadow-sm"
              >
                {code}
              </span>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-ink-soft">
            <MapPinCheck size={15} className="text-basil-600 shrink-0" aria-hidden="true" />
            Please make sure your postal code is listed above before placing your order.
          </p>

          <button
            onClick={handleClose}
            className="mt-7 w-full px-6 py-3.5 rounded-full bg-basil-600 text-white text-base font-semibold hover:bg-basil-700 hover:shadow-glow transition-all"
          >
            Got it, Continue Shopping
          </button>

          <Link
            to="/delivery-information"
            onClick={handleClose}
            className="inline-block mt-4 text-xs text-ink-soft/70 underline hover:text-basil-600 transition-colors"
          >
            View full delivery coverage
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
