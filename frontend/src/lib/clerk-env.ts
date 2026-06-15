/**
 * Live Clerk keys (pk_live_*) embed the custom FAPI host clerk.selfsubmit.co.uk.
 * NEXT_PUBLIC_CLERK_PROXY_URL=/__clerk is incompatible unless registered in
 * Clerk Dashboard → Domains → Frontend API. When both are set, Clerk SSR crashes
 * (window is not defined) and API calls return host_invalid.
 */
function publishableKey(): string {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
}

const PROXY_ENV = "NEXT_PUBLIC_CLERK_PROXY_URL";

function proxyUrl(): string {
  return process.env[PROXY_ENV]?.trim() ?? "";
}

/** Relative app-domain proxy (e.g. /__clerk) must not be used with live custom FAPI keys. */
export function usesIncompatibleClerkAppProxy(): boolean {
  const proxy = proxyUrl();
  return publishableKey().startsWith("pk_live_") && proxy.startsWith("/");
}

/** Whether clerkMiddleware should proxy /__clerk to Clerk FAPI. */
export function clerkAppProxyEnabled(): boolean {
  if (!proxyUrl()) return false;
  if (usesIncompatibleClerkAppProxy()) return false;
  return true;
}

/** Strip bad proxy env before ClerkProvider / auth() read it (server runtime). */
export function reconcileClerkProxyEnv(): void {
  if (usesIncompatibleClerkAppProxy()) {
    process.env[PROXY_ENV] = "";
  }
}

/**
 * Clerk merges `props.proxyUrl || process.env.NEXT_PUBLIC_CLERK_PROXY_URL`.
 * Empty string props lose to a stale Vercel env, so pass a truthy absolute URL
 * that avoids relative /__clerk (SSR window crash) when live keys use custom FAPI.
 */
export function clerkProviderProxyUrl(): string | undefined {
  if (!usesIncompatibleClerkAppProxy()) return undefined;
  const encoded = publishableKey().replace(/^pk_(live|test)_/, "");
  try {
    const host = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "").trim();
    if (host.includes(".")) return `https://${host}`;
  } catch {
    // fall through
  }
  return undefined;
}

reconcileClerkProxyEnv();
