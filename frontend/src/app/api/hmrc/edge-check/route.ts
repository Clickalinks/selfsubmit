import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { buildHmrcFraudPreventionHeaders } from "@/lib/hmrc-fraud-prevention";
import { getCloudflareEdgeInfo } from "@/lib/cloudflare-edge";

/** Signed-in check that Cloudflare is passing the client port before re-submitting to HMRC. */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const edge = getCloudflareEdgeInfo(request);
  const headers = await buildHmrcFraudPreventionHeaders({ request, userId });

  return NextResponse.json(
    {
      viaCloudflare: Boolean(edge),
      clientPortDetected: Boolean(headers["Gov-Client-Public-Port"]),
      "Gov-Client-Public-IP": headers["Gov-Client-Public-IP"],
      "Gov-Client-Public-Port": headers["Gov-Client-Public-Port"] ?? null,
      "Gov-Vendor-Public-IP": headers["Gov-Vendor-Public-IP"],
      "Gov-Vendor-Forwarded": headers["Gov-Vendor-Forwarded"],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
