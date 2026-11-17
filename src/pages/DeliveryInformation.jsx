import { useState, useEffect } from "react";
import { Truck, Clock, Megaphone, Loader2, Info, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getDeliveryZones } from "../services/deliveryService";
import { getContent, DEFAULT_CONTENT } from "../services/contentService";

const noticeIconMap = {
  Clock,
  Megaphone,
  Truck,
  Info,
  ShieldCheck,
  CheckCircle2,
};

export default function DeliveryInformation() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT["delivery-information"]);

  useEffect(() => {
    let cancelled = false;

    getDeliveryZones()
      .then((data) => {
        if (!cancelled) setZones(data);
      })
      .catch((err) => console.error("Error loading delivery zones:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getContent("delivery-information").then((res) => {
      if (!cancelled && res) {
        setContent((prev) => ({ ...prev, ...res }));
      }
    });

    const handleContentUpdate = (e) => {
      if (e.detail?.key === "delivery-information" && e.detail.data) {
        setContent((prev) => ({ ...prev, ...e.detail.data }));
      }
    };

    window.addEventListener("daalbhat:content-updated", handleContentUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("daalbhat:content-updated", handleContentUpdate);
    };
  }, []);

  const notices = content.notices || DEFAULT_CONTENT["delivery-information"].notices;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
          {content.title || "Delivery Information"}
        </h1>
        <p className="text-ink-soft mt-2 text-sm sm:text-base">
          {content.subtitle || "Delivery days, time slots, and charges for every area we currently serve."}
        </p>
      </div>

      {/* Zone table */}
      <div className="card-elevated rounded-2xl sm:rounded-3xl mt-8 sm:mt-10 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-ink-soft">
              <Loader2 className="animate-spin text-basil-600 mr-2" size={20} />
              Loading delivery zones...
            </div>
          ) : (
            <table className="w-full min-w-[820px] border-collapse table-fixed text-sm">
              <thead>
                <tr className="bg-basil-50 text-left">
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Area</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink min-w-[220px]">Post Codes</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Order Value</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Delivery Charge</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Order Value</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Delivery Charge</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Delivery Days</th>
                  <th className="px-4 sm:px-5 py-3.5 font-semibold text-ink whitespace-nowrap">Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr
                    key={zone.id || zone.name}
                    className={`border-t border-basil-50 ${zone.highlight ? "bg-mango-100/40" : ""}`}
                  >
                    <td className={`px-4 sm:px-5 py-4 font-medium align-top ${zone.highlight ? "text-mango-600" : "text-ink"}`}>
                      {zone.name}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                      {(zone.postcodes || []).join(", ")}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                      {zone.freeAbove}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                      {zone.reducedCharge}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                      {zone.belowRange}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                      {zone.standardCharge}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600 font-medium" : "text-ink-soft"}`}>
                      {zone.days}
                    </td>
                    <td className={`px-4 sm:px-5 py-4 align-top whitespace-nowrap ${zone.highlight ? "text-mango-600 font-medium" : "text-ink-soft"}`}>
                      {zone.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="sm:hidden text-xs text-ink-soft/60 px-4 py-2.5 bg-basil-50/60 border-t border-basil-50">
          Swipe sideways to see all columns →
        </p>
      </div>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          {notices.map((notice, idx) => {
            const Icon = noticeIconMap[notice.icon] || Clock;
            const isMango = idx % 2 === 1;
            return (
              <div key={notice.title || idx} className="card-elevated rounded-2xl p-5 sm:p-6">
                <div className={`w-10 h-10 rounded-full ${isMango ? "bg-mango-100" : "bg-basil-50"} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={isMango ? "text-mango-600" : "text-basil-600"} />
                </div>
                <h2 className="font-display text-lg font-semibold text-ink mb-2">
                  {notice.title}
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                  {notice.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Callout */}
      {content.calloutText && (
        <div className="card-elevated rounded-2xl p-5 sm:p-6 mt-5 flex items-start sm:items-center gap-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-basil-50 flex items-center justify-center">
            <Truck size={18} className="text-basil-600" />
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            {content.calloutText}
          </p>
        </div>
      )}
    </div>
  );
}

