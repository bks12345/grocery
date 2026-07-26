import { Link, useLocation } from "react-router-dom";
import { offersMenu, isOfferActive, offerBadgeStyles } from "../../data/offers";

export default function OffersDropdown({ onNavigate }) {
  const { pathname, search } = useLocation();

  return (
    <div className="w-[27rem] p-3">
      <div className="grid grid-cols-2 gap-1">
        {offersMenu.map((item) => {
          const active = isOfferActive(item, pathname, search);
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-basil-50 text-basil-700 font-semibold"
                  : "text-ink hover:bg-basil-50 hover:text-basil-600"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full ${offerBadgeStyles[item.badge]}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
