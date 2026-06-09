import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  createMonthlySubmission,
  listSubmissionsForUser,
  type CreateSubmissionInput,
} from "@/lib/submissions-server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await listSubmissionsForUser(userId);
  return NextResponse.json({
    submissions: submissions.map((s) => ({
      ...s,
      periodFrom: s.periodFrom.toISOString().slice(0, 10),
      periodTo: s.periodTo.toISOString().slice(0, 10),
      submittedAt: s.submittedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = parseCreateBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
  }

  try {
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, plan: "solo" },
      update: {},
    });
  } catch {
    // continue
  }

  try {
    const submission = await createMonthlySubmission(userId, input);
    return NextResponse.json(
      {
        submission: {
          id: submission.id,
          trade: submission.trade,
          periodFrom: submission.periodFrom.toISOString().slice(0, 10),
          periodTo: submission.periodTo.toISOString().slice(0, 10),
          status: submission.status,
          hmrcReference: submission.hmrcReference,
          hmrcStatus: submission.hmrcStatus,
          hmrcMessage: submission.hmrcMessage,
          totalIncomeGbp: submission.totalIncomeGbp,
          totalExpensesGbp: submission.totalExpensesGbp,
          netProfitGbp: submission.netProfitGbp,
          submittedAt: submission.submittedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save submission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function parseCreateBody(body: unknown): CreateSubmissionInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.trade !== "string" || typeof b.periodFrom !== "string" || typeof b.periodTo !== "string") {
    return null;
  }
  if (!Array.isArray(b.income) || !Array.isArray(b.expenses) || !b.totals || typeof b.totals !== "object") {
    return null;
  }
  const totals = b.totals as Record<string, unknown>;
  if (
    typeof totals.incomeGbp !== "number" ||
    typeof totals.expensesGbp !== "number" ||
    typeof totals.netProfitGbp !== "number"
  ) {
    return null;
  }

  const parseLines = (arr: unknown[]): CreateSubmissionInput["income"] => {
    return arr
      .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
      .map((x) => ({
        id: String(x.id ?? ""),
        label: String(x.label ?? ""),
        amount: String(x.amount ?? ""),
      }));
  };

  const receiptIds = Array.isArray(b.receiptIds)
    ? b.receiptIds.filter((id): id is string => typeof id === "string")
    : undefined;

  return {
    trade: b.trade,
    periodFrom: b.periodFrom,
    periodTo: b.periodTo,
    templateId: typeof b.templateId === "string" ? b.templateId : undefined,
    vehicleCostMethod: typeof b.vehicleCostMethod === "string" ? b.vehicleCostMethod : null,
    income: parseLines(b.income),
    expenses: parseLines(b.expenses),
    totals: {
      incomeGbp: totals.incomeGbp,
      expensesGbp: totals.expensesGbp,
      netProfitGbp: totals.netProfitGbp,
    },
    receiptIds,
    receiptCapture: b.receiptCapture,
    cis: b.cis,
    simplifiedMileageInputs: b.simplifiedMileageInputs,
  };
}
