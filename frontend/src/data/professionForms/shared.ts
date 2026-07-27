import type { MoneyLineItem, TradeFormTemplate } from "@/data/professionForms/types";

export type { MoneyLineItem, TradeFormTemplate };

export function line(id: string, label: string, hint?: string): MoneyLineItem {
  return hint ? { id, label, hint } : { id, label };
}

/** Shared admin / overhead lines — always at the end of expense lists. */
export function adminExpenses(overrides: {
  phoneId?: string;
  bankId?: string;
  includeMarketing?: boolean;
  includeInsurance?: boolean;
  insuranceLabel?: string;
} = {}): MoneyLineItem[] {
  const phoneId = overrides.phoneId ?? "phone_internet";
  const bankId = overrides.bankId ?? "bank_charges";
  const rows: MoneyLineItem[] = [];
  if (overrides.includeInsurance !== false) {
    rows.push(
      line(
        "professional_insurance",
        overrides.insuranceLabel ?? "Public liability / professional insurance",
        "0 if not applicable",
      ),
    );
  }
  if (overrides.includeMarketing !== false) {
    rows.push(line("marketing", "Advertising & finding clients", "0 if not applicable"));
  }
  rows.push(
    line(phoneId, "Phone & internet (business use %)"),
    line(bankId, "Bank & card payment charges"),
    line("accountant", "Accountant or bookkeeping software fees"),
    line("other", "Other allowable expenses"),
  );
  return rows;
}

export function defineForm(
  id: string,
  title: string,
  incomeLineItems: MoneyLineItem[],
  expenseLineItems: MoneyLineItem[],
): TradeFormTemplate {
  return { id, title, incomeLineItems, expenseLineItems };
}

export function professionFormId(profession: string): string {
  return profession
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
