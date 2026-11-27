import { NextResponse } from "next/server";

import { getSystemHealthSnapshot } from "@/lib/system-status";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = "no-store, max-age=0, must-revalidate";

export async function GET() {
  const snapshot = await getSystemHealthSnapshot();
  return NextResponse.json(snapshot, {
    status: snapshot.database === "outage" ? 503 : 200,
    headers: { "Cache-Control": NO_STORE },
  });
}
