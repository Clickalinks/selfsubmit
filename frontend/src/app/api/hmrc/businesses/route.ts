import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchHmrcBusinessList } from "@/lib/hmrc-business-details";
import { getHmrcConnectionStatus } from "@/lib/hmrc-connection-server";
import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { getDecryptedTaxIds } from "@/lib/tax-ids-server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await getHmrcConnectionStatus(userId);
  if (!connection.connected) {
    return NextResponse.json({ error: "Connect your HMRC account first." }, { status: 400 });
  }

  const taxIds = await getDecryptedTaxIds(userId);
  if (!taxIds.niNumber) {
    return NextResponse.json(
      { error: "Add your National Insurance number on the dashboard before loading HMRC businesses." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
  const clerkUser = await currentUser();
  const userLoginId = clerkUser?.primaryEmailAddress?.emailAddress ?? null;

  const result = await fetchHmrcBusinessList({
    userId,
    request,
    nino: taxIds.niNumber,
    fraudContext,
    userLoginId,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ businesses: result.businesses });
}
