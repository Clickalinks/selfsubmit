import Link from "next/link";

import { COMPANY, companyRegistrationLine, registeredOfficeSingleLine } from "@/lib/company-details";

type Props = {
  /** compact = footer; full = contact / legal pages */
  variant?: "compact" | "full";
  className?: string;
};

export function CompanyDetails({ variant = "full", className = "" }: Props) {
  const isCompact = variant === "compact";
  const textMuted = isCompact ? "text-gray-500" : "text-brand-muted";
  const textBody = isCompact ? "text-gray-400" : "text-brand-black/90";

  return (
    <div className={`space-y-1.5 text-sm leading-relaxed ${textMuted} ${className}`}>
      <p className={isCompact ? "text-xs text-gray-500 sm:text-sm" : "font-semibold text-brand-black"}>
        {companyRegistrationLine()}
      </p>
      {!isCompact ? (
        <>
          <p>
            <span className="font-medium text-brand-black">Company number:</span> {COMPANY.companyNumber}
          </p>
          <p>
            <span className="font-medium text-brand-black">Registered office:</span>{" "}
            {registeredOfficeSingleLine()}
          </p>
          <p className="text-xs">{COMPANY.registeredOffice.note}</p>
        </>
      ) : (
        <p className="text-xs text-gray-500 sm:text-sm">
          Company no. {COMPANY.companyNumber} · Registered in {COMPANY.jurisdiction}
        </p>
      )}
      {!isCompact ? (
        <p>
          <span className="font-medium text-brand-black">Email:</span>{" "}
          <a
            href={`mailto:${COMPANY.supportEmail}`}
            className="font-semibold text-brand-green underline-offset-2 hover:underline"
          >
            {COMPANY.supportEmail}
          </a>
        </p>
      ) : null}
      {COMPANY.phone ? (
        <p className={textBody}>
          <span className="font-medium">Phone:</span>{" "}
          <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="text-brand-green hover:underline">
            {COMPANY.phone}
          </a>
        </p>
      ) : !isCompact ? (
        <p className={textMuted}>Phone: not published</p>
      ) : null}
      {!isCompact ? (
        <p>
          <span className="font-medium text-brand-black">VAT number:</span>{" "}
          {COMPANY.vatNumber ? (
            COMPANY.vatNumber
          ) : (
            <span className="text-brand-muted">Not yet registered — will be published here when available.</span>
          )}
        </p>
      ) : null}
      {!isCompact ? (
        <p className="pt-1 text-xs text-brand-muted">
          <Link href="/contact" className="text-brand-green underline-offset-2 hover:underline">
            Contact page
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export function FooterCopyright() {
  const year = new Date().getFullYear();
  const start = COMPANY.copyrightStartYear;
  const copyright =
    year > start
      ? `© ${start}–${year} ${COMPANY.tradingName}. All rights reserved.`
      : `© ${start} ${COMPANY.tradingName}. All rights reserved.`;

  return (
    <div className="space-y-2 text-center">
      <p className="text-xs text-gray-500 sm:text-sm">{copyright}</p>
      <CompanyDetails variant="compact" className="text-center" />
    </div>
  );
}
