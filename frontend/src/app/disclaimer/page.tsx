import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalCallout,
  LegalFooterNav,
  LegalH2,
  LegalP,
  LegalPageShell,
  LegalUl,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Disclaimer & illustrative content — SelfSubmit",
  description:
    "What on SelfSubmit is factual tooling versus marketing illustration, demo behaviour, and non-reliance on tax outputs.",
};

export default function DisclaimerPage() {
  return (
    <LegalPageShell
      title="Disclaimer, accuracy &amp; illustrative content"
      description="Use this page to understand what you can rely on today, what is product storytelling, and where you must verify with HMRC or a professional."
      lastUpdated="16 April 2026"
    >
      <LegalCallout title="Not tax, legal, or financial advice">
        <p>
          Nothing on this website is professional advice. Tax, National Insurance, VAT, company law, and employment
          status depend on your facts. Always confirm with{" "}
          <a
            href="https://www.gov.uk"
            className="font-semibold text-brand-green underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK
          </a>{" "}
          or a qualified accountant or tax adviser.
        </p>
      </LegalCallout>

      <LegalH2 id="true">What is intended to be factual / careful</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">HMRC references we surface</strong> (for example simplified mileage
          pence-per-mile) are copied from official HMRC material for the purpose of helping you find the same numbers
          you would use on GOV.UK. Rates and rules change; we may not update instantly—always cross-check the live HMRC
          page.
        </li>
        <li>
          <strong className="text-brand-black">Form behaviour</strong> such as validation, saving rows, and period
          dates reflects how we intend the product to work technically. That does not mean the submission has legal
          effect until a compliant filing path exists.
        </li>
      </LegalUl>

      <LegalH2 id="illustration">What is illustrative or demo-only</LegalH2>
      <LegalUl>
        <li>
          <strong className="text-brand-black">Tax calculator outputs</strong> are estimates using simplified bands and
          assumptions (see the calculator footer). They are{" "}
          <strong className="text-brand-black">not</strong> a Self Assessment calculation and do not include every
          adjustment (loss relief, PA taper, pensions in full complexity, student loans in all cases, etc.).
        </li>
        <li>
          <strong className="text-brand-black">“Submit monthly return”</strong> in the demo triggers a browser{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-sm text-brand-black">console.info</code>{" "}
          log and an alert. No return is filed with HMRC from this demo.
        </li>
        <li>
          <strong className="text-brand-black">Landing copy</strong> (including phrases like “MTD compliant” or “submit
          direct to HMRC”) describes product intent and must be read together with this disclaimer until a dated
          release explicitly states live integrations and certifications.
        </li>
        <li>
          <strong className="text-brand-black">Subscription tiers</strong> on the home page (Starter / Standard / Pro
          by income streams) are indicative until checkout and contracts exist.
        </li>
        <li>
          <strong className="text-brand-black">“Sign in”</strong> and similar CTAs may show a toast or placeholder
          behaviour until authentication is implemented.
        </li>
      </LegalUl>

      <LegalH2 id="records">Your records</LegalH2>
      <LegalP>
        You remain responsible for keeping adequate business records under HMRC rules. SelfSubmit does not replace
        your statutory duties.
      </LegalP>

      <LegalH2 id="links">Third-party links</LegalH2>
      <LegalP>
        We may link to GOV.UK, ICO, or other official sites. We are not responsible for their content or availability.
      </LegalP>

      <LegalH2 id="liability">Liability</LegalH2>
      <LegalP>
        To the extent permitted by law, SelfSubmit and its operators exclude liability for loss arising from reliance on
        illustrative or out-of-date information on this demo site. Our{" "}
        <Link href="/terms" className="text-brand-green underline underline-offset-2">
          Terms of use
        </Link>{" "}
        will set out the full legal position for a future commercial service.
      </LegalP>

      <LegalFooterNav />
    </LegalPageShell>
  );
}
