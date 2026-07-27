/**
 * Promote a Clerk user to super_admin in the database + Clerk publicMetadata.
 *
 * Usage (from frontend/):
 *   node --env-file=.env.local scripts/promote-admin.mjs user_XXXX
 *
 * Then set ADMIN_USER_IDS=user_XXXX in .env.local / Vercel for the allowlist.
 */
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";

const userId = process.argv[2]?.trim();
if (!userId?.startsWith("user_")) {
  console.error("Usage: node --env-file=.env.local scripts/promote-admin.mjs user_XXXX");
  process.exit(1);
}

const secret = process.env.CLERK_SECRET_KEY?.trim();
if (!secret) {
  console.error("CLERK_SECRET_KEY is required");
  process.exit(1);
}

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: secret });

async function main() {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, role: "super_admin" },
    update: { role: "super_admin" },
  });

  const existing = await clerk.users.getUser(userId);
  await clerk.users.updateUser(userId, {
    publicMetadata: {
      ...(existing.publicMetadata as Record<string, unknown>),
      role: "super_admin",
    },
  });

  console.log(`Promoted ${userId} to super_admin`);
  console.log(`Add to Vercel / .env.local: ADMIN_USER_IDS=${userId}`);
  console.log("Then open https://www.selfsubmit.co.uk/admin (MFA required)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
