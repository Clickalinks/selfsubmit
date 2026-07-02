import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 20_000;

/** Neon cold starts and overlapping Vercel builds can exceed the 10s default lock wait. */
const migrateEnv = {
  ...process.env,
  PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT: process.env.PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT ?? "120000",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    console.log(`[prisma-migrate] deploy attempt ${attempt}/${MAX_ATTEMPTS}`);
    execSync("npx prisma migrate deploy", { stdio: "inherit", env: migrateEnv });
    process.exit(0);
  } catch {
    if (attempt === MAX_ATTEMPTS) {
      console.error("[prisma-migrate] All deploy attempts failed.");
      process.exit(1);
    }
    console.log(`[prisma-migrate] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    await sleep(RETRY_DELAY_MS);
  }
}
