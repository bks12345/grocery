import { Truck, Clock, Megaphone } from "lucide-react";
import { deliveryZones } from "../data/deliveryZones";


export default function DeliveryInformation() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
          Delivery Information
        </h1>
        <p className="text-ink-soft mt-2 text-sm sm:text-base">
          Delivery days, time slots, and charges for every area we currently serve.
        </p>
      </div>

      {/* Zone table */}
      <div className="card-elevated rounded-2xl sm:rounded-3xl mt-8 sm:mt-10 overflow-hidden">
        <div className="overflow-x-auto">
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
              {deliveryZones.map((zone) => (
                <tr
                  key={zone.name}
                  className={`border-t border-basil-50 ${zone.highlight ? "bg-mango-100/40" : ""}`}
                >
                  <td className={`px-4 sm:px-5 py-4 font-medium align-top ${zone.highlight ? "text-mango-600" : "text-ink"}`}>
                    {zone.name}
                  </td>
                  <td className={`px-4 sm:px-5 py-4 align-top ${zone.highlight ? "text-mango-600" : "text-ink-soft"}`}>
                    {zone.postcodes.join(", ")}
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
        </div>
        <p className="sm:hidden text-xs text-ink-soft/60 px-4 py-2.5 bg-basil-50/60 border-t border-basil-50">
          Swipe sideways to see all columns →
        </p>
      </div>

      {/* Notices */}
      <div className="grid sm:grid-cols-2 gap-5 mt-10">
        <div className="card-elevated rounded-2xl p-5 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-basil-50 flex items-center justify-center mb-4">
            <Clock size={18} className="text-basil-600" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">
            Same Day Deliveries
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit, eaque asperiores. Saepe, itaque. Beatae quibusdam dolores fuga nemo. Quo quia voluptates distinctio id exercitationem labore omnis eos voluptate, fuga aut.
          </p>
        </div>

        <div className="card-elevated rounded-2xl p-5 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-mango-100 flex items-center justify-center mb-4">
            <Megaphone size={18} className="text-mango-600" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">
            Delivery Charge
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit aspernatur ex neque, veniam dolor aliquid id quam inventore odit aliquam ea autem suscipit ut, pariatur facere enim repellendus expedita? Iure.
          </p>
        </div>
      </div>

      {/* Callout */}
      <div className="card-elevated rounded-2xl p-5 sm:p-6 mt-5 flex items-start sm:items-center gap-4">
        <div className="w-10 h-10 shrink-0 rounded-full bg-basil-50 flex items-center justify-center">
          <Truck size={18} className="text-basil-600" />
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          Not sure which zone you're in? Enter your postcode at checkout and we'll show
          your exact delivery day, time slot, and charge before you pay.
        </p>
      </div>
    </div>
  );
}
