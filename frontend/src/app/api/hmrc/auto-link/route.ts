import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiAuthErrorResponse, requireApiUser } from "@/lib/api-auth";
import { autoLinkHmrcBusinessForUser } from "@/lib/hmrc-auto-link";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await requireApiUser();

    const connection = await getHmrcConnectionStatus(userId);
    if (!connection.connected) {
      return NextResponse.json({ error: "Connect your HMRC account first." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const businessId =
      typeof body === "object" && body !== null && "businessId" in body && typeof body.businessId === "string"
        ? body.businessId.trim()
        : "";

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required." }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
      select: { id: true },
    });
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const cookieStore = await cookies();
    const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
    const clerkUser = await currentUser();
    const userLoginId = clerkUser?.primaryEmailAddress?.emailAddress ?? null;

    const result = await autoLinkHmrcBusinessForUser({
      userId,
      businessId,
      request,
      fraudContext,
      userLoginId,
    });

    if (result.linked) {
      return NextResponse.json({ ok: true, hmrcBusinessId: result.hmrcBusinessId });
    }

    const messages: Record<typeof result.reason, string> = {
      no_business: "HMRC did not return a self-employment business for your account.",
      multiple:
        "HMRC returned more than one self-employment business. Link manually in Settings → HMRC business link.",
      api_error: "Could not load businesses from HMRC. Check your NI number matches your HMRC test user.",
      missing_nino: "Add your National Insurance number before linking.",
      not_found: "Could not link this business.",
    };

    return NextResponse.json({ error: messages[result.reason], reason: result.reason }, { status: 400 });
  } catch (error) {
    return apiAuthErrorResponse(error);
  }
}
