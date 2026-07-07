/** HMRC Developer Hub application configuration (sandbox or production). */

export const HMRC_OAUTH_SCOPES = "read:self-assessment write:self-assessment";

export type HmrcConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBase: string;
};

export function isHmrcOAuthConfigured(): boolean {
  return Boolean(
    process.env.HMRC_CLIENT_ID?.trim() &&
      process.env.HMRC_CLIENT_SECRET?.trim() &&
      process.env.HMRC_REDIRECT_URI?.trim() &&
      process.env.HMRC_API_BASE?.trim(),
  );
}

export function getHmrcConfig(): HmrcConfig {
  const clientId = process.env.HMRC_CLIENT_ID?.trim();
  const clientSecret = process.env.HMRC_CLIENT_SECRET?.trim();
  const redirectUri = process.env.HMRC_REDIRECT_URI?.trim();
  const apiBase = process.env.HMRC_API_BASE?.trim()?.replace(/\/$/, "");

  if (!clientId || !clientSecret || !redirectUri || !apiBase) {
    throw new Error("HMRC OAuth is not configured.");
  }

  return { clientId, clientSecret, redirectUri, apiBase };
}
