import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";
import type { HmrcCumulativeUpdateBody } from "@/lib/hmrc-quarterly-mapper";

export async function submitHmrcCumulativeQuarterlyUpdate(input: {
  userId: string;
  request: Request;
  nino: string;
  businessId: string;
  taxYear: string;
  body: HmrcCumulativeUpdateBody;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ reference: string } | { error: string }> {
  const nino = input.nino.replace(/\s/g, "").toUpperCase();
  const path = `/individuals/business/self-employment/${encodeURIComponent(nino)}/${encodeURIComponent(input.businessId)}/cumulative/${encodeURIComponent(input.taxYear)}`;

  const result = await hmrcApiRequest<Record<string, never>>({
    userId: input.userId,
    request: input.request,
    path,
    method: "PUT",
    body: input.body,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: "application/vnd.hmrc.5.0+json",
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  const reference = `${input.body.periodDates.periodStartDate}_${input.body.periodDates.periodEndDate}`;
  return { reference };
}
