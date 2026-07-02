import { NextResponse } from "next/server";

import { getActiveBusinessContext } from "@/lib/active-business";
import { apiAuthErrorResponse, requireApiUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const { userId } = await requireApiUser();
    const context = await getActiveBusinessContext(userId);
    return NextResponse.json(context);
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
