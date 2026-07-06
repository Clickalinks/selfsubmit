import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSubmissionForUser } from "@/lib/submissions-server";

type RouteContext = { params: Promise<{ id: string }> };

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

  let payload: unknown = null;
  try {
    payload = JSON.parse(submission.payloadJson);
  } catch {
    payload = null;
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      trade: submission.trade,
      periodFrom: submission.periodFrom.toISOString().slice(0, 10),
      periodTo: submission.periodTo.toISOString().slice(0, 10),
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
      receipts: submission.receipts.map((r) => ({
        ...r,
        uploadedAt: r.uploadedAt.toISOString(),
      })),
    },
  });
}
