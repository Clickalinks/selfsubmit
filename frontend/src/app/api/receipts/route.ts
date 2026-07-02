import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { apiAuthErrorResponse, clientMetaFromRequest, requireApiUser } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/db";
import { UPLOAD_MAX_BYTES, validateUploadFile } from "@/lib/file-validation";
import { extensionForMime, ReceiptStorageError, saveReceiptFile } from "@/lib/receipt-storage";

export async function GET(req: Request) {
  try {
    const { userId } = await requireApiUser();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 100), 1), 200);
    const cursor = searchParams.get("cursor")?.trim() || undefined;

    const receipts = await prisma.receipt.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        title: true,
        uploadedAt: true,
      },
    });

    const hasMore = receipts.length > limit;
    const page = hasMore ? receipts.slice(0, limit) : receipts;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return NextResponse.json({
      receipts: page.map((r) => ({
        ...r,
        uploadedAt: r.uploadedAt.toISOString(),
      })),
      nextCursor,
    });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const { userId, role } = await requireApiUser();
    const meta = clientMetaFromRequest(req as import("next/server").NextRequest);

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

    if (file.size > UPLOAD_MAX_BYTES) {
      return NextResponse.json({ error: "File is too large (max 4 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateUploadFile(file.name || "upload", file.type || "", buffer);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const mimeType = validated.mime;
    const titleRaw = formData.get("title");
    const title =
      typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim().slice(0, 120) : null;

    const amountRaw = formData.get("amountGbp");
    let amountGbp: number | null = null;
    if (typeof amountRaw === "string" && amountRaw.trim()) {
      const n = Number(amountRaw.replace(/£/g, "").replace(/,/g, ""));
      if (Number.isFinite(n) && n >= 0) amountGbp = Math.round(n * 100) / 100;
    }

    const ext = extensionForMime(mimeType);
    const storageKey = `${randomUUID()}${ext}`;

    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    await saveReceiptFile(userId, storageKey, buffer, mimeType);

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        fileName: file.name || `receipt${ext}`,
        storagePath: storageKey,
        mimeType,
        title,
        amountGbp,
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        title: true,
        uploadedAt: true,
      },
    });

    await writeAuditLog({
      userId,
      actorRole: role,
      action: "receipt.upload",
      resource: "receipt",
      resourceId: receipt.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { fileName: receipt.fileName, mimeType },
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
  } catch (err) {
    if (err instanceof ReceiptStorageError) {
      console.error("[receipts/upload]", err.message);
      return NextResponse.json(
        { error: "Could not save receipt file. Check Vercel Blob is connected to this project." },
        { status: 503 },
      );
    }
    return apiAuthErrorResponse(err);
  }
}
