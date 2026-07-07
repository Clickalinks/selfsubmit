import { HMRC_OAUTH_SCOPES, getHmrcConfig } from "@/lib/hmrc-config";

export type HmrcTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

async function parseTokenResponse(response: Response): Promise<HmrcTokenResponse> {
  const payload = (await response.json().catch(() => null)) as
    | (HmrcTokenResponse & { error?: string; error_description?: string })
    | null;

  if (!response.ok || !payload?.access_token) {
    const message = payload?.error_description ?? payload?.error ?? `HMRC token error (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export function buildHmrcAuthorizeUrl(state: string): string {
  const { clientId, redirectUri, apiBase } = getHmrcConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: HMRC_OAUTH_SCOPES,
    state,
    redirect_uri: redirectUri,
  });
  return `${apiBase}/oauth/authorize?${params.toString()}`;
}

export async function exchangeHmrcAuthorizationCode(code: string): Promise<HmrcTokenResponse> {
  const { clientId, clientSecret, redirectUri, apiBase } = getHmrcConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(`${apiBase}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  return parseTokenResponse(response);
}

export async function refreshHmrcAccessToken(refreshToken: string): Promise<HmrcTokenResponse> {
  const { clientId, clientSecret, apiBase } = getHmrcConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${apiBase}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  return parseTokenResponse(response);
}
