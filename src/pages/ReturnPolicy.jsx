import LegalPage, { LegalSection } from "../components/layout/LegalPage";

export default function ReturnPolicy() {
  return (
    <LegalPage title="Return & Refund Policy" updated="July 2026">
      <LegalSection heading="Packaged & non-perishable items">
        <p>
          Unopened packaged goods (pantry staples, personal care, household items) can be
          returned within 7 days of delivery for a full refund or exchange. Please keep
          the original packaging where possible.
        </p>
      </LegalSection>

      <LegalSection heading="Fresh produce & perishables">
        <p>
          Dairy and other perishables are covered by our freshness
          guarantee instead of the standard return window — if something arrives damaged
          or below quality, contact us within 24 hours of delivery with a photo, and we'll
          issue a replacement or refund right away.
        </p>
      </LegalSection>

      <LegalSection heading="How to request a return">
        <p>
          Reach out via the{" "}
          <a href="/contact" className="text-basil-600 hover:text-basil-700">Contact page</a>{" "}
          or your Order History with your order number and a brief description of the
          issue. Most requests are resolved within 1–2 business days.
        </p>
      </LegalSection>

      <LegalSection heading="Refunds">
        <p>
          Approved refunds are issued to your original payment method (or as store credit
          for Cash on Delivery orders) within 5–7 business days of approval.
        </p>
      </LegalSection>

      <LegalSection heading="Non-returnable items">
        <p>
          For hygiene reasons, opened personal care and baby care items cannot be returned
          unless defective on arrival.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
