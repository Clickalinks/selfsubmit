import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Refund policy — SelfSubmit",
  description:
    "How refunds work for SelfSubmit monthly subscriptions, including UK consumer rights and when charges are non-refundable.",
};

export default function RefundPage() {
  return (
    <LegalPageShell
      title="Refund policy"
      description="This policy explains when subscription payments may be refunded. It should be read with our Cancellation policy and Terms of use."
      lastUpdated="6 July 2026"
    >
      <LegalCallout title="Operator">
        <CompanyDetails />
      </LegalCallout>

      <LegalH2 id="billing">1. Billing model</LegalH2>
      <LegalP>
        SelfSubmit is sold as a recurring monthly subscription billed in advance through Stripe. Your plan price is shown
        on the{" "}
        <Link href="/pricing" className="text-brand-green underline underline-offset-2">
          Pricing
        </Link>{" "}
        page before checkout.
      </LegalP>

      <LegalH2 id="consumer">2. UK consumer rights</LegalH2>
      <LegalP>
        If you are a consumer in the UK, you have statutory rights under the Consumer Rights Act 2015 and Consumer
        Contracts (Information, Cancellation and Additional Charges) Regulations 2013. Nothing in this policy limits
        rights that cannot be excluded by law.
      </LegalP>
      <LegalP>
        For digital services, you may have a 14-day right to cancel after purchase if you have not started using the
        service with your agreement. By creating an account and using paid features during that period, you may be asked
        to acknowledge that the service has begun and that your cancellation right may be affected.
      </LegalP>

      <LegalH2 id="refunds">3. When we refund</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Duplicate or erroneous charges</strong> — we will refund confirmed billing
          errors.
        </li>
        <li>
          <strong className="text-brand-black">Service not provided</strong> — if a prolonged outage prevents meaningful
          use and we cannot restore access within a reasonable time, we may offer a pro-rata credit or refund at our
          discretion.
        </li>
        <li>
          <strong className="text-brand-black">Cooling-off</strong> — where the law requires a refund within the
          cancellation period and you have not consented to immediate supply, we will process it.
        </li>
      </LegalUl>

      <LegalH2 id="no-refund">4. When we typically do not refund</LegalH2>
      <LegalUl>
        <li>Change of mind after you have used the service during the current billing period</li>
        <li>Failure to cancel before renewal (see our Cancellation policy)</li>
        <li>Issues caused by inaccurate data you entered or third parties outside our control (for example HMRC downtime)</li>
        <li>Partial use of a month after the billing date — subscriptions are not normally refunded mid-cycle</li>
      </LegalUl>

      <LegalH2 id="how">5. How to request a refund</LegalH2>
      <LegalP>
        Email <PolicyContactEmail subject="Refund request" /> with your account email, the charge date, and reason. We aim
        to respond within five working days. Approved refunds are returned to the original payment method via Stripe.
      </LegalP>

      <LegalH2 id="chargebacks">6. Chargebacks</LegalH2>
      <LegalP>
        Please contact us before raising a card chargeback so we can resolve the issue. Unfounded chargebacks may lead
        to account suspension.
      </LegalP>

      <LegalCallout title="Related policies">
        <PolicyRelatedLinks
          links={[
            { href: "/cancellation", label: "Cancellation policy" },
            { href: "/terms", label: "Terms of use" },
          ]}
        />
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/refund" />
    </LegalPageShell>
  );
}
