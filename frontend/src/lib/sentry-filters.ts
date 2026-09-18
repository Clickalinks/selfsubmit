/** Next.js throws this when a tab still holds Server Action IDs from a previous Vercel deploy. */

export const SENTRY_IGNORE_ERRORS = [
  "Failed to find Server Action",
  "was not found on the server",
  "UnrecognizedActionError",
];

export function isStaleDeploymentServerActionError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    name === "UnrecognizedActionError" ||
    message.includes("Failed to find Server Action") ||
    (message.includes("Server Action") && message.includes("was not found on the server")) ||
    message.includes("older or newer deployment")
  );
}
