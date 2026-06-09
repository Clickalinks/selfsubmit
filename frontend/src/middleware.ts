import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) {
    return;
  }
  if (isProtectedPage(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
