import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { deleteHmrcConnection } from "@/lib/hmrc-connection-server";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  await deleteHmrcConnection(userId);
  return NextResponse.json({ ok: true });
}
