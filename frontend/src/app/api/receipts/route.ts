import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import {
  extensionForMime,
  RECEIPT_ALLOWED_MIME,
  RECEIPT_MAX_BYTES,
  saveReceiptFile,
} from "@/lib/receipt-storage";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await prisma.receipt.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      title: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json({
    receipts: receipts.map((r) => ({
      ...r,
      uploadedAt: r.uploadedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > RECEIPT_MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10 MB)" }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!RECEIPT_ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, HEIC, or PDF." },
      { status: 400 },
    );
  }

  const titleRaw = formData.get("title");
  const title =
    typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim().slice(0, 120) : null;

  const ext = extensionForMime(mimeType);
  const storageKey = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  await saveReceiptFile(userId, storageKey, buffer);

  const receipt = await prisma.receipt.create({
    data: {
      userId,
      fileName: file.name || `receipt${ext}`,
      storagePath: storageKey,
      mimeType,
      title,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      title: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json(
    {
      receipt: {
        ...receipt,
        uploadedAt: receipt.uploadedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
