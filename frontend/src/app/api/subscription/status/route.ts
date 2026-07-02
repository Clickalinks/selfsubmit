import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { maxBusinessesForPlan } from "@/lib/plan-config";
import {
  canCreateBusiness,
  getBusinessCount,
  getPrimaryBusiness,
  getUserPlan,
} from "@/lib/subscription-server";
import { listBusinessesForUser } from "@/lib/active-business";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  const businessCount = await getBusinessCount(userId);
  const maxBusinesses = plan ? maxBusinessesForPlan(plan) : 0;
  const canAdd = await canCreateBusiness(userId);
  const primaryBusiness = businessCount > 0 ? await getPrimaryBusiness(userId) : null;
  const businesses = businessCount > 0 ? await listBusinessesForUser(userId) : [];

  return NextResponse.json({
    plan,
    businessCount,
    maxBusinesses,
    canCreateBusiness: canAdd,
    primaryBusiness,
    businesses,
  });
}
