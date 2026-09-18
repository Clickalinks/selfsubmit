import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  normalizePayloadLines,
  parsePayloadJsonValue,
  type SubmissionLineItem,
} from "@/lib/account-export-format";
import { getSubmissionForUser, listMonthlyRecordsInPeriod } from "@/lib/submissions-server";

type RouteContext = { params: Promise<{ id: string }> };

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(_req: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const submission = await getSubmissionForUser(userId, id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const parsed = parsePayloadJsonValue(submission.payloadJson);
  let income = normalizePayloadLines(parsed?.income);
  let expenses = normalizePayloadLines(parsed?.expenses);

  const isQuarterly =
    submission.submissionType === "quarterly_hmrc_sandbox" || submission.status === "sandbox_submitted";

  let monthlyBreakdown: Array<{
    id: string;
    periodFrom: string;
    periodTo: string;
    income: SubmissionLineItem[];
    expenses: SubmissionLineItem[];
  }> = [];

  if (isQuarterly) {
    const monthlies = await listMonthlyRecordsInPeriod({
      userId,
      businessId: submission.businessId,
      trade: submission.trade,
      periodFrom: submission.periodFrom,
      periodTo: submission.periodTo,
    });
    monthlyBreakdown = monthlies.map((row) => {
      const monthlyPayload = parsePayloadJsonValue(row.payloadJson);
      return {
        id: row.id,
        periodFrom: toIsoDate(row.periodFrom),
        periodTo: toIsoDate(row.periodTo),
        income: normalizePayloadLines(monthlyPayload?.income),
        expenses: normalizePayloadLines(monthlyPayload?.expenses),
      };
    });
    const fromMonthlyIncome = monthlyBreakdown.flatMap((row) => row.income);
    const fromMonthlyExpenses = monthlyBreakdown.flatMap((row) => row.expenses);
    if (fromMonthlyIncome.length > 0 || fromMonthlyExpenses.length > 0) {
      income = fromMonthlyIncome;
      expenses = fromMonthlyExpenses;
    }
  }

  const payload = parsed
    ? {
        ...parsed,
        income,
        expenses,
      }
    : { income, expenses };

  return NextResponse.json({
    submission: {
      id: submission.id,
      trade: submission.trade,
      periodFrom: toIsoDate(submission.periodFrom),
      periodTo: toIsoDate(submission.periodTo),
      templateId: submission.templateId,
      submissionType: submission.submissionType,
      status: submission.status,
      totalIncomeGbp: submission.totalIncomeGbp,
      totalExpensesGbp: submission.totalExpensesGbp,
      netProfitGbp: submission.netProfitGbp,
      hmrcReference: submission.hmrcReference,
      hmrcStatus: submission.hmrcStatus,
      hmrcMessage: submission.hmrcMessage,
      submittedAt: submission.submittedAt.toISOString(),
      payload,
      income,
      expenses,
      monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : undefined,
      receipts: submission.receipts.map((r) => ({
        ...r,
        uploadedAt: r.uploadedAt.toISOString(),
      })),
    },
  });
}
