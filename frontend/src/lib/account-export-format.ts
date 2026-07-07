type ProfileExport = {
  firstName: string;
  lastName: string;
  homeAddress: string;
  email: string;
  phone: string;
  businessAddress: string;
  businessName: string | null;
  businessSameAsHome: boolean;
  primaryProfession: string | null;
};

type BusinessExport = {
  name: string;
  category: string;
  createdAt: string;
};

type LineItem = { label: string; amount: string };

type SubmissionExport = {
  trade: string;
  periodFrom: string;
  periodTo: string;
  submittedAt: string;
  status: string;
  totalIncomeGbp: number;
  totalExpensesGbp: number;
  netProfitGbp: number;
  hmrcReference: string | null;
  hmrcStatus: string | null;
  income: LineItem[];
  expenses: LineItem[];
};

function formatUkDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(n: number): string {
  return `£${n.toFixed(2)}`;
}

export const ACCOUNT_EXPORT_README = `SELF SUBMIT — YOUR COMPLETE RECORDS BACKUP
=========================================

Download this ZIP before deleting your account, as described in our Terms.

This archive is your personal tax records — NOT website code.

What's inside:
  profile.txt       — your name, address, and contact details
  businesses.txt    — businesses on your account
  submissions/      — every monthly return (income, expenses, totals) as plain text
  receipts/         — receipt photos and PDFs you uploaded (if any)

Keep this ZIP somewhere safe (e.g. your computer or cloud storage) before you
delete your account. After deletion, SelfSubmit removes your data from our systems.

Open .txt files with Notepad or any text editor. For a printable copy of one
return, use Save as PDF on that submission in SelfSubmit before you leave.
`;

export function formatProfileText(profile: ProfileExport | null): string {
  if (!profile) {
    return "No profile saved on this account.\n";
  }

  const lines = [
    "YOUR PROFILE",
    "============",
    "",
    `Name: ${profile.firstName} ${profile.lastName}`,
    `Email: ${profile.email}`,
    `Phone: ${profile.phone}`,
    `Home address: ${profile.homeAddress}`,
    `Business name: ${profile.businessName ?? "—"}`,
    `Business address: ${profile.businessAddress}`,
    `Business same as home: ${profile.businessSameAsHome ? "Yes" : "No"}`,
    `Primary profession: ${profile.primaryProfession ?? "—"}`,
    "",
  ];
  return lines.join("\n");
}

export function formatBusinessesText(businesses: BusinessExport[]): string {
  if (businesses.length === 0) {
    return "No businesses on this account.\n";
  }

  const lines = ["YOUR BUSINESSES", "===============", ""];
  for (const business of businesses) {
    lines.push(`• ${business.name} (${business.category})`);
    lines.push(`  Added: ${formatUkDate(business.createdAt.slice(0, 10))}`);
    lines.push("");
  }
  return lines.join("\n");
}

function formatLineItems(title: string, items: LineItem[]): string[] {
  const lines = [title, "-".repeat(title.length)];
  const withAmount = items.filter((item) => item.amount && item.amount !== "0.00" && item.amount !== "0");
  if (withAmount.length === 0) {
    lines.push("  (none recorded)");
  } else {
    for (const item of withAmount) {
      lines.push(`  ${item.label}: ${item.amount.startsWith("£") ? item.amount : `£${item.amount}`}`);
    }
  }
  lines.push("");
  return lines;
}

export function formatSubmissionText(submission: SubmissionExport): string {
  const lines = [
    "MONTHLY RETURN",
    "==============",
    "",
    `Trade: ${submission.trade}`,
    `Period: ${formatUkDate(submission.periodFrom)} to ${formatUkDate(submission.periodTo)}`,
    `Submitted: ${new Date(submission.submittedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    `Status: ${submission.status}`,
  ];

  if (submission.hmrcReference) {
    lines.push(`HMRC reference: ${submission.hmrcReference} (${submission.hmrcStatus ?? "sent"})`);
  }

  lines.push(
    "",
    `Total income:  ${formatMoney(submission.totalIncomeGbp)}`,
    `Total expenses: ${formatMoney(submission.totalExpensesGbp)}`,
    `Net profit:    ${formatMoney(submission.netProfitGbp)}`,
    "",
  );

  lines.push(...formatLineItems("INCOME", submission.income));
  lines.push(...formatLineItems("EXPENSES", submission.expenses));

  return lines.join("\n");
}

export function submissionArchiveName(submission: SubmissionExport): string {
  const trade = submission.trade.replace(/[^\w.\-()+ ]/g, "_").replace(/\s+/g, "-");
  return `${submission.periodFrom}_to_${submission.periodTo}_${trade}.txt`;
}

export function parseSubmissionPayload(payloadJson: string): { income: LineItem[]; expenses: LineItem[] } {
  try {
    const payload = JSON.parse(payloadJson) as {
      income?: { label: string; amount: string }[];
      expenses?: { label: string; amount: string }[];
    };
    return {
      income: (payload.income ?? []).map((item) => ({ label: item.label, amount: item.amount })),
      expenses: (payload.expenses ?? []).map((item) => ({ label: item.label, amount: item.amount })),
    };
  } catch {
    return { income: [], expenses: [] };
  }
}
