import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { deleteReceiptFile } from "@/lib/receipt-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
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

  await deleteReceiptFile(userId, receipt.storagePath);
  await prisma.receipt.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
