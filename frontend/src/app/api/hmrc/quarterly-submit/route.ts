import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";
import { submitSandboxQuarterlyUpdate } from "@/lib/hmrc-quarterly-server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const businessId = typeof b.businessId === "string" ? b.businessId.trim() : "";
  const periodEndDate = typeof b.periodEndDate === "string" ? b.periodEndDate.trim() : undefined;

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
  const clerkUser = await currentUser();
  const userLoginId = clerkUser?.primaryEmailAddress?.emailAddress ?? null;

  try {
    const result = await submitSandboxQuarterlyUpdate({
      userId,
      request,
      businessId,
      periodEndDate,
      fraudContext,
      userLoginId,
    });
    return NextResponse.json({
      ok: true,
      submissionId: result.submissionId,
      reference: result.reference,
      preview: result.preview,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit to HMRC sandbox.";
    const status = message.includes("not enabled") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
