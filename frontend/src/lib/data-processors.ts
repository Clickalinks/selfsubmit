/** Sub-processors used by SelfSubmit — keep in sync with Privacy, GDPR, and DPA pages. */
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
    name: "Vercel",
    purpose: "Application hosting, CDN, serverless functions",
    dataProcessed: "HTTP logs, deployment metadata, IP addresses",
    location: "United Kingdom (London region) and global CDN edge (see Vercel DPA)",
    website: "https://vercel.com",
  },
  {
    name: "Neon",
    purpose: "PostgreSQL database",
    dataProcessed: "Account, business, submission, receipt metadata, login logs",
    location: "United Kingdom (London)",
    website: "https://neon.tech",
  },
  {
    name: "Vercel Blob",
    purpose: "Receipt and document storage",
    dataProcessed: "Uploaded receipt images and files",
    location: "See Vercel storage region / DPA",
    website: "https://vercel.com/storage/blob",
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
    name: "Twilio",
    purpose: "SMS deadline reminders (opt-in)",
    dataProcessed: "UK mobile number, reminder message content",
    location: "See Twilio DPA",
    website: "https://twilio.com",
  },
  {
    name: "Ideal Postcodes",
    purpose: "UK address lookup",
    dataProcessed: "Postcode and address search queries",
    location: "United Kingdom",
    website: "https://ideal-postcodes.co.uk",
  },
  {
    name: "Sentry",
    purpose: "Application error monitoring and performance diagnostics",
    dataProcessed:
      "Error stack traces, request URLs, browser/device metadata (default PII collection disabled)",
    location: "United States / EU (see Sentry DPA)",
    website: "https://sentry.io",
  },
] as const;
