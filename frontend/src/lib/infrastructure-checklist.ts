export type InfraResponsibility = "provider" | "you" | "shared" | "optional";

export type InfrastructureItem = {
  id: string;
  title: string;
  applies: boolean;
  responsibility: InfraResponsibility;
  summary: string;
  providerNote?: string;
  yourActions: string[];
};

/**
 * Infrastructure checklist for SelfSubmit’s managed stack (Vercel + Neon + SaaS providers).
 * You do not run your own servers, hardware firewall, or datacentre — most items are provider-managed
 * with a small set of owner actions.
 */
export const INFRASTRUCTURE_ITEMS: InfrastructureItem[] = [
  {
    id: "backups",
    title: "Backups",
    applies: true,
    responsibility: "shared",
    summary: "Database and file data must be recoverable if something goes wrong.",
    providerNote: "Neon stores PostgreSQL data with automated backups on paid plans. Vercel Blob stores receipt files durably.",
    yourActions: [
      "Neon Dashboard → your project → confirm backup / point-in-time recovery (PITR) is enabled on your plan.",
      "Keep DATABASE_URL and DIRECT_URL only in Vercel env vars — never in git.",
      "Receipts live in Vercel Blob; submissions and records live in Neon — both are production-critical.",
    ],
  },
  {
    id: "backup-testing",
    title: "Backup testing",
    applies: true,
    responsibility: "you",
    summary: "A backup you have never restored is only a hope. Test at least once before HMRC live filing.",
    yourActions: [
      "Neon: create a branch from a restore point or export a snapshot to a dev database quarterly.",
      "Verify you can read submissions, businesses, and receipts metadata after restore.",
      "Log the test date (spreadsheet or internal note) — auditors and insurers like evidence.",
    ],
  },
  {
    id: "dr-plan",
    title: "Disaster recovery (DR) plan",
    applies: true,
    responsibility: "you",
    summary: "A short written plan is enough at your scale — you are not running a secondary datacentre.",
    yourActions: [
      "Document: if Vercel is down → check status.vercel.com, post on /status, wait for provider.",
      "If Neon is down → check neonstatus.com, restore from PITR or failover branch per Neon docs.",
      "If Clerk is down → sign-in blocked; communicate via email/status page; no local workaround.",
      "Owner contact: support@selfsubmit.co.uk. Target: restore service within 24 hours for major outages.",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    applies: true,
    responsibility: "shared",
    summary: "Know when the app or cron jobs fail before users tell you.",
    providerNote: "Vercel shows deployment errors, function failures, and cron run history.",
    yourActions: [
      "Vercel → Project → Logs & Observability — review after each deploy.",
      "Optional: add Sentry (SENTRY_DSN in .env.example) for error alerts.",
      "Optional: UptimeRobot or similar (free) ping https://www.selfsubmit.co.uk and /api/cron/… health if you add one.",
      "Watch Stripe, Clerk, and Resend dashboards for webhook delivery failures.",
    ],
  },
  {
    id: "logs",
    title: "Logs",
    applies: true,
    responsibility: "shared",
    summary: "Runtime and audit trails for debugging and security.",
    providerNote: "Vercel retains function and edge logs. Clerk and Stripe log webhooks and auth events in their dashboards.",
    yourActions: [
      "Use Vercel → Logs when investigating 500 errors or failed cron runs.",
      "Login attempts and security notifications are stored in your Neon database (Settings → Login protection).",
      "Do not log UTR, NI numbers, or passwords in application code.",
      "Optional: Vercel Log Drain to a log service if you need long retention.",
    ],
  },
  {
    id: "uptime",
    title: "Uptime",
    applies: true,
    responsibility: "shared",
    summary: "Availability expectations for customers and HMRC sandbox credibility.",
    providerNote: "Vercel’s global edge network hosts the app; typical SLA depends on your Vercel plan.",
    yourActions: [
      "Publish service health on /status (already on the site).",
      "Subscribe to status.vercel.com and neonstatus.com for provider incidents.",
      "Optional: external uptime monitor emailing you when the homepage is unreachable.",
    ],
  },
  {
    id: "db-monitoring",
    title: "DB monitoring",
    applies: true,
    responsibility: "shared",
    summary: "Database health, connections, and storage.",
    providerNote: "Neon Dashboard shows CPU, connections, storage, and query insights.",
    yourActions: [
      "Neon → Monitoring — set email alerts for storage limits and connection spikes.",
      "Use pooled DATABASE_URL in production (…-pooler… host) as already configured.",
      "Run prisma migrate deploy in CI/build (already in vercel.json buildCommand).",
    ],
  },
  {
    id: "cdn",
    title: "CDN",
    applies: true,
    responsibility: "provider",
    summary: "Fast static delivery and edge caching worldwide.",
    providerNote: "Vercel automatically serves your Next.js app and static assets from its CDN / edge network. No separate CDN to configure.",
    yourActions: ["Ensure images and icons are served from the app domain (already the case)."],
  },
  {
    id: "ddos",
    title: "DDoS protection",
    applies: true,
    responsibility: "shared",
    summary: "Mitigate traffic floods and abusive sign-in patterns.",
    providerNote: "Vercel includes platform-level DDoS mitigation. Clerk Attack protection (bot detection) adds sign-up/sign-in abuse filtering.",
    yourActions: [
      "Keep Clerk bot detection enabled (you already have this).",
      "SelfSubmit login-protection lockouts limit brute-force on your APIs.",
      "Vercel Pro+ offers additional Firewall rules if you ever need IP blocking.",
    ],
  },
  {
    id: "firewall",
    title: "Firewall",
    applies: false,
    responsibility: "provider",
    summary: "Traditional perimeter firewalls apply to servers you own — not this architecture.",
    providerNote:
      "You use serverless functions and a managed database. Security is enforced by HTTPS-only access, Clerk authentication, API route protection, Neon network isolation, and Vercel/platform networking — not a hardware firewall you configure.",
    yourActions: [
      "No action required for a classic firewall.",
      "Optional later: Cloudflare in front of the domain, or Vercel Firewall (paid) for WAF rules.",
      "Keep middleware protecting /dashboard and API routes (already in place).",
    ],
  },
];

export const INFRA_STACK = [
  { layer: "Application & CDN", provider: "Vercel", role: "Hosting, HTTPS, edge CDN, cron, Blob storage" },
  { layer: "Database", provider: "Neon", role: "PostgreSQL — users, submissions, receipts metadata, login logs" },
  { layer: "Authentication", provider: "Clerk", role: "Sign-in, MFA, sessions, attack protection" },
  { layer: "Payments", provider: "Stripe", role: "Subscriptions and billing portal" },
  { layer: "Email", provider: "Resend", role: "Quarterly reminder emails" },
  { layer: "SMS", provider: "Twilio", role: "Optional deadline SMS reminders" },
] as const;
