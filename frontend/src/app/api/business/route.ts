import { NextResponse } from "next/server";

import { getActiveBusinessContext } from "@/lib/active-business";
import { apiAuthErrorResponse, requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const { userId } = await requireApiUser();
    const { searchParams } = new URL(req.url);
    const preferredId = searchParams.get("businessId");
    const context = await getActiveBusinessContext(userId, preferredId);
    return NextResponse.json(context);
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
