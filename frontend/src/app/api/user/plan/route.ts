import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isPlanId, type PlanId } from "@/lib/plan-config";
import { setUserPlan } from "@/lib/subscription-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planRaw = body && typeof body === "object" ? (body as { plan?: unknown }).plan : undefined;
  if (typeof planRaw !== "string" || !isPlanId(planRaw)) {
    return NextResponse.json(
      { error: 'Body must include plan: "solo" | "business_plus" | "professional" | "unlimited"' },
      { status: 400 },
    );
  }

  const plan: PlanId = planRaw;
  await setUserPlan(userId, plan);

  return NextResponse.json({ ok: true, plan }, { status: 200 });
}
