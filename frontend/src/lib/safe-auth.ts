import { auth } from "@clerk/nextjs/server";

/** Returns Clerk user id, or null if unauthenticated or Clerk is unavailable (e.g. preview deploy). */
export async function getOptionalUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (err) {
    console.error("[safe-auth] auth() failed", err);
    return null;
  }
}
