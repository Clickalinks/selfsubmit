/** Canonical list of legal policy routes — used in footers and cross-links. */
export const LEGAL_POLICIES = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/cookies", label: "Cookie policy" },
  { href: "/acceptable-use", label: "Acceptable use" },
  { href: "/refund", label: "Refund policy" },
  { href: "/cancellation", label: "Cancellation policy" },
  { href: "/dpa", label: "Data processing agreement" },
  { href: "/gdpr", label: "GDPR & data protection" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/copyright", label: "Copyright" },
  { href: "/trademark", label: "Trademark" },
  { href: "/anti-fraud", label: "Anti-fraud" },
  { href: "/data-retention", label: "Data retention" },
  { href: "/responsible-disclosure", label: "Responsible disclosure" },
] as const;

export type LegalPolicyHref = (typeof LEGAL_POLICIES)[number]["href"];
