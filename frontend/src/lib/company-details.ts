/**
 * Registered company details for SelfSubmit (legal pages, footer, contact, HMRC submissions).
 * Update registered office when you move to business premises; add vatNumber when registered.
 */
export const COMPANY = {
  tradingName: "SelfSubmit",
  legalName: "Clicado Media UK Ltd",
  /** Shown as “trading as …” */
  tradingAs: "selfsubmit.co.uk",
  jurisdiction: "England & Wales",
  companyNumber: "16904433",
  registeredOffice: {
    line1: "2 Ernest Johns Mews",
    city: "Exeter",
    postcode: "EX2 5FP",
    /** Shown on legal pages — office may change when premises move */
    note: "Our registered office address. We will update this when our business premises change.",
  },
  supportEmail: "support@selfsubmit.co.uk",
  /** Set when you publish a support phone number, e.g. "+44 …" */
  phone: null as string | null,
  /** Set when VAT registered, e.g. "GB123456789" */
  vatNumber: null as string | null,
  websiteUrl: "https://www.selfsubmit.co.uk",
  copyrightStartYear: 2026,
} as const;

export function registeredOfficeSingleLine(): string {
  const { line1, city, postcode } = COMPANY.registeredOffice;
  return `${line1}, ${city} ${postcode}`;
}

export function companyRegistrationLine(): string {
  return `${COMPANY.legalName} trading as ${COMPANY.tradingAs}. Registered in ${COMPANY.jurisdiction}.`;
}

export function copyrightNotice(year = new Date().getFullYear()): string {
  const start = COMPANY.copyrightStartYear;
  const range = year > start ? `${start}–${year}` : String(start);
  return `© ${range} ${COMPANY.tradingName}. All rights reserved.`;
}
