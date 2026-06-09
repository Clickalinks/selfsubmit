import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { deleteAllReceiptFiles } from "@/lib/receipt-storage";
import { createClientProfile, getClientProfile, updateClientProfile } from "@/lib/profile-server";
import { hasErrors, validateProfileFields, type ProfileInput } from "@/lib/profile-validation";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getClientProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getClientProfile(userId);
  if (existing) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = parseProfileBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
  }

  const errors = validateProfileFields(input);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", fieldErrors: errors }, { status: 400 });
  }

  const profile = await createClientProfile(userId, input);
  return NextResponse.json({ profile }, { status: 201 });
}

export async function PATCH(req: Request) {
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

  const input = parseProfileBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
  }

  const errors = validateProfileFields(input);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", fieldErrors: errors }, { status: 400 });
  }

  try {
    const profile = await updateClientProfile(userId, input);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await prisma.receipt.findMany({
    where: { userId },
    select: { storagePath: true },
  });
  await deleteAllReceiptFiles(userId);
  await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);

  return NextResponse.json({ ok: true, deletedReceipts: receipts.length });
}

function parseProfileBody(body: unknown): ProfileInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.firstName !== "string" ||
    typeof b.lastName !== "string" ||
    typeof b.homeAddress !== "string" ||
    typeof b.email !== "string" ||
    typeof b.phone !== "string" ||
    typeof b.businessAddress !== "string"
  ) {
    return null;
  }
  if (typeof b.primaryProfession !== "string") return null;

  return {
    firstName: b.firstName,
    lastName: b.lastName,
    homeAddress: b.homeAddress,
    email: b.email,
    phone: b.phone,
    businessAddress: b.businessAddress,
    businessName: typeof b.businessName === "string" ? b.businessName : null,
    businessSameAsHome: Boolean(b.businessSameAsHome),
    primaryProfession: b.primaryProfession,
  };
}
