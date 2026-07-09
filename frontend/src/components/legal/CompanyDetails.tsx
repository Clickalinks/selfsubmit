import Link from "next/link";

import {
  COMPANY,
  companyRegistrationLine,
  copyrightNotice,
  formatIcoRegistrationDate,
  registeredOfficeSingleLine,
} from "@/lib/company-details";

const ICO_REGISTER_URL = "https://ico.org.uk/ESDWebPages/Search";

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
      {!isCompact && COMPANY.icoRegistrationNumber ? (
        <p>
          <span className="font-medium text-brand-black">ICO registration:</span> {COMPANY.icoRegistrationNumber}
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

/** Short operator line with link to About — use instead of CompanyDetails on non-About pages. */
export function CompanyInfoLink({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-brand-muted ${className}`}>
      <span className="font-semibold text-brand-black">{companyRegistrationLine()}</span> Full registration details are
      on our{" "}
      <Link
        href="/about#company-information"
        className="font-semibold text-brand-green underline-offset-2 hover:underline"
      >
        About us
      </Link>{" "}
      page.
    </p>
  );
}

type IcoProps = {
  className?: string;
};

/** ICO data protection fee registration — fill in COMPANY.icoRegistrationNumber when confirmed. */
export function IcoRegistrationSection({ className = "" }: IcoProps) {
  const registrationNumber = COMPANY.icoRegistrationNumber?.trim();

  return (
    <div className={`text-sm leading-relaxed text-brand-muted ${className}`}>
      <p>
        {COMPANY.legalName} is registered with the Information Commissioner&apos;s Office (ICO) as a data controller
        under UK data protection law.
      </p>
      {registrationNumber ? (
        <>
          <p className="mt-2">
            <span className="font-medium text-brand-black">ICO registration number:</span> {registrationNumber}
          </p>
          {COMPANY.icoRegistrationRegistered && COMPANY.icoRegistrationExpires ? (
            <p className="mt-2 text-xs">
              Registered {formatIcoRegistrationDate(COMPANY.icoRegistrationRegistered)} · Renews{" "}
              {formatIcoRegistrationDate(COMPANY.icoRegistrationExpires)}
            </p>
          ) : null}
          <p className="mt-2 text-xs">
            You can verify our entry on the{" "}
            <a
              href={ICO_REGISTER_URL}
              className="font-semibold text-brand-green underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ICO public register
            </a>
            .
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs italic">
          Our ICO registration number will be published here once confirmation is received.
        </p>
      )}
    </div>
  );
}

export function FooterCopyright() {
  const ico = COMPANY.icoRegistrationNumber?.trim();

  return (
    <p className="text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
      {copyrightNotice()}
      {ico ? <> · ICO registration {ico}</> : null}{" "}
      <Link href="/about#company-information" className="text-brand-green underline-offset-2 hover:underline">
        Company information
      </Link>
    </p>
  );
}
