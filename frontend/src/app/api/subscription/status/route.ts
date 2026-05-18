import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { maxBusinessesForPlan } from "@/lib/plan-config";
import { canCreateBusiness, getBusinessCount, getUserPlan } from "@/lib/subscription-server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  const businessCount = await getBusinessCount(userId);
  const maxBusinesses = plan ? maxBusinessesForPlan(plan) : 0;
  const canAdd = await canCreateBusiness(userId);

  return NextResponse.json({
    plan,
    businessCount,
    maxBusinesses: Number.isFinite(maxBusinesses) ? maxBusinesses : null,
    canCreateBusiness: canAdd,
  });
}
