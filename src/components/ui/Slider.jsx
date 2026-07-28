import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Slider({
  items,
  renderItem,
  getKey = (item) => item.id,
  slideClassName = "basis-1/2 sm:basis-1/3 lg:basis-1/4",
  gapClassName = "gap-4 sm:gap-5",
  autoplay = false,
  autoplayInterval = 3500,
  loop = true,
  showArrows = true,
  showDots = false,
  loading = false,
  skeletonCount = 4,
  renderSkeleton,
  ariaLabel = "Carousel",
}) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const measure = useCallback(() => {
    const node = trackRef.current;
    if (!node || node.clientWidth === 0) return;
    setPageCount(Math.max(1, Math.round(node.scrollWidth / node.clientWidth)));
    setPage(Math.round(node.scrollLeft / node.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    const node = trackRef.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure, items, loading]);

  const goToPage = useCallback(
    (targetPage, behavior = "smooth") => {
      const node = trackRef.current;
      if (!node || pageCount <= 1) return;
      const wrapped = ((targetPage % pageCount) + pageCount) % pageCount;
      node.scrollTo({ left: wrapped * node.clientWidth, behavior });
    },
    [pageCount]
  );

  const goNext = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const goPrev = useCallback(() => goToPage(page - 1), [goToPage, page]);

  // Autoplay — pauses on hover/touch and stops entirely while loading or with nothing to loop through
  useEffect(() => {
    if (!autoplay || paused || loading || !items?.length || pageCount <= 1) return;
    const id = setInterval(() => {
      if (loop) {
        goToPage(page + 1);
      } else if (page < pageCount - 1) {
        goToPage(page + 1);
      }
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, paused, loading, items, pageCount, page, loop, autoplayInterval, goToPage]);

  const handleScroll = () => {
    const node = trackRef.current;
    if (!node || node.clientWidth === 0) return;
    setPage(Math.round(node.scrollLeft / node.clientWidth));
  };

  const slideCount = loading ? skeletonCount : items?.length || 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        role="region"
        aria-label={ariaLabel}
        className={`flex ${gapClassName} overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar`}
      >
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className={`snap-start shrink-0 ${slideClassName}`}>
                {renderSkeleton?.()}
              </div>
            ))
          : items.map((item, i) => (
              <div key={getKey(item)} className={`snap-start shrink-0 ${slideClassName}`}>
                {renderItem(item, i)}
              </div>
            ))}
      </div>

      {showArrows && !loading && slideCount > 0 && pageCount > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-elevated text-ink hover:bg-basil-50 hover:text-basil-600 transition-all hover:-translate-y-[calc(50%+2px)]"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-elevated text-ink hover:bg-basil-50 hover:text-basil-600 transition-all hover:-translate-y-[calc(50%+2px)]"
          >
            <ChevronRight size={19} />
          </button>
        </>
      )}

      {showDots && !loading && pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-6 bg-basil-600" : "w-2 bg-basil-200 hover:bg-basil-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
