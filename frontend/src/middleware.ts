import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Hosts where NEXT_PUBLIC_CLERK_PROXY_URL=/__clerk must be actively proxied. */
function isClerkProxyHost(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "selfsubmit.co.uk" ||
    hostname === "www.selfsubmit.co.uk" ||
    hostname.endsWith(".selfsubmit.co.uk")
  ) {
    return true;
  }
  // Preview deploys inherit NEXT_PUBLIC_CLERK_PROXY_URL from Production env vars.
  return hostname.endsWith(".vercel.app") && hostname.includes("selfsubmit");
}

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

function forwardWithPathname(req: Request, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export default clerkMiddleware(
  async (auth, req) => {
    const pathname = req.nextUrl.pathname;

    if (isPublicApi(req)) {
      return forwardWithPathname(req, pathname);
    }

    if (isProtectedPage(req)) {
      await auth.protect();
    }

    return forwardWithPathname(req, pathname);
  },
  {
    // Proxies /__clerk/* (FAPI + clerk-js bundles) to Clerk.
    frontendApiProxy: {
      enabled: (url) => isClerkProxyHost(url.hostname),
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
