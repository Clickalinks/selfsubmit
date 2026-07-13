import type { Metadata } from "next";
import Link from "next/link";

import { PolicyContactEmail, PolicyRelatedLinks } from "@/components/legal/PolicyHelpers";
import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalOl,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Cancellation policy — SelfSubmit",
  description:
    "How to cancel your SelfSubmit subscription, when access ends, and what happens to your data after cancellation.",
};

export default function CancellationPage() {
  return (
    <LegalPageShell
      title="Cancellation policy"
      description="You can cancel your SelfSubmit subscription at any time. This page explains how cancellation works."
      lastUpdated="13 July 2026"
    >
      <LegalH2 id="anytime">1. Cancel anytime</LegalH2>
      <LegalP>
        Paid subscriptions renew monthly until cancelled. There is no minimum contract term beyond the current billing
        period you have paid for.
      </LegalP>

      <LegalH2 id="how">2. How to cancel</LegalH2>
      <LegalOl>
        <li>Sign in to your SelfSubmit dashboard.</li>
        <li>Open billing or subscription settings.</li>
        <li>Select manage billing to open the secure Stripe customer portal.</li>
        <li>Cancel your subscription before the next renewal date.</li>
      </LegalOl>
      <LegalP>
        If you cannot access the portal, email <PolicyContactEmail subject="Cancellation request" /> from your account
        email and we will help you cancel.
      </LegalP>

      <LegalH2 id="access">3. When access ends</LegalH2>
      <LegalP>
        After cancellation, you keep full access until the end of the current paid billing period. You will not be
        charged again unless you re-subscribe.
      </LegalP>
      <LegalP>
        When that paid period ends, paid features (such as new monthly records, receipt uploads, and adding businesses)
        are paused. You then have a <strong>30-day grace period</strong> to download your submissions and receipts,
        permanently delete your account, or resubscribe to continue. After the grace period, you can still sign in to
        export or delete your account or choose a new plan, but new paid features stay locked until you resubscribe.
      </LegalP>

      <LegalH2 id="data">4. Your data after cancellation</LegalH2>
      <LegalP>
        We retain your records according to our{" "}
        <Link href="/data-retention" className="text-brand-green underline underline-offset-2">
          Data retention policy
        </Link>
        . Export anything you need before closing your account. You may request account deletion via{" "}
        <Link href="/contact" className="text-brand-green underline underline-offset-2">
          Contact
        </Link>{" "}
        or your dashboard settings, subject to legal retention requirements (for example tax records).
      </LegalP>

      <LegalH2 id="refunds">5. Refunds on cancellation</LegalH2>
      <LegalP>
        Cancelling stops future charges; it does not automatically refund the current month. See our{" "}
        <Link href="/refund" className="text-brand-green underline underline-offset-2">
          Refund policy
        </Link>{" "}
        for when refunds may apply.
      </LegalP>

      <LegalH2 id="downgrade">6. Downgrades and plan changes</LegalH2>
      <LegalUl>
        <li>Upgrades take effect according to Stripe billing rules when you confirm checkout.</li>
        <li>Downgrades may apply at the next renewal — check the billing portal for timing.</li>
        <li>If you have more businesses than your new plan allows, you may need to remove or archive businesses first.</li>
      </LegalUl>

      <LegalCallout title="Related policies">
        <PolicyRelatedLinks
          links={[
            { href: "/refund", label: "Refund policy" },
            { href: "/terms", label: "Terms of use" },
            { href: "/data-retention", label: "Data retention policy" },
          ]}
        />
      </LegalCallout>

      <LegalFooterNav currentPolicyHref="/cancellation" />
    </LegalPageShell>
  );
}
