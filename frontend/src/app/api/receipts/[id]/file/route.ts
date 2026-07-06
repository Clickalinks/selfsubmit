import { auth } from "@clerk/nextjs/server";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  isBlobStorageConfigured,
  readReceiptFileBuffer,
  receiptFilePath,
} from "@/lib/receipt-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
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

  const url = new URL(req.url);
  const asDownload = url.searchParams.get("download") === "1";

  let buffer: Buffer | null = null;

  if (isBlobStorageConfigured()) {
    buffer = await readReceiptFileBuffer(userId, receipt.storagePath);
  } else {
    try {
      buffer = await readFile(receiptFilePath(userId, receipt.storagePath));
    } catch {
      buffer = null;
    }
  }

  if (!buffer) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const disposition = asDownload ? "attachment" : "inline";
  const fileName = receipt.fileName.replace(/[^\w.\-()+ ]/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": receipt.mimeType ?? "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
