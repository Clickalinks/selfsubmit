"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { HardHat, ImagePlus, ListPlus, Loader2, PoundSterling, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ALL_PROFESSIONS,
  HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE,
  type MileageAnnualBand,
  type MileageVehicleKind,
  type MoneyLineItem,
  type VehicleCostMethod,
  VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE_ID,
  computeSimplifiedMileageClaimGbp,
  getTemplateForProfession,
  getVisibleExpenseLineItems,
  getVisibleIncomeLineItems,
  isCisConstructionTrade,
  usesBusinessVehicleTemplate,
  vehicleSimplifiedMileageAllowed,
} from "@/data/expenseCategories";
import {
  DEFAULT_PROFESSION_ICON,
  PROFESSION_ICONS,
  getLineItemIcon,
  getTemplateIcon,
} from "@/data/tradeIcons";
import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { HmrcSimplifiedMileageNotice } from "@/components/forms/HmrcSimplifiedMileageNotice";
import { CsvImportPanel } from "@/components/forms/CsvImportPanel";
import { FormCalculator } from "@/components/forms/FormCalculator";
import { PeriodDateInputs, PeriodPresets } from "@/components/forms/PeriodPresets";
import { defaultAllowedMonthlyPeriod, isAllowedMonthlyRecordPeriod } from "@/lib/monthly-record-period";
import type { ParsedCsvLine } from "@/lib/csv-import";
import { uploadReceiptFile } from "@/lib/upload-receipt-client";
import { StickerIconFrame } from "@/components/ui/StickerIconFrame";
import { getProfessionStickerTone, getTemplateStickerTone } from "@/data/professionStickerTones";
import { stickerToneForLedgerLine } from "@/data/stickerCardTheme";
import type { StickerCardTone } from "@/data/stickerCardTheme";

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export type RowState = {
  amount: string;
  saved: boolean;
  error?: string;
};

