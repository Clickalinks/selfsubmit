import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isHmrcOAuthConfigured } from "@/lib/hmrc-config";
import { buildHmrcAuthorizeUrl } from "@/lib/hmrc-oauth";
import { createOAuthStateCookie } from "@/lib/hmrc-oauth-state";
import { isEncryptionConfigured } from "@/lib/field-encryption";

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in?redirect_url=/dashboard/settings", appOrigin()));
  }

  if (!isHmrcOAuthConfigured() || !isEncryptionConfigured()) {
    return NextResponse.redirect(new URL("/dashboard/settings?hmrc=error&reason=config", appOrigin()));
  }

  const stateCookie = createOAuthStateCookie(userId);
  const authorizeUrl = buildHmrcAuthorizeUrl(stateCookie.stateParam);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(stateCookie.name, stateCookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: stateCookie.maxAge,
  });

  return response;
}
