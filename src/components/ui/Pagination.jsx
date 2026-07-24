import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-soft text-ink-soft disabled:opacity-40 hover:shadow-soft-lg transition-shadow"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-basil-600 text-white shadow-soft"
              : "text-ink-soft hover:bg-basil-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-soft text-ink-soft disabled:opacity-40 hover:shadow-soft-lg transition-shadow"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
