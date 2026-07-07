import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { deleteHmrcConnection } from "@/lib/hmrc-connection-server";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteHmrcConnection(userId);
  return NextResponse.json({ ok: true });
}
