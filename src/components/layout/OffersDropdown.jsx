import { Link } from "react-router-dom";
import { offersMenu } from "../../data/offers";

export default function OffersDropdown({ onNavigate }) {
  return (
    <div className="w-72 p-2">
      {offersMenu.map((section, i) => (
        <div
          key={section.group}
          className={i > 0 ? "mt-1 pt-2 border-t border-basil-100" : ""}
        >
          <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/60">
            {section.group}
          </p>
          <ul>
            {section.items.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-ink hover:bg-basil-50 transition-colors"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-ink-soft/60 shrink-0">{item.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
