import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk FAPI proxy is optional. SelfSubmit uses the custom FAPI domain
 * (clerk.selfsubmit.co.uk) from the publishable key — do not set
 * NEXT_PUBLIC_CLERK_PROXY_URL unless you have also registered the proxy URL
 * in Clerk Dashboard → Domains → Frontend API.
 */
const clerkProxyEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim());

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
  clerkProxyEnabled
    ? {
        frontendApiProxy: { enabled: true },
      }
    : undefined,
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
