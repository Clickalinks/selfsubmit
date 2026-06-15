/**
 * Build-time guard: live Clerk keys must not use unregistered /__clerk proxy.
 * Strips NEXT_PUBLIC_CLERK_PROXY_URL before next build when incompatible.
 */
const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
const proxy = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim() ?? "";

if (pk.startsWith("pk_live_") && proxy.startsWith("/")) {
  console.warn(
    "[clerk-env] Clearing NEXT_PUBLIC_CLERK_PROXY_URL for pk_live_ — use clerk.selfsubmit.co.uk (custom FAPI), not /__clerk proxy.",
  );
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL = "";
}