function parseAmount(raw: string): { ok: true; value: number } | { ok: false } {
  const s = raw.trim().replace(/£/g, "").replace(/,/g, ".");
  if (s === "") return { ok: false };
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

function formatDisplayAmount(value: number): string {
  return value.toFixed(2);
}

function formatMoney(n: number): string {
  return `£${n.toFixed(2)}`;
}

/** `YYYY-MM-DD` → `DD/MM/YYYY` for display (UK). */
function isoDateToUkDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildInitialRows(items: MoneyLineItem[]): Record<string, RowState> {
  return Object.fromEntries(items.map((li) => [li.id, { amount: "", saved: false }]));
}

function sumSavedLines(rows: Record<string, RowState>, items: MoneyLineItem[]): number {
  return items.reduce((sum, li) => {
    const cell = rows[li.id];
    if (!cell?.saved) return sum;
    const p = parseAmount(cell.amount);
    return sum + (p.ok ? p.value : 0);
  }, 0);
}

/** Sum every line where the amount field parses (saved or not) — live preview. */
function sumParsedLineAmounts(rows: Record<string, RowState>, items: MoneyLineItem[]): number {
  return items.reduce((sum, li) => {
    const p = parseAmount(rows[li.id]?.amount ?? "");
    return sum + (p.ok ? p.value : 0);
  }, 0);
}

const OTHER_EXPENSE_LINE_ID = "other";

type ManualReceiptLine = { id: string; description: string; amount: string };

type UploadReceiptLine = {
  id: string;
  amount: string;
  note: string;
  file: File | null;
  previewUrl: string | null;
  receiptId: string | null;
  uploading: boolean;
  uploadError?: string;
};

type BusinessSummary = {
  id: string;
  name: string;
  category: string;
};

type MonthlyExpenseFormProps = {
  activeBusiness: BusinessSummary;
  businesses: BusinessSummary[];
  allowBusinessSwitch?: boolean;
};

export function MonthlyExpenseForm({
  activeBusiness,
  businesses,
  allowBusinessSwitch = false,
}: MonthlyExpenseFormProps) {
  const router = useRouter();
  const defaultTrade = activeBusiness.category.trim() || ALL_PROFESSIONS[0] || "Taxi Driver";
  const trade = defaultTrade;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const template = useMemo(() => getTemplateForProfession(trade), [trade]);

  const initialTemplate = useMemo(() => getTemplateForProfession(defaultTrade), [defaultTrade]);

  const [vehicleCostMethod, setVehicleCostMethod] = useState<VehicleCostMethod>("actual");

  const [incomeRows, setIncomeRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(getVisibleIncomeLineItems(initialTemplate, defaultTrade)),
  );
  const [expenseRows, setExpenseRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(getVisibleExpenseLineItems(initialTemplate, "actual", defaultTrade)),
  );

  const [showConfirm, setShowConfirm] = useState(false);

  const persistReceiptUpload = useCallback(async (rowId: string, file: File, note: string, amountStr: string) => {
    setUploadReceiptLines((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, uploading: true, uploadError: undefined } : r)),
    );
    const amountParsed = parseAmount(amountStr);
    try {
      const saved = await uploadReceiptFile({
        file,
        title: note.trim() || file.name,
        amountGbp: amountParsed.ok ? amountParsed.value : null,
      });
      setUploadReceiptLines((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, uploading: false, receiptId: saved.id, uploadError: undefined } : r,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadReceiptLines((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, uploading: false, uploadError: message } : r)),
      );
    }
  }, []);

  const [receiptCaptureTab, setReceiptCaptureTab] = useState<"upload" | "manual">("manual");
  const [manualReceiptLines, setManualReceiptLines] = useState<ManualReceiptLine[]>([]);
  const [uploadReceiptLines, setUploadReceiptLines] = useState<UploadReceiptLine[]>([]);
  const [receiptApplyMessage, setReceiptApplyMessage] = useState<string | undefined>(undefined);

  const [periodFrom, setPeriodFrom] = useState(() => defaultAllowedMonthlyPeriod().from);
  const [periodTo, setPeriodTo] = useState(() => defaultAllowedMonthlyPeriod().to);

  const [mileageMiles, setMileageMiles] = useState("");
  const [mileageVehicle, setMileageVehicle] = useState<MileageVehicleKind>("car_or_goods_vehicle");
  const [mileageBand, setMileageBand] = useState<MileageAnnualBand>("within_first_10000");
  const [mileageApplyError, setMileageApplyError] = useState<string | undefined>(undefined);

  const [cisDeductionThisPeriod, setCisDeductionThisPeriod] = useState("");

  const visibleIncomeItems = useMemo(
    () => getVisibleIncomeLineItems(template, trade),
    [template, trade],
  );

  const visibleExpenseItems = useMemo(
    () => getVisibleExpenseLineItems(template, vehicleCostMethod, trade),
    [template, vehicleCostMethod, trade],
  );

  const onVehicleCostMethodChange = (method: VehicleCostMethod) => {
    const tpl = getTemplateForProfession(trade);
    if (!usesBusinessVehicleTemplate(tpl.id)) return;
    if (method === "simplified" && !vehicleSimplifiedMileageAllowed(trade, tpl.id)) return;
    if (method === vehicleCostMethod) return;
    setVehicleCostMethod(method);
    setExpenseRows(buildInitialRows(getVisibleExpenseLineItems(tpl, method, trade)));
    setMileageApplyError(undefined);
    if (method === "simplified") {
      setMileageMiles("");
      setMileageVehicle("car_or_goods_vehicle");
      setMileageBand("within_first_10000");
    }
  };

  useEffect(() => {
    if (!usesBusinessVehicleTemplate(template.id)) return;
    if (vehicleSimplifiedMileageAllowed(trade, template.id)) return;
    if (vehicleCostMethod !== "simplified") return;
    setVehicleCostMethod("actual");
    setExpenseRows(buildInitialRows(getVisibleExpenseLineItems(template, "actual", trade)));
  }, [trade, template, vehicleCostMethod]);

  const patchIncome = (id: string, patch: Partial<RowState>) => {
    setIncomeRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const patchExpense = (id: string, patch: Partial<RowState>) => {
    setExpenseRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const setIncomeAmount = (id: string, amount: string) => {
    patchIncome(id, { amount, error: undefined });
  };

  const setExpenseAmount = (id: string, amount: string) => {
    patchExpense(id, { amount, error: undefined });
  };

  const applyCsvImport = useCallback(
    (lines: ParsedCsvLine[]) => {
      const normalise = (value: string) => value.trim().toLowerCase();

      const findLineId = (items: MoneyLineItem[], label: string) => {
        const needle = normalise(label);
        const exact = items.find((li) => normalise(li.label) === needle);
        if (exact) return exact.id;
        const partial = items.find(
          (li) => normalise(li.label).includes(needle) || needle.includes(normalise(li.label)),
        );
        return partial?.id ?? null;
      };

      setIncomeRows((prev) => {
        const next = { ...prev };
        for (const line of lines.filter((l) => l.type === "income")) {
          const id = findLineId(visibleIncomeItems, line.label);
          if (!id) continue;
          next[id] = { amount: formatDisplayAmount(line.amount), saved: false, error: undefined };
        }
        return next;
      });

      setExpenseRows((prev) => {
        const next = { ...prev };
        const otherId = visibleExpenseItems.find((li) => li.id === "other")?.id ?? null;
        for (const line of lines.filter((l) => l.type === "expense")) {
          const id = findLineId(visibleExpenseItems, line.label) ?? otherId;
          if (!id) continue;
          const existing = parseAmount(next[id]?.amount ?? "");
          const merged = existing.ok ? existing.value + line.amount : line.amount;
          next[id] = { amount: formatDisplayAmount(merged), saved: false, error: undefined };
        }
        return next;
      });
    },
    [visibleIncomeItems, visibleExpenseItems],
  );

  const saveIncome = (id: string) => {
    const cell = incomeRows[id];
    if (!cell) return;
    const parsed = parseAmount(cell.amount);
    if (!parsed.ok) {
      patchIncome(id, { saved: false, error: "Enter a valid amount (0 if none)." });
      return;
    }
    patchIncome(id, {
      amount: formatDisplayAmount(parsed.value),
      saved: true,
      error: undefined,
    });
  };

  const saveExpense = (id: string) => {
    const cell = expenseRows[id];
    if (!cell) return;
    const parsed = parseAmount(cell.amount);
    if (!parsed.ok) {
      patchExpense(id, { saved: false, error: "Enter a valid amount (0 if none)." });
      return;
    }
    patchExpense(id, {
      amount: formatDisplayAmount(parsed.value),
      saved: true,
      error: undefined,
    });
  };

  const editIncome = (id: string) => {
    patchIncome(id, { saved: false, error: undefined });
  };

  const editExpense = (id: string) => {
    patchExpense(id, { saved: false, error: undefined });
  };

  const mileagePreview = useMemo(() => {
    const raw = mileageMiles.trim().replace(/,/g, ".");
    if (raw === "") {
      return { ok: false as const, miles: null, pence: null, gbp: null };
    }
    const miles = Number(raw);
    if (!Number.isFinite(miles) || miles < 0) {
      return { ok: false as const, miles: null, pence: null, gbp: null };
    }
    const pence =
      mileageVehicle === "motorcycle"
        ? HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.motorcycle
        : mileageBand === "within_first_10000"
          ? HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanFirst10k
          : HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanOver10k;
    const gbp = computeSimplifiedMileageClaimGbp({
      businessMiles: miles,
      vehicle: mileageVehicle,
      annualMileageBand: mileageBand,
    });
    return { ok: true as const, miles, pence, gbp };
  }, [mileageMiles, mileageVehicle, mileageBand]);

  const applyMileageClaim = () => {
    const raw = mileageMiles.trim().replace(/,/g, ".");
    if (raw === "") {
      setMileageApplyError("Enter your business miles for this period (use 0 if you had none).");
      return;
    }
    const miles = Number(raw);
    if (!Number.isFinite(miles) || miles < 0) {
      setMileageApplyError("Enter a valid number of miles.");
      return;
    }
    setMileageApplyError(undefined);
    const gbp = computeSimplifiedMileageClaimGbp({
      businessMiles: miles,
      vehicle: mileageVehicle,
      annualMileageBand: mileageBand,
    });
    patchExpense(VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE_ID, {
      amount: formatDisplayAmount(gbp),
      saved: true,
      error: undefined,
    });
  };

  const showSimplifiedMileageStep =
    vehicleCostMethod === "simplified" &&
    usesBusinessVehicleTemplate(template.id) &&
    vehicleSimplifiedMileageAllowed(trade, template.id);

  const allIncomeSaved = visibleIncomeItems.every((li) => incomeRows[li.id]?.saved);
  const allExpensesSaved = visibleExpenseItems.every((li) => expenseRows[li.id]?.saved);
  const allSaved = allIncomeSaved && allExpensesSaved;

  const totals = useMemo(() => {
    if (!allSaved) return null;
    const income = sumSavedLines(incomeRows, visibleIncomeItems);
    const expenses = sumSavedLines(expenseRows, visibleExpenseItems);
    const net = income - expenses;
    return { income, expenses, net };
  }, [allSaved, incomeRows, expenseRows, visibleIncomeItems, visibleExpenseItems]);

  const liveTotals = useMemo(() => {
    const income = sumParsedLineAmounts(incomeRows, visibleIncomeItems);
    const expenses = sumParsedLineAmounts(expenseRows, visibleExpenseItems);
    return { income, expenses, net: income - expenses };
  }, [incomeRows, expenseRows, visibleIncomeItems, visibleExpenseItems]);

  const receiptTotal = useMemo(() => {
    let s = 0;
    for (const r of manualReceiptLines) {
      const p = parseAmount(r.amount);
      if (p.ok) s += p.value;
    }
    for (const r of uploadReceiptLines) {
      const p = parseAmount(r.amount);
      if (p.ok) s += p.value;
    }
    return Math.round(s * 100) / 100;
  }, [manualReceiptLines, uploadReceiptLines]);

  const hasOtherExpenseLine = visibleExpenseItems.some((li) => li.id === OTHER_EXPENSE_LINE_ID);

  const applyReceiptTotalToOther = () => {
    setReceiptApplyMessage(undefined);
    if (receiptTotal <= 0) {
      setReceiptApplyMessage("Enter at least one receipt amount greater than zero.");
      return;
    }
    if (!hasOtherExpenseLine) {
      setReceiptApplyMessage('This template has no "Other allowable expenses" line to merge into.');
      return;
    }
    const cell = expenseRows[OTHER_EXPENSE_LINE_ID];
    const baseParsed = parseAmount(cell?.amount ?? "");
    const base = baseParsed.ok ? baseParsed.value : 0;
    const merged = Math.round((base + receiptTotal) * 100) / 100;
    patchExpense(OTHER_EXPENSE_LINE_ID, {
      amount: formatDisplayAmount(merged),
      saved: true,
      error: undefined,
    });
    setManualReceiptLines([]);
    setUploadReceiptLines((prev) => {
      prev.forEach((l) => {
        if (l.previewUrl) URL.revokeObjectURL(l.previewUrl);
      });
      return [];
    });
    setReceiptApplyMessage(
      `Added ${formatMoney(receiptTotal)} to Other allowable expenses (now ${formatMoney(merged)}).`,
    );
  };

  const TradeIcon = PROFESSION_ICONS[trade] ?? DEFAULT_PROFESSION_ICON;
  const TemplateIcon = getTemplateIcon(template.id);
  const tradeStickerTone = getProfessionStickerTone(trade);
  const templateStickerTone = getTemplateStickerTone(template.id);
  const cisConstruction = isCisConstructionTrade(trade);

  const cisDeductionParsed = useMemo(
    () => parseAmount(cisDeductionThisPeriod),
    [cisDeductionThisPeriod],
  );
  const cisDeductionAmount = cisDeductionParsed.ok ? cisDeductionParsed.value : 0;

  const periodValid = isAllowedMonthlyRecordPeriod(periodFrom, periodTo);

  const periodSummaryUk =
    periodFrom && periodTo && /^\d{4}-\d{2}-\d{2}$/.test(periodFrom) && /^\d{4}-\d{2}-\d{2}$/.test(periodTo)
      ? `${isoDateToUkDisplay(periodFrom)} up to ${isoDateToUkDisplay(periodTo)}`
      : "";

  const openSubmitWarning = () => {
    if (!allSaved) return;
    if (!periodValid) return;
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    if (!totals) return;
    setSubmitting(true);
    setSubmitError(null);

    const incomePayload = visibleIncomeItems.map((li) => ({
      id: li.id,
      label: li.label,
      amount: incomeRows[li.id]?.amount ?? "",
    }));
    const expensePayload = visibleExpenseItems.map((li) => ({
      id: li.id,
      label: li.label,
      amount: expenseRows[li.id]?.amount ?? "",
    }));
    const receiptIds = uploadReceiptLines
      .map((row) => row.receiptId)
      .filter((id): id is string => Boolean(id));

    const pendingUploads = uploadReceiptLines.filter((row) => row.file && !row.receiptId);
    for (const row of pendingUploads) {
      if (!row.file) continue;
      try {
        const amountParsed = parseAmount(row.amount);
        const saved = await uploadReceiptFile({
          file: row.file,
          title: row.note.trim() || row.file.name,
          amountGbp: amountParsed.ok ? amountParsed.value : null,
        });
        receiptIds.push(saved.id);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Could not save a receipt photo.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          trade,
          periodFrom,
          periodTo,
          templateId: template.id,
          vehicleCostMethod: usesBusinessVehicleTemplate(template.id) ? vehicleCostMethod : null,
          simplifiedMileageInputs:
            showSimplifiedMileageStep && mileagePreview.ok
              ? {
                  milesThisPeriod: mileagePreview.miles,
                  vehicle: mileageVehicle,
                  annualBand: mileageVehicle === "motorcycle" ? null : mileageBand,
                  pencePerMileApplied: mileagePreview.pence,
                }
              : null,
          income: incomePayload,
          expenses: expensePayload,
          totals: {
            incomeGbp: totals.income,
            expensesGbp: totals.expenses,
            netProfitGbp: totals.net,
          },
          receiptIds,
          receiptCapture: {
            tab: receiptCaptureTab,
            manualLines: manualReceiptLines,
            uploadMeta: uploadReceiptLines.map((row) => ({
              id: row.id,
              amount: row.amount,
              note: row.note,
              fileName: row.file?.name ?? null,
              receiptId: row.receiptId,
            })),
          },
          cis:
            cisConstruction && cisDeductionThisPeriod.trim() !== ""
              ? {
                  deductionsThisPeriodGbp: cisDeductionParsed.ok ? cisDeductionParsed.value : null,
                  rawInput: cisDeductionThisPeriod,
                }
              : cisConstruction
                ? { deductionsThisPeriodGbp: null, rawInput: "" }
                : null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        submission?: { id: string; hmrcReference?: string | null };
      };
      if (!res.ok) {
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/submissions?submitted=${data.submission?.id ?? "1"}`);
      router.refresh();
    } catch {
      setSubmitError("Network error — check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <span className="hidden truncate text-sm font-medium text-brand-muted min-[520px]:inline">
              Monthly income &amp; expenses
            </span>
            <HeaderAuth />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-content px-5 py-8 min-[900px]:px-10 min-[900px]:py-10">
        {/* Desktop: always-open fee calculator in the right column (hidden on phones). */}
        <aside className="pointer-events-none absolute right-5 top-[22rem] z-20 hidden w-[18.5rem] min-[900px]:block min-[900px]:right-10">
          <div className="pointer-events-auto sticky top-6">
            <FormCalculator placement="dock" />
          </div>
        </aside>

        {/* Mobile / tablet: floating calculator only (desktop dock is hidden below 900px). */}
        <div className="min-[900px]:hidden">
          <FormCalculator placement="fab" />
        </div>

        <h1 className="text-2xl font-bold text-brand-black min-[900px]:text-3xl">Your monthly return</h1>
        <p className="mt-2 max-w-2xl text-brand-muted">
          <strong className="text-brand-black">1.</strong> If you use a vehicle for this trade, choose{" "}
          <strong className="text-brand-black">full (actual)</strong> or{" "}
          <strong className="text-brand-black">simplified (mileage)</strong> vehicle costs below.{" "}
          <strong className="text-brand-black">2.</strong> Add and <strong className="text-brand-black">Save</strong>{" "}
          every <strong className="text-brand-black">income</strong> line (money in).{" "}
          <strong className="text-brand-black">3.</strong> If you use <strong className="text-brand-black">simplified</strong>{" "}
          vehicle mileage, save all income first, then enter miles and <strong className="text-brand-black">apply</strong>{" "}
          the HMRC rate to your vehicle expense line. <strong className="text-brand-black">4.</strong> Then complete each{" "}
          <strong className="text-brand-black">expense</strong> line. Saved rows turn grey; use{" "}
          <strong className="text-brand-black">Edit</strong> to fix mistakes. When every line is saved, your{" "}
          <strong className="text-brand-black">totals</strong> appear, then you can submit.
        </p>

        <section
          className="mt-8 max-w-2xl rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4 min-[900px]:px-6 min-[900px]:py-5"
          aria-labelledby="return-period-heading"
        >
          <h2 id="return-period-heading" className="text-sm font-bold text-brand-black">
            Return period
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Use a quick preset or pick exact dates. Catch up with <strong>last quarter</strong>, or record{" "}
            <strong>this month</strong> / <strong>last month</strong>. Future dates are not allowed.
          </p>
          <PeriodPresets
            periodFrom={periodFrom}
            periodTo={periodTo}
            onApply={(from, to) => {
              setPeriodFrom(from);
              setPeriodTo(to);
            }}
          />
          <PeriodDateInputs
            periodFrom={periodFrom}
            periodTo={periodTo}
            onPeriodFromChange={setPeriodFrom}
            onPeriodToChange={setPeriodTo}
          />
          {periodSummaryUk ? (
            <p className="mt-3 text-sm text-brand-black">
              This record covers{" "}
              <strong className="tabular-nums">{isoDateToUkDisplay(periodFrom)}</strong> up to{" "}
              <strong className="tabular-nums">{isoDateToUkDisplay(periodTo)}</strong>.
            </p>
          ) : (
            <p className="mt-3 text-sm text-amber-800">Choose both dates so we know which period these figures belong to.</p>
          )}
          {periodFrom && periodTo && !periodValid ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              Choose a period from the start of last quarter up to the end of this month (no future dates).
            </p>
          ) : null}
        </section>

        <CsvImportPanel onImport={applyCsvImport} className="mt-8 max-w-2xl" />

        <div className="mt-8 max-w-2xl">
          {allowBusinessSwitch ? (
            <div className="mb-6 rounded-2xl border border-brand-green/20 bg-brand-mint/30 px-4 py-4">
              <label htmlFor="active-business-submit" className="block text-sm font-semibold text-brand-black">
                Which business is this return for?
              </label>
              <p className="mt-1 text-xs text-brand-muted">
                Each business has its own profession and expense template. Switch here to work on another business.
              </p>
              <select
                id="active-business-submit"
                value={activeBusiness.id}
                onChange={(e) => router.push(`/submit?businessId=${encodeURIComponent(e.target.value)}`)}
                className="mt-3 min-h-[52px] w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.category}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <label htmlFor="profession" className="block text-sm font-semibold text-brand-black">
            Business / profession
          </label>
          <div className="mt-2 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-stretch">
            <StickerIconFrame tone={tradeStickerTone} size="md" className="min-[520px]:self-stretch">
              <TradeIcon strokeWidth={2.35} aria-hidden />
            </StickerIconFrame>
            <div className="flex min-h-[52px] w-full flex-1 flex-col justify-center rounded-xl border border-black/15 bg-neutral-100 px-4 py-3 text-sm font-medium text-brand-black">
              <span className="font-semibold">{activeBusiness.name}</span>
              <span className="text-brand-muted">{trade}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
            <StickerIconFrame tone={templateStickerTone} size="sm" className="inline-flex">
              <TemplateIcon strokeWidth={2.35} aria-hidden />
            </StickerIconFrame>
            <span>
              Template: <span className="font-medium text-brand-black">{template.title}</span>
            </span>
            <span className="rounded-full bg-brand-mint px-2 py-0.5 font-semibold text-brand-forest">
              Locked to your plan
            </span>
          </div>
        </div>

        {usesBusinessVehicleTemplate(template.id) ? (
          <fieldset className="mt-8 max-w-2xl rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4 min-[900px]:px-6 min-[900px]:py-5">
            <legend className="px-1 text-sm font-bold text-brand-black">Vehicle running costs (this period)</legend>
            <p className="mt-1 text-xs text-brand-muted">
              Choose one method for the vehicle you use for this trade. You must not mix simplified mileage with
              separate fuel, insurance, repairs, MOT, finance or breakdown for the <strong>same vehicle</strong> in the
              same period.
            </p>
            {!vehicleSimplifiedMileageAllowed(trade, template.id) ? (
              <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-brand-black">
                <strong>Driving instruction:</strong> HMRC does not allow the standard car simplified mileage rates for
                dual-control cars used only for lessons. Use <strong>full (actual) costs</strong> for your instruction
                vehicle and complete each vehicle expense line below.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3 min-[600px]:flex-row min-[600px]:flex-wrap">
                <label
                  className={cx(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition",
                    vehicleCostMethod === "actual"
                      ? "border-brand-green bg-white shadow-sm"
                      : "border-black/10 bg-white/60 hover:border-black/20",
                  )}
                >
                  <input
                    type="radio"
                    name="vehicle-cost-method"
                    className="mt-1"
                    checked={vehicleCostMethod === "actual"}
                    onChange={() => onVehicleCostMethodChange("actual")}
                  />
                  <span>
                    <span className="font-semibold text-brand-black">Full method (actual costs)</span>
                    <span className="mt-0.5 block text-brand-muted">
                      List fuel, insurance, repairs, MOT, lease/finance, etc. separately — each line in Expenses below.
                    </span>
                  </span>
                </label>
                <label
                  className={cx(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition",
                    vehicleCostMethod === "simplified"
                      ? "border-brand-green bg-white shadow-sm"
                      : "border-black/10 bg-white/60 hover:border-black/20",
                  )}
                >
                  <input
                    type="radio"
                    name="vehicle-cost-method"
                    className="mt-1"
                    checked={vehicleCostMethod === "simplified"}
                    onChange={() => onVehicleCostMethodChange("simplified")}
                  />
                  <span>
                    <span className="font-semibold text-brand-black">Simplified method (HMRC mileage)</span>
                    <span className="mt-0.5 block text-brand-muted">
                      One mileage total for running costs; fuel, insurance, repairs, MOT, finance &amp; breakdown lines
                      for that vehicle are hidden so you do not double-claim.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </fieldset>
        ) : null}

        <HmrcSimplifiedMileageNotice
          trade={trade}
          templateId={template.id}
          vehicleCostMethod={usesBusinessVehicleTemplate(template.id) ? vehicleCostMethod : null}
        />

        <section className="mt-10 space-y-4" aria-labelledby="income-heading">
          <h2 id="income-heading" className="text-lg font-bold text-brand-black">
            Income{" "}
            <span className="text-sm font-normal text-brand-muted">
              (money you received — turnover, fees, tips; not business costs)
            </span>
          </h2>
          {visibleIncomeItems.map((item, idx) => (
            <LedgerRow
              key={item.id}
              item={item}
              Icon={getLineItemIcon(item.id)}
              stickerTone={stickerToneForLedgerLine("income", item.id, idx)}
              state={incomeRows[item.id] ?? { amount: "", saved: false }}
              onAmountChange={setIncomeAmount}
              onSave={saveIncome}
              onEdit={editIncome}
            />
          ))}
        </section>

        {cisConstruction ? (
          <section
            className="mt-10 max-w-2xl rounded-2xl border border-amber-200/70 bg-amber-50/50 px-4 py-5 min-[900px]:px-6 min-[900px]:py-6"
            aria-labelledby="cis-heading"
          >
            <div className="flex flex-wrap items-start gap-3">
              <StickerIconFrame tone="cream" size="sm" className="shrink-0">
                <HardHat strokeWidth={2.35} aria-hidden />
              </StickerIconFrame>
              <div className="min-w-0 flex-1">
                <h2 id="cis-heading" className="text-lg font-bold text-brand-black">
                  Construction Industry Scheme (CIS)
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  For payments from contractors who operate CIS, they may deduct tax before paying you. Enter your
                  income lines above as <strong className="text-brand-black">gross</strong> (before CIS). The field
                  below is only the tax <strong className="text-brand-black">withheld</strong> this period — it is not
                  an allowable expense and does not reduce your taxable profit; on Self Assessment it usually counts
                  toward your Income Tax and National Insurance bill.
                </p>
                <p className="mt-2 text-xs text-brand-muted">
                  <a
                    href="https://www.gov.uk/what-is-the-construction-industry-scheme"
                    className="font-medium text-brand-green underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CIS for subcontractors (GOV.UK)
                  </a>
                </p>
                <div className="mt-4">
                  <label htmlFor="cis-deductions-period" className="block text-sm font-semibold text-brand-black">
                    Total CIS tax deducted by contractors this period (£)
                  </label>
                  <input
                    id="cis-deductions-period"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={cisDeductionThisPeriod}
                    onChange={(e) => setCisDeductionThisPeriod(e.target.value)}
                    placeholder="0 if none or not applicable"
                    className="mt-2 w-full max-w-xs rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium tabular-nums text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
                  />
                  {cisDeductionThisPeriod.trim() !== "" && !cisDeductionParsed.ok ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      Enter a valid amount (0 or more), or leave blank.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {showSimplifiedMileageStep ? (
          <section className="mt-12 max-w-2xl" aria-labelledby="mileage-step-heading">
            <h2 id="mileage-step-heading" className="text-lg font-bold text-brand-black">
              Business mileage (simplified method)
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              After your income is complete, record <strong className="text-brand-black">business miles only</strong>{" "}
              for this return period. We multiply by HMRC&apos;s simplified pence-per-mile and copy the result to your
              vehicle expense line (first item under Expenses).
            </p>

            {!allIncomeSaved ? (
              <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-neutral-50 px-4 py-5 text-sm text-brand-muted">
                <strong className="text-brand-black">Next step:</strong> save every income line above. Then you can
                enter mileage and apply the simplified amount.
              </div>
            ) : (
              <div className="mt-4 space-y-4 rounded-2xl border border-brand-green/25 bg-brand-mint/40 px-4 py-5 min-[900px]:px-6 min-[900px]:py-6">
                <div>
                  <label htmlFor="business-miles" className="block text-sm font-semibold text-brand-black">
                    Business miles for this period
                  </label>
                  <input
                    id="business-miles"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={mileageMiles}
                    onChange={(e) => {
                      setMileageMiles(e.target.value);
                      setMileageApplyError(undefined);
                    }}
                    placeholder="e.g. 820"
                    className="mt-2 w-full max-w-xs rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
                  />
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold text-brand-black">Vehicle type</legend>
                  <div className="flex flex-col gap-2 min-[500px]:flex-row min-[500px]:flex-wrap">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="mileage-vehicle"
                        checked={mileageVehicle === "car_or_goods_vehicle"}
                        onChange={() => setMileageVehicle("car_or_goods_vehicle")}
                      />
                      <span>Car or goods vehicle (e.g. car, van)</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="mileage-vehicle"
                        checked={mileageVehicle === "motorcycle"}
                        onChange={() => setMileageVehicle("motorcycle")}
                      />
                      <span>Motorcycle ({HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.motorcycle}p per mile)</span>
                    </label>
                  </div>
                </fieldset>

                {mileageVehicle === "car_or_goods_vehicle" ? (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold text-brand-black">Where are you in the tax year?</legend>
                    <p className="text-xs text-brand-muted">
                      HMRC uses <strong className="text-brand-black">10,000 business miles per tax year</strong> for the
                      45p / 25p split on cars and goods vehicles. Pick the band that applies to the miles you are
                      claiming <em>including</em> this period.
                    </p>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name="mileage-band"
                        className="mt-1"
                        checked={mileageBand === "within_first_10000"}
                        onChange={() => setMileageBand("within_first_10000")}
                      />
                      <span>
                        <strong className="text-brand-black">Within first 10,000 miles</strong> of the tax year (
                        {HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanFirst10k}p per mile)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name="mileage-band"
                        className="mt-1"
                        checked={mileageBand === "above_10000"}
                        onChange={() => setMileageBand("above_10000")}
                      />
                      <span>
                        <strong className="text-brand-black">Over 10,000 miles</strong> already this tax year (
                        {HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE.carVanOver10k}p per mile for these miles)
                      </span>
                    </label>
                  </fieldset>
                ) : null}

                <div className="rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-sm">
                  {mileagePreview.ok && mileagePreview.miles !== null && mileagePreview.pence !== null ? (
                    <>
                      <p className="font-semibold text-brand-black">
                        Estimated simplified vehicle cost:{" "}
                        <span className="text-brand-green">{formatMoney(mileagePreview.gbp ?? 0)}</span>
                      </p>
                      <p className="mt-1 text-xs text-brand-muted">
                        {mileagePreview.miles.toLocaleString("en-GB")} mi × {mileagePreview.pence}p ={" "}
                        {formatMoney(mileagePreview.gbp ?? 0)} (rates per GOV.UK simplified expenses)
                      </p>
                    </>
                  ) : mileageMiles.trim() !== "" ? (
                    <p className="text-sm text-red-600">Enter a valid mileage number (0 or more).</p>
                  ) : (
                    <p className="text-brand-muted">Enter miles to see the calculated amount.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-[500px]:flex-row min-[500px]:items-center">
                  <button
                    type="button"
                    onClick={applyMileageClaim}
                    className="rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-6 py-2.5 text-sm font-bold text-white shadow-btn-green hover:brightness-105"
                  >
                    Apply to vehicle expense line
                  </button>
                  <span className="text-xs text-brand-muted">
                    Fills &amp; saves the first expense row (&quot;Vehicle running costs (HMRC simplified…)&quot;). You
                    can Edit that row later if needed.
                  </span>
                </div>
                {mileageApplyError ? <p className="text-sm text-red-600">{mileageApplyError}</p> : null}
              </div>
            )}
          </section>
        ) : null}

        <section className="mt-12 space-y-4" aria-labelledby="expense-heading">
          <h2 id="expense-heading" className="text-lg font-bold text-brand-black">
            Expenses{" "}
            <span className="text-sm font-normal text-brand-muted">
              (money you spent on the business — costs only, not sales)
            </span>
          </h2>
          {visibleExpenseItems.map((item, idx) => (
            <LedgerRow
              key={item.id}
              item={item}
              Icon={getLineItemIcon(item.id)}
              stickerTone={stickerToneForLedgerLine("expense", item.id, idx)}
              state={expenseRows[item.id] ?? { amount: "", saved: false }}
              onAmountChange={setExpenseAmount}
              onSave={saveExpense}
              onEdit={editExpense}
            />
          ))}
        </section>

        <section
          className="mt-12 max-w-2xl rounded-2xl border border-black/10 bg-white px-4 py-5 shadow-card min-[900px]:px-6 min-[900px]:py-6"
          aria-labelledby="receipts-heading"
        >
          <div className="flex flex-wrap items-start gap-3">
            <StickerIconFrame tone="mint" size="sm" className="shrink-0">
              <PoundSterling strokeWidth={2.35} aria-hidden />
            </StickerIconFrame>
            <div>
              <h2 id="receipts-heading" className="text-lg font-bold text-brand-black">
                Receipts &amp; petty cash
              </h2>
              <p className="text-sm text-brand-muted">
                Upload a photo — it is saved to your <strong className="text-brand-black">Receipts</strong> page as you
                add it. Type the total from the receipt, or add manual lines. You can merge totals into{" "}
                <strong className="text-brand-black">Other allowable expenses</strong>.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReceiptCaptureTab("manual")}
              className={cx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                receiptCaptureTab === "manual"
                  ? "bg-brand-green text-white shadow-btn-green"
                  : "border border-black/15 bg-neutral-50 text-brand-muted hover:bg-neutral-100",
              )}
            >
              <ListPlus className="h-4 w-4" aria-hidden />
              Manual lines
            </button>
            <button
              type="button"
              onClick={() => setReceiptCaptureTab("upload")}
              className={cx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                receiptCaptureTab === "upload"
                  ? "bg-brand-green text-white shadow-btn-green"
                  : "border border-black/15 bg-neutral-50 text-brand-muted hover:bg-neutral-100",
              )}
            >
              <Upload className="h-4 w-4" aria-hidden />
              Receipt photos
            </button>
          </div>

          {receiptCaptureTab === "manual" ? (
            <div className="mt-5 space-y-3">
              {manualReceiptLines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-black/15 bg-neutral-50/80 px-4 py-4 text-sm text-brand-muted">
                  Add one row per receipt: what you bought and how much. Totals update as you type.
                </p>
              ) : (
                manualReceiptLines.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-2 rounded-xl border border-black/10 bg-neutral-50/80 p-3 min-[600px]:flex-row min-[600px]:items-end"
                  >
                    <div className="min-w-0 flex-1">
                      <label className="text-xs font-semibold text-brand-black">Description</label>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          setManualReceiptLines((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)),
                          )
                        }
                        placeholder="e.g. Screwfix — drill bits"
                        className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-brand-black focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-black">Amount (£)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.amount}
                        onChange={(e) =>
                          setManualReceiptLines((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, amount: e.target.value } : r)),
                          )
                        }
                        placeholder="0.00"
                        className="mt-1 w-full min-w-[7rem] rounded-lg border border-black/15 bg-white px-3 py-2 text-sm tabular-nums text-brand-black focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 min-[600px]:w-28"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setManualReceiptLines((prev) => prev.filter((r) => r.id !== row.id))
                      }
                      className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-brand-black hover:bg-neutral-50 min-[600px]:shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={() =>
                  setManualReceiptLines((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), description: "", amount: "" },
                  ])
                }
                className="rounded-full border border-brand-green/40 bg-brand-mint px-4 py-2 text-sm font-semibold text-brand-green hover:bg-emerald-100/80"
              >
                + Add manual line
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {uploadReceiptLines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-black/15 bg-neutral-50/80 px-4 py-4 text-sm text-brand-muted">
                  Attach a clear photo, then enter the total you read from the receipt. We do not run OCR in the browser;
                  the amount you type is what gets summed.
                </p>
              ) : (
                uploadReceiptLines.map((row) => (
                  <div key={row.id} className="rounded-xl border border-black/10 bg-neutral-50/80 p-3">
                    <div className="flex flex-col gap-3 min-[640px]:flex-row">
                      <label className="flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/15 bg-white px-3 py-4 text-center text-sm text-brand-muted transition hover:border-brand-green/40 hover:bg-brand-mint/30 min-[640px]:w-44">
                        <ImagePlus className="mb-1 h-8 w-8 opacity-60" aria-hidden />
                        <span className="font-medium text-brand-black">Choose photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setUploadReceiptLines((prev) =>
                              prev.map((r) => {
                                if (r.id !== row.id) return r;
                                if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
                                if (!file) {
                                  return {
                                    ...r,
                                    file: null,
                                    previewUrl: null,
                                    receiptId: null,
                                    uploading: false,
                                    uploadError: undefined,
                                  };
                                }
                                return {
                                  ...r,
                                  file,
                                  previewUrl: URL.createObjectURL(file),
                                  receiptId: null,
                                  uploading: false,
                                  uploadError: undefined,
                                };
                              }),
                            );
                            e.target.value = "";
                            if (file) void persistReceiptUpload(row.id, file, row.note, row.amount);
                          }}
                        />
                      </label>
                      {row.previewUrl ? (
                        <Image
                          src={row.previewUrl}
                          alt={row.note || "Receipt preview"}
                          width={384}
                          height={384}
                          unoptimized
                          className="h-40 w-full rounded-lg border border-black/10 object-contain bg-neutral-900/5 min-[640px]:h-auto min-[640px]:max-h-48 min-[640px]:w-48 min-[640px]:shrink-0"
                        />
                      ) : null}
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div>
                          <label className="text-xs font-semibold text-brand-black">Note (optional)</label>
                          <input
                            type="text"
                            value={row.note}
                            onChange={(e) =>
                              setUploadReceiptLines((prev) =>
                                prev.map((r) => (r.id === row.id ? { ...r, note: e.target.value } : r)),
                              )
                            }
                            placeholder="e.g. Tesco fuel — 12 Mar"
                            className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-brand-black focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-brand-black">Amount from receipt (£)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.amount}
                            onChange={(e) =>
                              setUploadReceiptLines((prev) =>
                                prev.map((r) => (r.id === row.id ? { ...r, amount: e.target.value } : r)),
                              )
                            }
                            placeholder="0.00"
                            className="mt-1 w-full max-w-xs rounded-lg border border-black/15 bg-white px-3 py-2 text-sm tabular-nums text-brand-black focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                          />
                        </div>
                        {row.uploading ? (
                          <p className="flex items-center gap-2 text-xs font-medium text-brand-muted">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            Saving to your receipts…
                          </p>
                        ) : row.receiptId ? (
                          <p className="text-xs font-semibold text-brand-green">Saved to Receipts</p>
                        ) : null}
                        {row.uploadError ? (
                          <p className="text-xs text-red-600">{row.uploadError}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            setUploadReceiptLines((prev) => {
                              const hit = prev.find((r) => r.id === row.id);
                              if (hit?.previewUrl) URL.revokeObjectURL(hit.previewUrl);
                              return prev.filter((r) => r.id !== row.id);
                            })
                          }
                          className="self-start rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-brand-black hover:bg-neutral-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={() =>
                  setUploadReceiptLines((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      amount: "",
                      note: "",
                      file: null,
                      previewUrl: null,
                      receiptId: null,
                      uploading: false,
                    },
                  ])
                }
                className="rounded-full border border-brand-green/40 bg-brand-mint px-4 py-2 text-sm font-semibold text-brand-green hover:bg-emerald-100/80"
              >
                + Add receipt photo
              </button>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-brand-green/20 bg-brand-mint/50 px-4 py-3">
            <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
              <p className="text-sm font-semibold text-brand-black">
                Receipt total (live):{" "}
                <span className="tabular-nums text-brand-green">{formatMoney(receiptTotal)}</span>
              </p>
              <button
                type="button"
                onClick={applyReceiptTotalToOther}
                disabled={!hasOtherExpenseLine || receiptTotal <= 0}
                className={cx(
                  "rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-btn-green transition",
                  hasOtherExpenseLine && receiptTotal > 0
                    ? "bg-gradient-to-b from-brand-green-bright to-brand-green-dark hover:brightness-105"
                    : "cursor-not-allowed bg-neutral-300 text-neutral-500 shadow-none",
                )}
              >
                Add total to &quot;Other&quot; expenses
              </button>
            </div>
            {!hasOtherExpenseLine ? (
              <p className="mt-2 text-xs text-amber-800">This trade&apos;s expense list has no &quot;Other&quot; line.</p>
            ) : null}
            {receiptApplyMessage ? (
              <p className="mt-2 text-sm text-brand-black" role="status">
                {receiptApplyMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="totals-heading">
          <h2 id="totals-heading" className="text-lg font-bold text-brand-black">
            Totals
          </h2>
          {!allSaved ? (
            <p className="mt-2 text-sm text-brand-muted">
              Running totals update <strong className="text-brand-black">automatically</strong> from every amount you
              type (you still need to save each line before submit).
            </p>
          ) : null}
          <div className="mt-4 rounded-2xl border border-black/10 bg-white px-5 py-5 shadow-card min-[900px]:px-8 min-[900px]:py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {!allSaved ? "Live preview" : "Confirmed (all lines saved)"}
            </p>
            <dl className="mt-3 grid gap-4 min-[900px]:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-brand-muted">Total income</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-black">
                  {formatMoney(allSaved ? (totals?.income ?? liveTotals.income) : liveTotals.income)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-brand-muted">Total expenses</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-black">
                  {formatMoney(allSaved ? (totals?.expenses ?? liveTotals.expenses) : liveTotals.expenses)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-brand-muted">Net (profit)</dt>
                <dd
                  className={cx(
                    "mt-1 text-2xl font-bold tabular-nums",
                    (allSaved ? (totals?.net ?? liveTotals.net) : liveTotals.net) >= 0
                      ? "text-brand-green"
                      : "text-red-600",
                  )}
                >
                  {formatMoney(allSaved ? (totals?.net ?? liveTotals.net) : liveTotals.net)}
                </dd>
              </div>
            </dl>
            {cisConstruction ? (
              <div className="mt-5 border-t border-black/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">CIS (same period)</p>
                {cisDeductionParsed.ok && cisDeductionAmount > 0 ? (
                  <dl className="mt-2 space-y-2 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-brand-muted">CIS tax withheld by contractors</dt>
                      <dd className="font-semibold tabular-nums text-amber-900">{formatMoney(cisDeductionAmount)}</dd>
                    </div>
                    <p className="text-xs leading-relaxed text-brand-muted">
                      Not included in expenses above. Indicative cash after CIS (gross income − CIS − expenses):{" "}
                      <span className="font-semibold text-brand-black">
                        {formatMoney(
                          Math.round(
                            ((allSaved ? (totals?.income ?? liveTotals.income) : liveTotals.income) -
                              cisDeductionAmount -
                              (allSaved ? (totals?.expenses ?? liveTotals.expenses) : liveTotals.expenses)) *
                              100,
                          ) / 100,
                        )}
                      </span>
                      . Your Self Assessment will credit CIS against tax and NIC due.
                    </p>
                  </dl>
                ) : (
                  <p className="mt-2 text-xs text-brand-muted">
                    If contractors deducted CIS this month, enter the total in the CIS section under Income.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          {!allSaved ? (
            <p className="mt-4 rounded-2xl border border-dashed border-black/15 bg-neutral-50 px-4 py-5 text-center text-sm text-brand-muted">
              {showSimplifiedMileageStep ? (
                <>
                  Save <strong className="text-brand-black">every income line</strong>, apply{" "}
                  <strong className="text-brand-black">business mileage</strong> if you use simplified vehicle costs, then
                  save <strong className="text-brand-black">every expense line</strong> to enable submit.
                </>
              ) : (
                <>
                  Save <strong className="text-brand-black">every income line</strong> and{" "}
                  <strong className="text-brand-black">every expense line</strong> to enable submit.
                </>
              )}
            </p>
          ) : null}
        </section>

        <div className="mt-10 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-brand-black">
          <strong>Before you save:</strong> double-check income and expenses. This stores your monthly record in
          SelfSubmit for your MTD records. Connect HMRC from your dashboard to prepare quarterly updates.
        </div>

        {submitError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center">
          <button
            type="button"
            onClick={openSubmitWarning}
            disabled={!allSaved || !periodValid || submitting}
            className={cx(
              "rounded-full px-8 py-3.5 text-[15px] font-bold text-white shadow-btn-green transition",
              allSaved && periodValid && !submitting
                ? "bg-gradient-to-b from-brand-green-bright to-brand-green-dark hover:brightness-105"
                : "cursor-not-allowed bg-neutral-300 text-neutral-500 shadow-none",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save monthly record"
            )}
          </button>
          {!allSaved ? (
            <span className="text-sm text-brand-muted">Save all income and expense lines to enable submit.</span>
          ) : !periodValid ? (
            <span className="text-sm text-brand-muted">
              Set a valid return period (from and up to dates) to enable submit.
            </span>
          ) : null}
        </div>
      </div>

      {showConfirm ? (
        <ConfirmDialog
          periodSummaryUk={periodSummaryUk}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmSubmit}
        />
      ) : null}
    </div>
  );
}

function LedgerRow({
  item,
  Icon,
  stickerTone,
  state,
  onAmountChange,
  onSave,
  onEdit,
}: {
  item: MoneyLineItem;
  Icon: LucideIcon;
  stickerTone: StickerCardTone;
  state: RowState;
  onAmountChange: (id: string, v: string) => void;
  onSave: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const saved = state.saved;
  return (
    <div
      className={cx(
        "rounded-2xl border px-4 py-4 transition-colors min-[900px]:px-5 min-[900px]:py-4",
        saved ? "border-neutral-200 bg-neutral-50" : "border-black/10 bg-white shadow-card",
      )}
    >
      <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex gap-3">
            <StickerIconFrame tone={stickerTone} size="sm" muted={saved} className="mt-0.5">
              <Icon strokeWidth={2.35} aria-hidden />
            </StickerIconFrame>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-brand-black">{item.label}</div>
              {item.hint ? <p className="mt-1 text-sm text-brand-muted">{item.hint}</p> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 min-[900px]:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx("text-sm font-medium", saved ? "text-brand-muted" : "text-brand-black")}>£</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={saved}
              value={state.amount}
              onChange={(e) => onAmountChange(item.id, e.target.value)}
              aria-label={`Amount for ${item.label}`}
              className={cx(
                "w-36 rounded-lg border px-3 py-2 text-sm font-medium tabular-nums transition min-[900px]:w-40",
                saved
                  ? "border-neutral-200 bg-neutral-100 text-brand-muted"
                  : "border-black/15 bg-white text-brand-black focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20",
              )}
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              disabled={!saved}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                saved
                  ? "border-black/15 bg-white text-brand-black hover:bg-neutral-50"
                  : "cursor-not-allowed border-transparent bg-neutral-100 text-neutral-400",
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onSave(item.id)}
              disabled={saved}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                !saved
                  ? "border-brand-green/40 bg-brand-mint text-brand-green hover:bg-emerald-100/80"
                  : "cursor-not-allowed border-transparent bg-neutral-100 text-neutral-400",
              )}
            >
              Save
            </button>
          </div>
          {state.error ? <p className="text-right text-sm text-red-600 min-[900px]:text-right">{state.error}</p> : null}
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  periodSummaryUk,
  onCancel,
  onConfirm,
}: {
  periodSummaryUk: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-bold text-brand-black">
          Check before you save
        </h2>
        {periodSummaryUk ? (
          <p className="mt-3 rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 text-sm text-brand-black">
            <span className="text-brand-muted">Return period:</span>{" "}
            <strong className="tabular-nums">{periodSummaryUk}</strong>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          This saves your monthly record in SelfSubmit. After saving, you will <strong className="text-brand-black">not</strong> be
          able to change these figures from this form. Please confirm you have reviewed every amount.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 min-[900px]:flex-row min-[900px]:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-brand-black hover:bg-neutral-50"
          >
            Cancel — I want to review
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-5 py-2.5 text-sm font-bold text-white shadow-btn-green hover:brightness-105"
          >
            Save record
          </button>
        </div>
      </div>
    </div>
  );
}
