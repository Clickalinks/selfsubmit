import Link from "next/link";

import { CompanyDetails } from "@/components/legal/CompanyDetails";
import { LegalCallout } from "@/components/legal/LegalPageShell";
import { COMPANY } from "@/lib/company-details";

type PolicyRelatedLinksProps = {
  links: { href: string; label: string }[];
};

/** Full data-controller block with company registration details — use on Privacy, GDPR, and DPA only. */
export function DataControllerCallout({ children }: { children: React.ReactNode }) {
  return (
    <LegalCallout title="Data controller">
      <CompanyDetails />
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </LegalCallout>
  );
}

export function PolicyRelatedLinks({ links }: PolicyRelatedLinksProps) {
  return (
    <p className="text-sm leading-relaxed">
      {links.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? (index === links.length - 1 ? ", and " : ", ") : null}
          <Link href={link.href} className="font-semibold text-brand-green underline underline-offset-2">
            {link.label}
          </Link>
        </span>
      ))}
      .
    </p>
  );
}

export function PolicyContactEmail({ subject }: { subject?: string }) {
  const href = subject
    ? `mailto:${COMPANY.supportEmail}?subject=${encodeURIComponent(subject)}`
    : `mailto:${COMPANY.supportEmail}`;
  return (
    <a href={href} className="font-semibold text-brand-green underline underline-offset-2">
      {COMPANY.supportEmail}
    </a>
  );
}
