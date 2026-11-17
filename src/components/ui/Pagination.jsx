import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPages();

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className || "mt-10"}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white shadow-soft text-ink-soft disabled:opacity-40 hover:shadow-soft-lg transition-shadow cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) => {
        if (page === "...") {
          return (
            <span key={`dots-${idx}`} className="px-1 text-ink-soft/50 text-xs select-none">
              …
            </span>
          );
        }
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              page === currentPage
                ? "bg-basil-600 text-white shadow-soft"
                : "text-ink-soft hover:bg-basil-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white shadow-soft text-ink-soft disabled:opacity-40 hover:shadow-soft-lg transition-shadow cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
