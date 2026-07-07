import { getHmrcConfig } from "@/lib/hmrc-config";
import { getHmrcAccessToken } from "@/lib/hmrc-connection-server";
import { buildHmrcFraudPreventionHeaders } from "@/lib/hmrc-fraud-prevention";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";

export type HmrcApiError = {
  code: string;
  message: string;
  status: number;
};

export async function hmrcApiRequest<T>(input: {
  userId: string;
  request: Request;
  path: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
  accept: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  govTestScenario?: string;
}): Promise<{ ok: true; data: T } | { ok: false; error: HmrcApiError }> {
  const { apiBase } = getHmrcConfig();
  const accessToken = await getHmrcAccessToken(input.userId);

  const fraudHeaders = buildHmrcFraudPreventionHeaders({
    request: input.request,
    userId: input.userId,
    userLoginId: input.userLoginId,
    fraudContext: input.fraudContext,
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: input.accept,
    "Content-Type": "application/json",
    ...fraudHeaders,
  };

  if (input.govTestScenario) {
    headers["Gov-Test-Scenario"] = input.govTestScenario;
  }

  const response = await fetch(`${apiBase}${input.path}`, {
    method: input.method ?? "GET",
    headers,
    body: input.body !== undefined ? JSON.stringify(input.body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const err = payload as { code?: string; message?: string } | null;
    return {
      ok: false,
      error: {
        code: err?.code ?? "HMRC_API_ERROR",
        message: err?.message ?? `HMRC API error (${response.status})`,
        status: response.status,
      },
    };
  }

  return { ok: true, data: payload as T };
}
