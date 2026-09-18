export type ProfileExport = {
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

export type BusinessExport = {
  name: string;
  category: string;
  createdAt: string;
};

export type LineItem = { label: string; amount: string };

export type SubmissionLineItem = { id: string; label: string; amount: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Prisma TEXT is a string; JSON/JSONB or double-encoded values may already be objects. */
export function parsePayloadJsonValue(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  const direct = asRecord(raw);
  if (direct) return direct;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    let value: unknown = JSON.parse(trimmed);
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        // keep the inner string
      }
    }
    return asRecord(value);
  } catch {
    return null;
  }
}

function lineAmount(item: Record<string, unknown>): string {
  const raw = item.amount ?? item.value ?? item.amountGbp ?? item.gbp;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (typeof raw === "string") return raw;
  return "";
}

function lineLabel(item: Record<string, unknown>, fallback: string): string {
  const raw = item.label ?? item.name ?? item.description ?? item.id;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return fallback;
}

export function normalizePayloadLines(items: unknown): SubmissionLineItem[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item, index) => {
    if (typeof item === "number" && Number.isFinite(item)) {
      return [{ id: `line-${index}`, label: `Line ${index + 1}`, amount: String(item) }];
    }
    const rec = asRecord(item);
    if (!rec) return [];
    const id = typeof rec.id === "string" && rec.id.trim() ? rec.id.trim() : `line-${index}`;
    return [{ id, label: lineLabel(rec, `Line ${index + 1}`), amount: lineAmount(rec) }];
  });
}

export type SubmissionExport = {
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

export const ACCOUNT_EXPORT_README = `SELF SUBMIT — YOUR COMPLETE RECORDS BACKUP
=========================================

Download this ZIP before deleting your account, as described in our Terms.

This archive is your personal tax records — NOT website code.

What's inside:
  profile.txt       — your name, address, and contact details
  businesses.txt    — businesses on your account
  submissions/      — every monthly return as a PDF (income, expenses, totals)
  receipts/         — receipt photos and PDFs you uploaded (if any)

Keep this ZIP somewhere safe (e.g. your computer or cloud storage) before you
delete your account. After deletion, SelfSubmit removes your data from our systems.

Open profile.txt and businesses.txt with Notepad. Open submission PDFs with any PDF reader.
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

export function submissionArchiveName(submission: SubmissionExport): string {
  const trade = submission.trade.replace(/[^\w.\-()+ ]/g, "_").replace(/\s+/g, "-");
  return `${submission.periodFrom}_to_${submission.periodTo}_${trade}.pdf`;
}

export function parseSubmissionPayload(payloadJson: string): { income: LineItem[]; expenses: LineItem[] } {
  const payload = parsePayloadJsonValue(payloadJson);
  if (!payload) return { income: [], expenses: [] };
  return {
    income: normalizePayloadLines(payload.income).map(({ label, amount }) => ({ label, amount })),
    expenses: normalizePayloadLines(payload.expenses).map(({ label, amount }) => ({ label, amount })),
  };
}
