export function ProductCardSkeleton() {
  return (
    <div className="card-elevated rounded-3xl overflow-hidden animate-pulse">
      <div className="h-36 bg-basil-50" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-2.5 w-16 bg-basil-50 rounded-full" />
        <div className="h-4 w-full bg-basil-50 rounded-full" />
        <div className="h-4 w-2/3 bg-basil-50 rounded-full" />
        <div className="h-3 w-20 bg-basil-50 rounded-full mt-1" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-7 w-16 bg-basil-50 rounded-full" />
          <div className="h-9 w-9 bg-basil-50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductListItemSkeleton() {
  return (
    <div className="card-elevated rounded-3xl p-4 flex items-center gap-4 animate-pulse">
      <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-basil-50" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-basil-50 rounded-full" />
        <div className="h-4 w-1/2 bg-basil-50 rounded-full" />
        <div className="h-3 w-32 bg-basil-50 rounded-full" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="h-7 w-16 bg-basil-50 rounded-full" />
        <div className="flex gap-1.5">
          <div className="h-9 w-9 bg-basil-50 rounded-full" />
          <div className="h-9 w-9 bg-basil-50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 8 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="card-elevated rounded-3xl p-5 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-basil-50" />
      <div className="h-3 w-16 bg-basil-50 rounded-full" />
    </div>
  );
}
