/**
 * Prisma schema uses directUrl for migrations. When only DATABASE_URL is set
 * (e.g. no separate pooler yet), default DIRECT_URL to DATABASE_URL.
 */
const databaseUrl = process.env.DATABASE_URL?.trim();
const directUrl = process.env.DIRECT_URL?.trim();

if (!directUrl && databaseUrl) {
  process.env.DIRECT_URL = databaseUrl;
  console.log("[ensure-direct-url] DIRECT_URL was unset — using DATABASE_URL.");
}

if (!process.env.DIRECT_URL?.trim()) {
  console.error("[ensure-direct-url] Missing DIRECT_URL and DATABASE_URL.");
  process.exit(1);
}

if (process.env.DIRECT_URL.includes("-pooler")) {
  console.warn(
    "[ensure-direct-url] DIRECT_URL should be the direct Neon host (no -pooler). Use the pooler URL only for DATABASE_URL.",
  );
}
