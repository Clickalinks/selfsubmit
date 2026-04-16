import { MonthlyExpenseForm } from "@/components/forms/MonthlyExpenseForm";

type Props = {
  searchParams: Promise<{ trade?: string }>;
};

export default async function SubmitPage({ searchParams }: Props) {
  const sp = await searchParams;
  const trade = typeof sp.trade === "string" ? sp.trade : "";
  return <MonthlyExpenseForm initialTrade={trade} />;
}
