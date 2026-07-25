import { Link, useLocation } from "react-router-dom";

export default function FloatingOrderButton() {
  const { pathname } = useLocation();

  // Keep it off the admin panel and off its own destination page.
  if (pathname.startsWith("/admin") || pathname === "/order-from-nepal") {
    return null;
  }

  return (
    <Link
      to="/order-from-nepal"
      aria-label="Order from Nepal"
      className="group fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-basil-600 pl-3.5 pr-4 py-3.5 sm:pl-4 sm:pr-5 sm:py-4 text-white shadow-elevated transition-all hover:bg-basil-700 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="absolute inset-0 rounded-full bg-basil-600/60 animate-order-btn-pulse -z-10" aria-hidden="true" />
      <span className="text-lg sm:text-xl leading-none">🇳🇵</span>
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
        Order from Nepal
      </span>
    </Link>
  );
}
