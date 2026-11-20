import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { autoLinkHmrcBusinessForUser } from "@/lib/hmrc-auto-link";
import { saveHmrcConnection } from "@/lib/hmrc-connection-server";
import { readFraudContextCookie } from "@/lib/hmrc-fraud-context";
import { exchangeHmrcAuthorizationCode } from "@/lib/hmrc-oauth";
import { clearOAuthStateCookie, verifyOAuthStateCookie } from "@/lib/hmrc-oauth-state";

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

function dashboardRedirect(path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, appOrigin()));
  const clearState = clearOAuthStateCookie();
  response.cookies.set(clearState.name, clearState.value, { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("hmrc_oauth_state")?.value;

  if (oauthError) {
    return dashboardRedirect(`/dashboard?setup=hmrc-error&reason=${encodeURIComponent(oauthError)}`);
  }

  if (!userId || !code) {
    return dashboardRedirect("/dashboard?setup=hmrc-error&reason=missing");
  }

  const verified = verifyOAuthStateCookie(stateCookie, state);
  if (!verified || verified.userId !== userId) {
    return dashboardRedirect("/dashboard?setup=hmrc-error&reason=state");
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
    return dashboardRedirect(`/dashboard?setup=hmrc-error&reason=${encodeURIComponent(message)}`);
  }

  if (verified.businessId) {
    const fraudContext = readFraudContextCookie(cookieStore.get("hmrc_fp_ctx")?.value);
    const clerkUser = await currentUser();
    const userLoginId = clerkUser?.primaryEmailAddress?.emailAddress ?? null;

    const linkResult = await autoLinkHmrcBusinessForUser({
      userId,
      businessId: verified.businessId,
      request,
      fraudContext,
      userLoginId,
    });

    if (linkResult.linked) {
      return dashboardRedirect("/dashboard?setup=linked");
    }

    if (linkResult.reason === "multiple") {
      return dashboardRedirect("/dashboard?setup=link-multiple");
    }

    return dashboardRedirect("/dashboard?setup=connected");
  }

  return dashboardRedirect("/dashboard?setup=connected");
}
