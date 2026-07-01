import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getBusinessCount, getUserPlan, updatePrimaryBusiness } from "@/lib/subscription-server";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  if (!plan) {
    return NextResponse.json({ error: "Choose a plan before setting up your business.", code: "NO_PLAN" }, { status: 403 });
  }

  const businessCount = await getBusinessCount(userId);
  if (businessCount < 1) {
    return NextResponse.json({ error: "No business to update.", code: "NO_BUSINESS" }, { status: 404 });
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

  try {
    const business = await updatePrimaryBusiness(userId, { name: trimmedName, category: trimmedCategory });
    return NextResponse.json({ business });
  } catch {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
}
