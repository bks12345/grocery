export default function PriceTag({ price, oldPrice, size = "md" }) {
  const sizes = {
    sm: "text-sm px-2.5 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-lg px-4 py-2",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`market-tag font-semibold bg-basil-600 text-cream rounded-full shadow-soft ${sizes[size]}`}
      >
        ${price}
      </span>
      {oldPrice && (
        <span className="text-ink-soft/60 line-through text-sm">
          ${oldPrice}
        </span>
      )}
    </div>
  );
}
