/**
 * Named processors shown on Privacy / GDPR pages.
 * Hosting, database, file storage, SMS, and error monitoring are described by
 * category in policy prose rather than listed here by vendor name.
 */
export type DataProcessor = {
  name: string;
  purpose: string;
  dataProcessed: string;
  location: string;
  website: string;
};

export const DATA_PROCESSORS: readonly DataProcessor[] = [
  {
    name: "Clerk",
    purpose: "Authentication, MFA, sessions",
    dataProcessed: "Email, name, sign-in metadata, session tokens",
    location: "United States / UK (see Clerk DPA)",
    website: "https://clerk.com",
  },
  {
    name: "Stripe",
    purpose: "Subscription billing (including free trials)",
    dataProcessed: "Customer ID, payment status (card data held by Stripe only)",
    location: "See Stripe DPA",
    website: "https://stripe.com",
  },
  {
    name: "Resend",
    purpose: "Transactional email",
    dataProcessed: "Email address, reminder message content",
    location: "See Resend DPA",
    website: "https://resend.com",
  },
  {
    name: "Ideal Postcodes",
    purpose: "UK address lookup",
    dataProcessed: "Postcode and address search queries",
    location: "United Kingdom",
    website: "https://ideal-postcodes.co.uk",
  },
] as const;
