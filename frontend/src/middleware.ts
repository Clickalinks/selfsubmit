import "@/lib/clerk-env";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { clerkAppProxyEnabled, reconcileClerkProxyEnv } from "@/lib/clerk-env";

reconcileClerkProxyEnv();

const isProtectedPage = createRouteMatcher([
  "/submit(.*)",
  "/add-business(.*)",
  "/dashboard(.*)",
  "/onboarding(.*)",
]);

const isPublicApi = createRouteMatcher([
  "/api/address(.*)",
  "/api/auth/login-protection(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/webhooks/stripe(.*)",
]);

function canonicalAppUrl(req: Request): URL {
  const url = new URL(req.url);
  if (url.hostname === "selfsubmit.co.uk") {
    url.hostname = "www.selfsubmit.co.uk";
  }
  return url;
}

function forwardWithPathname(req: Request, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

const clerkMiddlewareOptions = clerkAppProxyEnabled()
  ? { frontendApiProxy: { enabled: true } }
  : {
      // Override stale Vercel NEXT_PUBLIC_CLERK_PROXY_URL=/__clerk — use clerk.selfsubmit.co.uk FAPI.
      proxyUrl: "",
      authorizedParties: [
        "https://selfsubmit.co.uk",
        "https://www.selfsubmit.co.uk",
      ],
    };

export default clerkMiddleware(
  async (auth, req) => {
    const pathname = req.nextUrl.pathname;

    // Canonical host: always serve on www (avoids apex /__clerk handshake host_invalid).
    if (req.nextUrl.hostname === "selfsubmit.co.uk") {
      const canonical = canonicalAppUrl(req);
      canonical.pathname = pathname;
      canonical.search = req.nextUrl.search;
      return NextResponse.redirect(canonical, 308);
    }

    // Stale /__clerk URLs from old proxy config — send users to the homepage.
    if (!clerkAppProxyEnabled() && pathname.startsWith("/__clerk")) {
      return NextResponse.redirect(new URL("/", req.url), 307);
    }

    if (isPublicApi(req)) {
      return forwardWithPathname(req, pathname);
    }

    if (isProtectedPage(req)) {
      await auth.protect();
    }

    return forwardWithPathname(req, pathname);
  },
  clerkMiddlewareOptions,
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
