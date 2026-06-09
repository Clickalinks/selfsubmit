export type CsvLineType = "income" | "expense";

export type ParsedCsvLine = {
  type: CsvLineType;
  label: string;
  amount: number;
  row: number;
};

export type CsvParseResult =
  | { ok: true; lines: ParsedCsvLine[]; skipped: number }
  | { ok: false; error: string };

const TYPE_ALIASES: Record<string, CsvLineType> = {
  income: "income",
  in: "income",
  revenue: "income",
  sales: "income",
  expense: "expense",
  expenses: "expense",
  cost: "expense",
  costs: "expense",
  out: "expense",
};

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/£/g, "").replace(/,/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normaliseHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Parse a simple CSV with headers: type, description, amount (aliases supported). */
export function parseIncomeExpenseCsv(text: string): CsvParseResult {
  const rawLines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length < 2) {
    return { ok: false, error: "CSV must include a header row and at least one data row." };
  }

  const headers = splitCsvLine(rawLines[0]).map(normaliseHeader);
  const typeIdx = headers.findIndex((h) => ["type", "category", "kind"].includes(h));
  const labelIdx = headers.findIndex((h) =>
    ["description", "label", "name", "item", "line"].includes(h),
  );
  const amountIdx = headers.findIndex((h) => ["amount", "value", "total", "gbp"].includes(h));

  if (typeIdx === -1 || labelIdx === -1 || amountIdx === -1) {
    return {
      ok: false,
      error: 'CSV headers must include type, description (or label), and amount — e.g. "type,description,amount".',
    };
  }

  const lines: ParsedCsvLine[] = [];
  let skipped = 0;

  for (let i = 1; i < rawLines.length; i += 1) {
    const cells = splitCsvLine(rawLines[i]);
    const typeRaw = cells[typeIdx]?.trim().toLowerCase() ?? "";
    const type = TYPE_ALIASES[typeRaw];
    const label = cells[labelIdx]?.trim() ?? "";
    const amount = parseAmount(cells[amountIdx] ?? "");

    if (!type || !label || amount === null) {
      skipped += 1;
      continue;
    }

    lines.push({ type, label, amount, row: i + 1 });
  }

  if (lines.length === 0) {
    return { ok: false, error: "No valid income or expense rows were found in the CSV." };
  }

  return { ok: true, lines, skipped };
}

export function buildCsvTemplate(): string {
  return [
    "type,description,amount",
    "income,Main business income,1500.00",
    "expense,Fuel,240.50",
    "expense,Phone and internet,45.00",
  ].join("\n");
}

export function downloadCsvTemplate(): void {
  const blob = new Blob([buildCsvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "selfsubmit-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
