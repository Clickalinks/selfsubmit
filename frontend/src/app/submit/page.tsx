import { MonthlyExpenseForm } from "@/components/forms/MonthlyExpenseForm";
import { prisma } from "@/lib/db";
import { assertSubmitFormAccess, requireClerkUserId } from "@/server/subscription-guards";
import { requireMfaEnabled } from "@/server/mfa-guards";

type Props = {
  searchParams: Promise<{ trade?: string }>;
};

export default async function SubmitPage({ searchParams }: Props) {
  const userId = await requireClerkUserId("/submit");
  await requireMfaEnabled(userId, "/submit");
  await assertSubmitFormAccess(userId);

  const sp = await searchParams;
  const queryTrade = typeof sp.trade === "string" ? sp.trade.trim() : "";

  const [business, profile] = await Promise.all([
    prisma.business.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.clientProfile.findUnique({
      where: { userId },
      select: { primaryProfession: true },
    }),
  ]);

  const initialTrade = queryTrade || business?.category || profile?.primaryProfession || "";

  return <MonthlyExpenseForm initialTrade={initialTrade} />;
}
