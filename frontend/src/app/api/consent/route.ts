import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { CONSENT_POLICY_VERSION, CONSENT_TYPES, type ConsentType } from "@/lib/consent-config";
import { recordConsent } from "@/lib/consent-server";
import { getRequestIp, getRequestUserAgent } from "@/lib/request-ip";

const ALLOWED_TYPES = new Set<string>(Object.values(CONSENT_TYPES));

export async function POST(request: Request) {
  let body: { consentType?: string; granted?: boolean; policyVersion?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const consentType = body.consentType?.trim();
  if (!consentType || !ALLOWED_TYPES.has(consentType)) {
    return NextResponse.json({ error: "Invalid consent type." }, { status: 400 });
  }

  const granted = body.granted !== false;
  const policyVersion =
    typeof body.policyVersion === "string" && body.policyVersion.trim()
      ? body.policyVersion.trim().slice(0, 32)
      : CONSENT_POLICY_VERSION;

  const { userId } = await auth();
  const ip = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const record = await recordConsent({
      consentType: consentType as ConsentType,
      granted,
      policyVersion,
      userId: userId ?? null,
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json({ ok: true, id: record.id, recordedAt: record.createdAt.toISOString() });
  } catch (err) {
    console.error("[consent]", err);
    return NextResponse.json({ error: "Could not record consent." }, { status: 500 });
  }
}
