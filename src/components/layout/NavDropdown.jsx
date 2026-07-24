import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function NavDropdown({ label, isActive, panelClassName = "", hideChevron = false, children }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const closeTimer = useRef(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1 py-1 text-sm font-medium transition-colors ${
          isActive
            ? "text-basil-700 after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-0.5 after:bg-mango-400 after:rounded-full"
            : "text-ink-soft hover:text-basil-600"
        }`}
      >
        {label}
        {!hideChevron && (
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className={`absolute top-full pt-3 z-50 ${panelClassName}`}>
          <div className="bg-white rounded-2xl shadow-elevated overflow-y-auto overflow-x-hidden overscroll-contain max-h-[min(32rem,calc(100vh-6rem))]">
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </div>
  );
}
