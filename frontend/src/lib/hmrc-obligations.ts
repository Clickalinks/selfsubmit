import { hmrcApiRequest } from "@/lib/hmrc-api-client";
import type { HmrcFraudClientContext } from "@/lib/hmrc-fraud-context";

export type HmrcObligationRow = {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: string;
  type: string;
  businessId?: string;
};

type ObligationsApiResponse = {
  obligations?: Array<{
    obligationDetails?: Array<{
      periodStartDate?: string;
      periodEndDate?: string;
      dueDate?: string;
      status?: string;
    }>;
    typeOfBusiness?: string;
    businessId?: string;
  }>;
};

function currentUkTaxYear(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const afterApril5 = month > 4 || (month === 4 && day > 5);
  const startYear = afterApril5 ? year : year - 1;
  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
}

function taxYearDateRange(taxYear: string): { fromDate: string; toDate: string } {
  const [startYear] = taxYear.split("-");
  const y = Number(startYear);
  return {
    fromDate: `${y}-04-06`,
    toDate: `${y + 1}-04-05`,
  };
}

export async function fetchIncomeAndExpenditureObligations(input: {
  userId: string;
  request: Request;
  nino: string;
  fraudContext?: HmrcFraudClientContext | null;
  userLoginId?: string | null;
}): Promise<{ obligations: HmrcObligationRow[] } | { error: string }> {
  const taxYear = currentUkTaxYear();
  const { fromDate, toDate } = taxYearDateRange(taxYear);
  const nino = input.nino.replace(/\s/g, "").toUpperCase();

  const path = `/obligations/details/${encodeURIComponent(nino)}/income-and-expenditure?fromDate=${fromDate}&toDate=${toDate}&status=open`;

  const result = await hmrcApiRequest<ObligationsApiResponse>({
    userId: input.userId,
    request: input.request,
    path,
    fraudContext: input.fraudContext,
    userLoginId: input.userLoginId,
    accept: "application/vnd.hmrc.3.0+json",
    govTestScenario: "DYNAMIC",
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  const rows: HmrcObligationRow[] = [];
  for (const group of result.data.obligations ?? []) {
    for (const detail of group.obligationDetails ?? []) {
      if (!detail.periodStartDate || !detail.periodEndDate || !detail.dueDate) continue;
      rows.push({
        periodStart: detail.periodStartDate,
        periodEnd: detail.periodEndDate,
        dueDate: detail.dueDate,
        status: detail.status ?? "open",
        type: group.typeOfBusiness ?? "self-employment",
        businessId: group.businessId,
      });
    }
  }

  return { obligations: rows };
}
