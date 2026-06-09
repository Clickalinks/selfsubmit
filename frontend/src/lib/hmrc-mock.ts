/** Simulated HMRC acceptance for monthly returns until live MTD API is connected. */

export type HmrcMockResult = {
  reference: string;
  status: "accepted";
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
    status: "accepted",
    message: `Mock acceptance for ${params.trade} (${params.periodFrom} to ${params.periodTo}). Net profit £${params.netProfitGbp.toFixed(2)}. Connect live MTD when ready.`,
  };
}
