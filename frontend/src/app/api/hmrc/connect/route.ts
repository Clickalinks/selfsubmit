import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { isEncryptionConfigured } from "@/lib/field-encryption";
import { isHmrcOAuthConfigured } from "@/lib/hmrc-config";
import { buildHmrcAuthorizeUrl } from "@/lib/hmrc-oauth";
import { createOAuthStateCookie } from "@/lib/hmrc-oauth-state";

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in?redirect_url=/dashboard", appOrigin()));
  }

  if (!isHmrcOAuthConfigured() || !isEncryptionConfigured()) {
    return NextResponse.redirect(new URL("/dashboard?setup=hmrc-error&reason=config", appOrigin()));
  }

  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId")?.trim();
  if (businessId) {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
      select: { id: true },
    });
    if (!business) {
      return NextResponse.redirect(new URL("/dashboard?setup=hmrc-error&reason=business", appOrigin()));
    }
  }

  const stateCookie = createOAuthStateCookie(userId, businessId ? { businessId } : undefined);
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
