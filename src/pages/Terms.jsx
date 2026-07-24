import LegalPage, { LegalSection } from "../components/layout/LegalPage";

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 2026">
      <p className="text-sm text-ink-soft leading-relaxed">
        This is placeholder policy content for demonstration purposes — replace it with
        text reviewed by a qualified professional before taking this site live.
      </p>

      <LegalSection heading="Using our site">
        <p>
          By creating an account or placing an order, you agree to provide accurate
          information and to use the site only for lawful purposes. We may suspend or
          close accounts used for fraudulent or abusive activity.
        </p>
      </LegalSection>

      <LegalSection heading="Orders and pricing">
        <p>
          All prices are listed in US Dollars ($) and include applicable taxes unless
          stated otherwise. We reserve the right to correct pricing errors and to cancel
          orders affected by such errors, with a full refund if payment was already made.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery">
        <p>
          Delivery estimates are shown at checkout and are our best estimate, not a
          guarantee. Delays due to weather, regional restrictions, or circumstances beyond
          our control may occasionally occur.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          DaalBhat is not liable for indirect or consequential damages arising from use
          of the site, to the fullest extent permitted by law. Nothing in these terms
          limits liability that cannot legally be excluded.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of the site after a
          change constitutes acceptance of the updated terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
