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
 * Infrastructure checklist for SelfSubmit’s managed cloud stack.
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
    providerNote:
      "Our managed PostgreSQL host provides automated backups on paid plans. Receipt and document files are stored in durable cloud object storage.",
    yourActions: [
      "In your managed database console, confirm backup / point-in-time recovery (PITR) is enabled on your plan.",
      "Keep DATABASE_URL and DIRECT_URL only in production environment variables — never in git.",
      "Receipt files live in cloud object storage; submissions and records live in the managed database — both are production-critical.",
    ],
  },
  {
    id: "backup-testing",
    title: "Backup testing",
    applies: true,
    responsibility: "you",
    summary: "A backup you have never restored is only a hope. Test at least once before HMRC live filing.",
    yourActions: [
      "Create a restore branch or export a snapshot to a development database quarterly.",
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
      "Document: if the cloud host is down → check the provider status page, post on /status, wait for the provider.",
      "If the managed database is down → check that provider’s status page; restore from PITR or a failover branch per their docs.",
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
    providerNote: "The cloud host shows deployment errors, function failures, and cron run history.",
    yourActions: [
      "Review host logs and observability after each production deploy.",
      "Keep error-monitoring DSN environment variables set in production for stack-trace alerts.",
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
    providerNote:
      "The cloud host retains function and edge logs. Clerk and Stripe log webhooks and auth events in their dashboards.",
    yourActions: [
      "Use the host’s log viewer when investigating 500 errors or failed cron runs.",
      "Login attempts and security notifications are stored in the managed database (Settings → Login protection).",
      "Do not log UTR, NI numbers, or passwords in application code.",
      "Optional: forward host logs to a log service if you need long retention.",
    ],
  },
  {
    id: "uptime",
    title: "Uptime",
    applies: true,
    responsibility: "shared",
    summary: "Availability expectations for customers and HMRC sandbox credibility.",
    providerNote: "A global edge network hosts the app; typical SLA depends on your cloud hosting plan.",
    yourActions: [
      "Publish service health on /status (already on the site).",
      "Subscribe to your cloud host and database provider status pages for incidents.",
      "Optional: external uptime monitor emailing you when the homepage is unreachable.",
    ],
  },
  {
    id: "db-monitoring",
    title: "DB monitoring",
    applies: true,
    responsibility: "shared",
    summary: "Database health, connections, and storage.",
    providerNote: "The managed database console shows CPU, connections, storage, and query insights.",
    yourActions: [
      "Set email alerts for storage limits and connection spikes in the database console.",
      "Use pooled DATABASE_URL in production (…-pooler… host) as already configured.",
      "Run prisma migrate deploy in CI/build (already in the production build command).",
    ],
  },
  {
    id: "cdn",
    title: "CDN",
    applies: true,
    responsibility: "provider",
    summary: "Fast static delivery and edge caching worldwide.",
    providerNote:
      "The cloud host automatically serves the Next.js app and static assets from its CDN / edge network. No separate CDN to configure.",
    yourActions: ["Ensure images and icons are served from the app domain (already the case)."],
  },
  {
    id: "ddos",
    title: "DDoS protection",
    applies: true,
    responsibility: "shared",
    summary: "Mitigate traffic floods and abusive sign-in patterns.",
    providerNote:
      "The cloud host includes platform-level DDoS mitigation. Clerk Attack protection (bot detection) adds sign-up/sign-in abuse filtering.",
    yourActions: [
      "Keep Clerk bot detection enabled (you already have this).",
      "SelfSubmit login-protection lockouts limit brute-force on your APIs.",
      "Higher hosting plans may offer additional WAF / IP rules if you ever need them.",
    ],
  },
  {
    id: "firewall",
    title: "Firewall",
    applies: false,
    responsibility: "provider",
    summary: "Traditional perimeter firewalls apply to servers you own — not this architecture.",
    providerNote:
      "You use serverless functions and a managed database. Security is enforced by HTTPS-only access, Clerk authentication, API route protection, database network isolation, and platform networking — not a hardware firewall you configure.",
    yourActions: [
      "No action required for a classic firewall.",
      "Optional later: a CDN/WAF in front of the domain, or host firewall rules on a higher plan.",
      "Keep middleware protecting /dashboard and API routes (already in place).",
    ],
  },
];

export const INFRA_STACK = [
  {
    layer: "Application & CDN",
    provider: "Managed cloud host",
    role: "Hosting, HTTPS, edge CDN, cron, file storage",
  },
  {
    layer: "Database",
    provider: "Managed PostgreSQL",
    role: "Users, submissions, receipts metadata, login logs",
  },
  { layer: "Authentication", provider: "Clerk", role: "Sign-in, MFA, sessions, attack protection" },
  { layer: "Payments", provider: "Stripe", role: "Subscriptions and billing portal" },
  { layer: "Email", provider: "Resend", role: "Quarterly reminder emails" },
  { layer: "SMS", provider: "SMS provider (optional)", role: "Optional deadline SMS reminders" },
] as const;
