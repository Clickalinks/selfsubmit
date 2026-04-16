"use client";

import Link from "next/link";
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
  usesBusinessVehicleTemplate,
  vehicleSimplifiedMileageAllowed,
} from "@/data/expenseCategories";
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

  const [periodFrom, setPeriodFrom] = useState(() => defaultPeriodFromCalendarMonth().from);
  const [periodTo, setPeriodTo] = useState(() => defaultPeriodFromCalendarMonth().to);

  const [mileageMiles, setMileageMiles] = useState("");
  const [mileageVehicle, setMileageVehicle] = useState<MileageVehicleKind>("car_or_goods_vehicle");
  const [mileageBand, setMileageBand] = useState<MileageAnnualBand>("within_first_10000");
  const [mileageApplyError, setMileageApplyError] = useState<string | undefined>(undefined);

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

        <div className="mt-8 max-w-xl">
          <label htmlFor="profession" className="block text-sm font-semibold text-brand-black">
            Business / profession
          </label>
          <select
            id="profession"
            value={trade}
            onChange={(e) => onTradeChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
          >
            {ALL_PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-brand-muted">
            Template: <span className="font-medium text-brand-black">{template.title}</span>
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
              state={incomeRows[item.id] ?? { amount: "", saved: false }}
              onAmountChange={setIncomeAmount}
              onSave={saveIncome}
              onEdit={editIncome}
            />
          ))}
        </section>

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
              state={expenseRows[item.id] ?? { amount: "", saved: false }}
              onAmountChange={setExpenseAmount}
              onSave={saveExpense}
              onEdit={editExpense}
            />
          ))}
        </section>

        <section className="mt-12" aria-labelledby="totals-heading">
          <h2 id="totals-heading" className="text-lg font-bold text-brand-black">
            Totals
          </h2>
          {totals ? (
            <div className="mt-4 rounded-2xl border border-brand-green/25 bg-brand-mint/60 px-5 py-5 shadow-card min-[900px]:px-8 min-[900px]:py-6">
              <dl className="grid gap-4 min-[900px]:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-brand-muted">Total income</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-black">{formatMoney(totals.income)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-brand-muted">Total expenses</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-black">{formatMoney(totals.expenses)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-brand-muted">Net (profit)</dt>
                  <dd
                    className={cx(
                      "mt-1 text-2xl font-bold tabular-nums",
                      totals.net >= 0 ? "text-brand-green" : "text-red-600",
                    )}
                  >
                    {formatMoney(totals.net)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-black/15 bg-neutral-50 px-4 py-6 text-center text-sm text-brand-muted">
              {showSimplifiedMileageStep ? (
                <>
                  Save <strong className="text-brand-black">every income line</strong>, apply{" "}
                  <strong className="text-brand-black">business mileage</strong> in the section above for your
                  simplified vehicle cost, then save <strong className="text-brand-black">every expense line</strong> —
                  your totals will appear here automatically.
                </>
              ) : (
                <>
                  Save <strong className="text-brand-black">every income line</strong> and{" "}
                  <strong className="text-brand-black">every expense line</strong> — your totals will appear here
                  automatically.
                </>
              )}
            </p>
          )}
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
  state,
  onAmountChange,
  onSave,
  onEdit,
}: {
  item: MoneyLineItem;
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
          <div className="font-semibold text-brand-black">{item.label}</div>
          {item.hint ? <p className="mt-1 text-sm text-brand-muted">{item.hint}</p> : null}
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
