export type MoneyLineItem = {
  id: string;
  label: string;
  hint?: string;
};

/** @deprecated use MoneyLineItem */
export type ExpenseLineItem = MoneyLineItem;

export type TradeFormTemplate = {
  id: string;
  title: string;
  incomeLineItems: MoneyLineItem[];
  expenseLineItems: MoneyLineItem[];
};

/** @deprecated use TradeFormTemplate */
export type ExpenseTemplate = TradeFormTemplate;
