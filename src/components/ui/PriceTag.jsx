export default function PriceTag({ price, oldPrice, size = "md" }) {
  const sizes = {
    sm: "text-sm px-3.5 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-2.5",
  };

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`market-tag font-semibold bg-basil-600 text-cream rounded-full shadow-soft leading-none whitespace-nowrap ${sizes[size]}`}
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
