import { auth } from "@clerk/nextjs/server";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  getReceiptDownloadUrl,
  isBlobStorageConfigured,
  receiptFilePath,
} from "@/lib/receipt-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const receipt = await prisma.receipt.findFirst({
    where: { id, userId },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  if (isBlobStorageConfigured()) {
    const downloadUrl = await getReceiptDownloadUrl(userId, receipt.storagePath);
    if (!downloadUrl) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.redirect(downloadUrl);
  }

  try {
    const buffer = await readFile(receiptFilePath(userId, receipt.storagePath));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": receipt.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(receipt.fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
