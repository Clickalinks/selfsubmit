import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { recordLoginSuccess } from "@/lib/login-protection";

type SessionWebhookData = {
  id?: string;
  user_id?: string;
};

async function resolveUserEmail(clerkUserId: string): Promise<string | null> {
  const local = await prisma.user.findUnique({
    where: { id: clerkUserId },
    include: { profile: true },
  });
  if (local?.profile?.email) return local.profile.email;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId) ?? user.emailAddresses[0];
    return primary?.emailAddress ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(request);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const ip =
    request.headers.get("svix-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const userAgent = request.headers.get("user-agent");

  try {
    if (event.type === "session.created") {
      const data = event.data as SessionWebhookData;
      const clerkUserId = data.user_id;
      if (clerkUserId) {
        await prisma.user.upsert({
          where: { id: clerkUserId },
          create: { id: clerkUserId },
          update: {},
        });

        const email = await resolveUserEmail(clerkUserId);
        if (email) {
          await recordLoginSuccess({
            identifier: email,
            ip,
            userAgent,
            userId: clerkUserId,
          });
        }
      }
    }
  } catch (err) {
    console.error("[clerk-webhook]", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
