import { NextResponse } from "next/server";

import {
  ACTIVE_BUSINESS_COOKIE,
  ACTIVE_BUSINESS_COOKIE_OPTIONS,
  assertBusinessOwned,
} from "@/lib/active-business";
import { apiAuthErrorResponse, requireApiUser } from "@/lib/api-auth";

export async function PATCH(req: Request) {
  try {
    const { userId } = await requireApiUser();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const businessId =
      body && typeof body === "object" ? (body as { businessId?: unknown }).businessId : undefined;
    if (typeof businessId !== "string" || !businessId.trim()) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const business = await assertBusinessOwned(userId, businessId.trim());

    const response = NextResponse.json({
      ok: true,
      activeBusinessId: business.id,
      business,
    });

    response.cookies.set(ACTIVE_BUSINESS_COOKIE, business.id, ACTIVE_BUSINESS_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    if (err instanceof Error && err.message === "Business not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return apiAuthErrorResponse(err);
  }
}
