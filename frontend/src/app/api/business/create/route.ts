import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isPlanId } from "@/lib/plan-config";
import { prisma } from "@/lib/db";
import { canCreateBusiness, createBusinessRecord, getUserPlan } from "@/lib/subscription-server";

const PLAN_LIMIT_MESSAGE = "Plan limit reached. Upgrade to add more businesses.";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  if (!plan || !isPlanId(plan)) {
    return NextResponse.json({ error: "Choose a plan before adding a business.", code: "NO_PLAN" }, { status: 403 });
  }

  const allowed = await canCreateBusiness(userId);
  if (!allowed) {
    return NextResponse.json({ error: PLAN_LIMIT_MESSAGE, code: "PLAN_LIMIT" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof (body as { name?: unknown }).name === "string" ? (body as { name: string }).name : "";
  const category =
    typeof (body as { category?: unknown }).category === "string" ? (body as { category: string }).category : "";

  const trimmedName = name.trim();
  const trimmedCategory = category.trim();

  if (trimmedName.length < 1 || trimmedName.length > 120) {
    return NextResponse.json({ error: "Business name must be between 1 and 120 characters." }, { status: 400 });
  }
  if (trimmedCategory.length < 1 || trimmedCategory.length > 80) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }

  const created = await createBusinessRecord(userId, { name: trimmedName, category: trimmedCategory });

  await prisma.clientProfile.updateMany({
    where: { userId, OR: [{ primaryProfession: null }, { primaryProfession: "" }] },
    data: { primaryProfession: trimmedCategory },
  });

  return NextResponse.json({ business: { id: created.id } }, { status: 201 });
}
