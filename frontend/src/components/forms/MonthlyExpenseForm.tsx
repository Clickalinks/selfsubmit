"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { HardHat, ImagePlus, ListPlus, Receipt, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ALL_PROFESSIONS,
  HMRC_SIMPLIFIED_VEHICLE_PENCE_PER_MILE,
  type MileageAnnualBand,
  type MileageVehicleKind,
  type MoneyLineItem,
  type TradeFormTemplate,
  type VehicleCostMethod,
  VEHICLE_SIMPLIFIED_MILEAGE_EXPENSE_ID,
  computeSimplifiedMileageClaimGbp,
  getTemplateForProfession,
  getVisibleExpenseLineItems,
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
import { HmrcSimplifiedMileageNotice } from "@/components/forms/HmrcSimplifiedMileageNotice";

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

function defaultPeriodFromCalendarMonth(d = new Date()): { from: string; to: string } {
  const y = d.getFullYear();
  const mo = d.getMonth();
  const from = `${y}-${String(mo + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, mo + 1, 0).getDate();
  const to = `${y}-${String(mo + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
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
};

type MonthlyExpenseFormProps = {
  initialTrade: string;
};

export function MonthlyExpenseForm({ initialTrade }: MonthlyExpenseFormProps) {
  const defaultTrade = initialTrade.trim() || ALL_PROFESSIONS[0] || "Taxi Driver";
  const [trade, setTrade] = useState(defaultTrade);
  const template = useMemo(() => getTemplateForProfession(trade), [trade]);

  const initialTemplate = useMemo(() => getTemplateForProfession(defaultTrade), [defaultTrade]);

  const [vehicleCostMethod, setVehicleCostMethod] = useState<VehicleCostMethod>("actual");

  const [incomeRows, setIncomeRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(initialTemplate.incomeLineItems),
  );
  const [expenseRows, setExpenseRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(getVisibleExpenseLineItems(initialTemplate, "actual", defaultTrade)),
  );

  const [showConfirm, setShowConfirm] = useState(false);

  const [receiptCaptureTab, setReceiptCaptureTab] = useState<"upload" | "manual">("manual");
  const [manualReceiptLines, setManualReceiptLines] = useState<ManualReceiptLine[]>([]);
  const [uploadReceiptLines, setUploadReceiptLines] = useState<UploadReceiptLine[]>([]);
  const [receiptApplyMessage, setReceiptApplyMessage] = useState<string | undefined>(undefined);

  const [periodFrom, setPeriodFrom] = useState(() => defaultPeriodFromCalendarMonth().from);
  const [periodTo, setPeriodTo] = useState(() => defaultPeriodFromCalendarMonth().to);

  const [mileageMiles, setMileageMiles] = useState("");
  const [mileageVehicle, setMileageVehicle] = useState<MileageVehicleKind>("car_or_goods_vehicle");
  const [mileageBand, setMileageBand] = useState<MileageAnnualBand>("within_first_10000");
  const [mileageApplyError, setMileageApplyError] = useState<string | undefined>(undefined);

  const [cisDeductionThisPeriod, setCisDeductionThisPeriod] = useState("");

  const visibleExpenseItems = useMemo(
    () => getVisibleExpenseLineItems(template, vehicleCostMethod, trade),
    [template, vehicleCostMethod, trade],
  );

  const resetForTemplate = useCallback((t: TradeFormTemplate, profession: string) => {
    setIncomeRows(buildInitialRows(t.incomeLineItems));
    setVehicleCostMethod("actual");
    setExpenseRows(buildInitialRows(getVisibleExpenseLineItems(t, "actual", profession)));
    setMileageMiles("");
    setMileageVehicle("car_or_goods_vehicle");
    setMileageBand("within_first_10000");
    setMileageApplyError(undefined);
    setManualReceiptLines([]);
    setUploadReceiptLines((prev) => {
      prev.forEach((l) => {
        if (l.previewUrl) URL.revokeObjectURL(l.previewUrl);
      });
      return [];
    });
    setReceiptApplyMessage(undefined);
    setCisDeductionThisPeriod("");
  }, []);

  const onTradeChange = (next: string) => {
    setTrade(next);
    resetForTemplate(getTemplateForProfession(next), next);
  };

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

  const allIncomeSaved = template.incomeLineItems.every((li) => incomeRows[li.id]?.saved);
  const allExpensesSaved = visibleExpenseItems.every((li) => expenseRows[li.id]?.saved);
  const allSaved = allIncomeSaved && allExpensesSaved;

  const totals = useMemo(() => {
    if (!allSaved) return null;
    const income = sumSavedLines(incomeRows, template.incomeLineItems);
    const expenses = sumSavedLines(expenseRows, visibleExpenseItems);
    const net = income - expenses;
    return { income, expenses, net };
  }, [allSaved, incomeRows, expenseRows, template, visibleExpenseItems]);

  const liveTotals = useMemo(() => {
    const income = sumParsedLineAmounts(incomeRows, template.incomeLineItems);
    const expenses = sumParsedLineAmounts(expenseRows, visibleExpenseItems);
    return { income, expenses, net: income - expenses };
  }, [incomeRows, expenseRows, template, visibleExpenseItems]);

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
  const cisConstruction = isCisConstructionTrade(trade);

  const cisDeductionParsed = useMemo(
    () => parseAmount(cisDeductionThisPeriod),
    [cisDeductionThisPeriod],
  );
  const cisDeductionAmount = cisDeductionParsed.ok ? cisDeductionParsed.value : 0;

  const periodValid =
    periodFrom !== "" &&
    periodTo !== "" &&
    /^\d{4}-\d{2}-\d{2}$/.test(periodFrom) &&
    /^\d{4}-\d{2}-\d{2}$/.test(periodTo) &&
    periodFrom <= periodTo;

  const periodSummaryUk =
    periodFrom && periodTo && /^\d{4}-\d{2}-\d{2}$/.test(periodFrom) && /^\d{4}-\d{2}-\d{2}$/.test(periodTo)
      ? `${isoDateToUkDisplay(periodFrom)} up to ${isoDateToUkDisplay(periodTo)}`
      : "";

  const openSubmitWarning = () => {
    if (!allSaved) return;
    if (!periodValid) return;
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    const incomePayload = template.incomeLineItems.map((li) => ({
      id: li.id,
      label: li.label,
      amount: incomeRows[li.id]?.amount ?? "",
    }));
    const expensePayload = visibleExpenseItems.map((li) => ({
      id: li.id,
      label: li.label,
      amount: expenseRows[li.id]?.amount ?? "",
    }));
    console.info("Submit monthly return", {
      trade,
      period: {
        fromIso: periodFrom,
        toIso: periodTo,
        fromUk: isoDateToUkDisplay(periodFrom),
        toUk: isoDateToUkDisplay(periodTo),
      },
      template: template.id,
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
      totals,
      receiptCapture: {
        tab: receiptCaptureTab,
        manualLines: manualReceiptLines,
        uploadMeta: uploadReceiptLines.map((row) => ({
          id: row.id,
          amount: row.amount,
          note: row.note,
          fileName: row.file?.name ?? null,
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
    });
    alert("Submitted (demo). Connect your API to persist.");
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link href="/" className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            ← Home
          </Link>
          <span className="text-sm font-medium text-brand-muted">Monthly income &amp; expenses</span>
        </div>
      </div>

      <div className="mx-auto max-w-content px-5 py-8 min-[900px]:px-10 min-[900px]:py-10">
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
            The income and expenses below relate to this period only (for example, this income is from{" "}
            <span className="font-medium text-brand-black">04/04/2026</span> up to{" "}
            <span className="font-medium text-brand-black">03/05/2026</span>).
          </p>
          <div className="mt-4 grid gap-4 min-[520px]:grid-cols-2">
            <div>
              <label htmlFor="period-from" className="block text-sm font-semibold text-brand-black">
                From
              </label>
              <input
                id="period-from"
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
              />
            </div>
            <div>
              <label htmlFor="period-to" className="block text-sm font-semibold text-brand-black">
                Up to
              </label>
              <input
                id="period-to"
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
              />
            </div>
          </div>
          {periodSummaryUk ? (
            <p className="mt-3 text-sm text-brand-black">
              This return covers{" "}
              <strong className="tabular-nums">{isoDateToUkDisplay(periodFrom)}</strong> up to{" "}
              <strong className="tabular-nums">{isoDateToUkDisplay(periodTo)}</strong>.
            </p>
          ) : (
            <p className="mt-3 text-sm text-amber-800">Choose both dates so we know which period these figures belong to.</p>
          )}
          {periodFrom && periodTo && !periodValid ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              The end date must be on or after the start date.
            </p>
          ) : null}
        </section>

        <div className="mt-8 max-w-2xl">
          <label htmlFor="profession" className="block text-sm font-semibold text-brand-black">
            Business / profession
          </label>
          <div className="mt-2 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-stretch">
            <div className="flex shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-gradient-to-b from-brand-green-bright to-brand-green-dark p-4 text-white shadow-inner ring-2 ring-white/30 min-[520px]:w-[88px]">
              <TradeIcon className="h-9 w-9" strokeWidth={1.6} aria-hidden />
            </div>
            <select
              id="profession"
              value={trade}
              onChange={(e) => onTradeChange(e.target.value)}
              className="min-h-[52px] w-full flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
            >
              {ALL_PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
              <TemplateIcon className="h-4 w-4" aria-hidden />
            </span>
            <span>
              Template: <span className="font-medium text-brand-black">{template.title}</span>
            </span>
          </p>
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
          {template.incomeLineItems.map((item) => (
            <LedgerRow
              key={item.id}
              item={item}
              Icon={getLineItemIcon(item.id)}
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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <HardHat className="h-5 w-5" aria-hidden />
              </span>
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
          {visibleExpenseItems.map((item) => (
            <LedgerRow
              key={item.id}
              item={item}
              Icon={getLineItemIcon(item.id)}
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
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
              <Receipt className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 id="receipts-heading" className="text-lg font-bold text-brand-black">
                Receipts &amp; petty cash
              </h2>
              <p className="text-sm text-brand-muted">
                Upload a photo for your records and type the total from the receipt, or add manual lines. Amounts sum
                automatically; you can merge the total into <strong className="text-brand-black">Other allowable expenses</strong>.
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
                                if (!file) return { ...r, file: null, previewUrl: null };
                                return { ...r, file, previewUrl: URL.createObjectURL(file) };
                              }),
                            );
                            e.target.value = "";
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
                    { id: crypto.randomUUID(), amount: "", note: "", file: null, previewUrl: null },
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
          <strong>Before you submit:</strong> double-check income and expenses. After submission you will not be able to
          edit this return from this screen (demo — connect your backend for real rules).
        </div>

        <div className="mt-6 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center">
          <button
            type="button"
            onClick={openSubmitWarning}
            disabled={!allSaved || !periodValid}
            className={cx(
              "rounded-full px-8 py-3.5 text-[15px] font-bold text-white shadow-btn-green transition",
              allSaved && periodValid
                ? "bg-gradient-to-b from-brand-green-bright to-brand-green-dark hover:brightness-105"
                : "cursor-not-allowed bg-neutral-300 text-neutral-500 shadow-none",
            )}
          >
            Submit monthly return
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
  state,
  onAmountChange,
  onSave,
  onEdit,
}: {
  item: MoneyLineItem;
  Icon: LucideIcon;
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
            <span
              className={cx(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner ring-2 ring-white/80",
                saved
                  ? "bg-neutral-200/90 text-neutral-600"
                  : "bg-gradient-to-b from-brand-green-bright to-brand-green-dark text-white",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
            </span>
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
  onConfirm: () => void;
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
          Check before you submit
        </h2>
        {periodSummaryUk ? (
          <p className="mt-3 rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 text-sm text-brand-black">
            <span className="text-brand-muted">Return period:</span>{" "}
            <strong className="tabular-nums">{periodSummaryUk}</strong>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          After submitting, you will <strong className="text-brand-black">not</strong> be able to go back and change
          these figures from this form. Please confirm you have reviewed every amount.
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
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-5 py-2.5 text-sm font-bold text-white shadow-btn-green hover:brightness-105"
          >
            Submit anyway
          </button>
        </div>
      </div>
    </div>
  );
}
