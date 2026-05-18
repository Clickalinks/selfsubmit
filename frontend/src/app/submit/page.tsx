import { MonthlyExpenseForm } from "@/components/forms/MonthlyExpenseForm";
import { assertSubmitFormAccess, requireClerkUserId } from "@/server/subscription-guards";

type Props = {
  searchParams: Promise<{ trade?: string }>;
};

export default async function SubmitPage({ searchParams }: Props) {
  const userId = await requireClerkUserId("/submit");
  await assertSubmitFormAccess(userId);

  const sp = await searchParams;
  const trade = typeof sp.trade === "string" ? sp.trade : "";
  return <MonthlyExpenseForm initialTrade={trade} />;
}
