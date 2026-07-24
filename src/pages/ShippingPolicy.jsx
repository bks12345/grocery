import LegalPage, { LegalSection } from "../components/layout/LegalPage";

export default function ShippingPolicy() {
  return (
    <LegalPage title="Shipping Policy" updated="July 2026">
      <LegalSection heading="Delivery options">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li><strong className="text-ink">Standard Delivery</strong> — 2 to 3 days, free on orders over $700 ($49 otherwise)</li>
          <li><strong className="text-ink">Express Delivery</strong> — next day, $99 flat rate</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Delivery areas">
        <p>
          We currently deliver within our serviceable pin codes, shown automatically at
          checkout based on your address. If we don't yet deliver to your area, you'll see
          a message at checkout before placing your order.
        </p>
      </LegalSection>

      <LegalSection heading="Order tracking">
        <p>
          Once your order is confirmed, you can track its status anytime from{" "}
          <span className="text-ink font-medium">My Account → Order History</span>.
        </p>
      </LegalSection>

      <LegalSection heading="Missed deliveries">
        <p>
          If you're unavailable at the time of delivery, our courier will attempt to
          contact you and reschedule. Orders that can't be delivered after repeated
          attempts may be returned to us and refunded, minus any delivery fee already
          incurred.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
