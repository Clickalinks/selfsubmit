/** Simulated acceptance for practice monthly records until live MTD API is connected. */

export type HmrcMockResult = {
  reference: string;
  status: "practice";
  message: string;
};

export function submitToHmrcMock(params: {
  trade: string;
  periodFrom: string;
  periodTo: string;
  netProfitGbp: number;
}): HmrcMockResult {
  const ref = `HMRC-MOCK-${Date.now().toString(36).toUpperCase()}`;
  return {
    reference: ref,
    status: "practice",
    message: `Practice record saved for ${params.trade} (${params.periodFrom} to ${params.periodTo}). Net profit £${params.netProfitGbp.toFixed(2)}. Not sent to HMRC — live MTD filing is in development.`,
  };
}
