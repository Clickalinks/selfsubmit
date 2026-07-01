import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isEncryptionConfigured } from "@/lib/field-encryption";
import { getTaxIdsStatus, saveTaxIds } from "@/lib/tax-ids-server";
import { validateNiNumber, validateUtr } from "@/lib/tax-id-validation";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getTaxIdsStatus(userId);
  return NextResponse.json(status);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: "Tax ID storage is not configured on this server. Contact support." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const utr = typeof b.utr === "string" ? b.utr : "";
  const niNumber = typeof b.niNumber === "string" ? b.niNumber : "";

  const utrError = validateUtr(utr);
  const niError = validateNiNumber(niNumber);
  if (utrError || niError) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: { utr: utrError ?? undefined, niNumber: niError ?? undefined } },
      { status: 400 },
    );
  }

  try {
    await saveTaxIds(userId, utr, niNumber);
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const status = await getTaxIdsStatus(userId);
  return NextResponse.json({ ok: true, ...status });
}
