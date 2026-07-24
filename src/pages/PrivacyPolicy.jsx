import LegalPage, { LegalSection } from "../components/layout/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <p className="text-sm text-ink-soft leading-relaxed">
        This is placeholder policy content for demonstration purposes — replace it with
        text reviewed by a qualified professional before taking this site live.
      </p>

      <LegalSection heading="Information we collect">
        <p>
          When you create an account, place an order, or contact support, we collect
          information such as your name, email address, phone number, delivery address,
          and order history. We use this information solely to operate the store —
          processing orders, providing support, and improving the shopping experience.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <p>
          Your information is used to fulfill orders, communicate order updates, respond
          to support requests, and — with your consent — send occasional offers and
          newsletters. We do not sell your personal information to third parties.
        </p>
      </LegalSection>

      <LegalSection heading="Data storage and security">
        <p>
          We take reasonable technical and organizational measures to protect your data
          from unauthorized access, loss, or misuse. No online service can guarantee
          absolute security, so we encourage using a strong, unique password for your
          account.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can review and update your account details at any time from My Account, and
          you may request deletion of your account and associated data by contacting
          support.
        </p>
      </LegalSection>

      <LegalSection heading="Contact us">
        <p>
          Questions about this policy can be sent to{" "}
          <a href="mailto:support@daalbhat.com" className="text-basil-600 hover:text-basil-700">
            support@daalbhat.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
