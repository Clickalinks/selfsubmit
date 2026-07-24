import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { hmrcRateLimitOrNull } from "@/lib/hmrc-api-rate-limit";
import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { retrieveSandboxQuarterlySummary } from "@/lib/hmrc-quarterly-server";

/** Retrieve the cumulative in-year summary HMRC holds for this business (Self Employment MTD). */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = await hmrcRateLimitOrNull(userId);
  if (rateLimited) return rateLimited;

  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId")?.trim();
  const taxYear = url.searchParams.get("taxYear")?.trim() || undefined;

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
  const clerkUser = await currentUser();
  const userLoginId = clerkUser?.primaryEmailAddress?.emailAddress ?? null;

  try {
    const result = await retrieveSandboxQuarterlySummary({
      userId,
      request,
      businessId,
      taxYear,
      fraudContext,
      userLoginId,
    });
    return NextResponse.json({
      ok: true,
      taxYear: result.taxYear,
      summary: result.summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not retrieve HMRC cumulative summary.";
    const status =
      message.includes("not enabled")
        ? 503
        : message.includes("not found") || message.includes("Matching resource")
          ? 404
          : message.includes("Connect") || message.includes("Link") || message.includes("National Insurance")
            ? 400
            : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
