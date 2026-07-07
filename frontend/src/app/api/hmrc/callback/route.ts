import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { saveHmrcConnection } from "@/lib/hmrc-connection-server";
import { exchangeHmrcAuthorizationCode } from "@/lib/hmrc-oauth";
import { clearOAuthStateCookie, verifyOAuthStateCookie } from "@/lib/hmrc-oauth-state";

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("hmrc_oauth_state")?.value;
  const clearState = clearOAuthStateCookie();

  if (oauthError) {
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?hmrc=error&reason=${encodeURIComponent(oauthError)}`, appOrigin()),
    );
    response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
    return response;
  }

  if (!userId || !code) {
    const response = NextResponse.redirect(new URL("/dashboard/settings?hmrc=error&reason=missing", appOrigin()));
    response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
    return response;
  }

  const verified = verifyOAuthStateCookie(stateCookie, state);
  if (!verified || verified.userId !== userId) {
    const response = NextResponse.redirect(new URL("/dashboard/settings?hmrc=error&reason=state", appOrigin()));
    response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
    return response;
  }

  try {
    const tokens = await exchangeHmrcAuthorizationCode(code);
    await saveHmrcConnection(userId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresInSec: tokens.expires_in,
      scope: tokens.scope,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "token";
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?hmrc=error&reason=${encodeURIComponent(message)}`, appOrigin()),
    );
    response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
    return response;
  }

  const response = NextResponse.redirect(new URL("/dashboard/settings?hmrc=connected", appOrigin()));
  response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
  return response;
}
