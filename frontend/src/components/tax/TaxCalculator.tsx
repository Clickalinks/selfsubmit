"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  Calculator,
  ChevronDown,
  ChevronUp,
  HardHat,
  Info,
  Minus,
  Plus,
} from "lucide-react";

import { isCisConstructionTrade } from "@/data/expenseCategories";

export interface TaxCalculation {
  /** Annual turnover (gross self-employment income). */

  totalIncome: number;

  totalExpenses: number;

  netProfit: number;

  personalAllowanceUsed: number;

  taxableIncome: number;

  incomeTax: number;

  class2Nic: number;

  class4Nic: number;

  studentLoan: number;

  pensionContribution: number;

  /** Income Tax + Class 2/4 NIC + student loan (before CIS offset). */

  totalTaxDue: number;

  /** CIS deductions suffered in the year (construction subcontractors). */

  cisDeductionsAnnual: number;

  /** CIS credited against tax and NIC due (cannot exceed totalTaxDue in this model). */

  cisOffsetApplied: number;

  /** CIS above tax/NIC/loan may be refunded via Self Assessment. */

  cisSurplusOverTax: number;

  /** Tax and NIC still payable after CIS offset. */

  taxPayableAfterCis: number;

  effectiveTaxRate: number;

  takeHomePay: number;
}

export interface TaxCalculatorProps {
  profession: string;

  expenses: { name: string; amount: number }[];

  onTaxCalculated?: (tax: TaxCalculation) => void;
}

/** Pay period multipliers → annual (same convention as common UK salary calculators). */

const PERIOD_TO_ANNUAL = {
  year: 1,

  month: 12,

  week: 52,

  two_week: 26,

  four_week: 13,
} as const;

export type IncomePeriod = keyof typeof PERIOD_TO_ANNUAL;

export type TaxYearId = "2024-25" | "2025-26" | "2026-27";

type RateSet = {
  personalAllowance: number;

  higherRateThreshold: number;

  additionalRateThreshold: number;

  basicRatePercent: number;

  higherRatePercent: number;

  additionalRatePercent: number;

  selfEmployedSmallProfitsThreshold: number;

  class4LowerProfitsLimit: number;

  class4UpperProfitsLimit: number;

  class4MainRatePercent: number;

  class4AdditionalRatePercent: number;

  /** Plan 2 (post-2012) repayment band — illustrative; thresholds change by year. */

  studentLoanPlan2Threshold: number;

  studentLoanRatePercent: number;
};

/** Income tax & NIC — England & NI, self-employed. Thresholds frozen across these years in line with common calculator assumptions. */

const RATES_BY_YEAR: Record<TaxYearId, RateSet> = {
  "2024-25": {
    personalAllowance: 12_570,

    higherRateThreshold: 50_270,

    additionalRateThreshold: 125_140,

    basicRatePercent: 20,

    higherRatePercent: 40,

    additionalRatePercent: 45,

    selfEmployedSmallProfitsThreshold: 6_845,

    class4LowerProfitsLimit: 12_570,

    class4UpperProfitsLimit: 50_270,

    class4MainRatePercent: 6,

    class4AdditionalRatePercent: 2,

    studentLoanPlan2Threshold: 27_295,

    studentLoanRatePercent: 9,
  },

  "2025-26": {
    personalAllowance: 12_570,

    higherRateThreshold: 50_270,

    additionalRateThreshold: 125_140,

    basicRatePercent: 20,

    higherRatePercent: 40,

    additionalRatePercent: 45,

    selfEmployedSmallProfitsThreshold: 6_845,

    class4LowerProfitsLimit: 12_570,

    class4UpperProfitsLimit: 50_270,

    class4MainRatePercent: 6,

    class4AdditionalRatePercent: 2,

    studentLoanPlan2Threshold: 28_470,

    studentLoanRatePercent: 9,
  },

  "2026-27": {
    personalAllowance: 12_570,

    higherRateThreshold: 50_270,

    additionalRateThreshold: 125_140,

    basicRatePercent: 20,

    higherRatePercent: 40,

    additionalRatePercent: 45,

    selfEmployedSmallProfitsThreshold: 6_845,

    class4LowerProfitsLimit: 12_570,

    class4UpperProfitsLimit: 50_270,

    class4MainRatePercent: 6,

    class4AdditionalRatePercent: 2,

    studentLoanPlan2Threshold: 28_470,

    studentLoanRatePercent: 9,
  },
};

/** Illustrative only — not HMRC */

const ILLUSTRATIVE = {
  class2Percent: 13,

  class4Percent: 12,
} as const;

function calculateIncomeTax(netProfit: number, rates: RateSet): number {
  if (netProfit <= 0) return 0;

  let tax = 0;

  const abovePa = Math.max(0, netProfit - rates.personalAllowance);

  const basicBandEnd = rates.higherRateThreshold - rates.personalAllowance;

  const basicSlice = Math.min(abovePa, basicBandEnd);

  tax += basicSlice * (rates.basicRatePercent / 100);

  const higherBandEnd =
    rates.additionalRateThreshold - rates.personalAllowance - basicBandEnd;

  const higherSlice = Math.min(
    Math.max(0, abovePa - basicBandEnd),
    higherBandEnd,
  );

  tax += higherSlice * (rates.higherRatePercent / 100);

  const additionalSlice = Math.max(0, abovePa - basicBandEnd - higherBandEnd);

  tax += additionalSlice * (rates.additionalRatePercent / 100);

  return Math.round(tax * 100) / 100;
}

function calculateClass4(netProfit: number, rates: RateSet): number {
  if (netProfit <= rates.class4LowerProfitsLimit) return 0;

  const mainSlice =
    Math.min(netProfit, rates.class4UpperProfitsLimit) -
    rates.class4LowerProfitsLimit;

  let nic = Math.max(0, mainSlice) * (rates.class4MainRatePercent / 100);

  if (netProfit > rates.class4UpperProfitsLimit) {
    nic +=
      (netProfit - rates.class4UpperProfitsLimit) *
      (rates.class4AdditionalRatePercent / 100);
  }

  return Math.round(nic * 100) / 100;
}

function calculateClass2MandatoryGbp(): number {
  return 0;
}

function calculateStudentLoan(
  plan: StudentLoanChoice,
  profitAfterPension: number,
  rates: RateSet,
): number {
  if (plan !== "plan2" || profitAfterPension <= 0) return 0;

  const slice = Math.max(
    0,
    profitAfterPension - rates.studentLoanPlan2Threshold,
  );

  return Math.round(slice * (rates.studentLoanRatePercent / 100) * 100) / 100;
}

type TaxMethod = "uk_standard" | "percentage_nic";

type StudentLoanChoice = "none" | "plan2";

function buildTaxCalculation(
  annualTurnover: number,

  annualCosts: number,

  taxMethod: TaxMethod,

  rates: RateSet,

  pensionPercentOfProfit: number,

  studentLoan: StudentLoanChoice,

  cisDeductionsAnnual: number,
): TaxCalculation {
  const tradingProfit = Math.round((annualTurnover - annualCosts) * 100) / 100;

  const pensionRaw =
    tradingProfit > 0
      ? Math.round(
          tradingProfit *
            (Math.min(100, Math.max(0, pensionPercentOfProfit)) / 100) *
            100,
        ) / 100
      : 0;

  const pensionContribution = Math.min(
    Math.max(0, pensionRaw),
    Math.max(0, tradingProfit),
  );

  const netProfit =
    Math.round((tradingProfit - pensionContribution) * 100) / 100;

  if (netProfit <= 0) {
    const totalTaxDue = 0;

    const cisAnnual = Math.max(0, cisDeductionsAnnual);

    return {
      totalIncome: annualTurnover,

      totalExpenses: annualCosts,

      netProfit,

      personalAllowanceUsed: 0,

      taxableIncome: 0,

      incomeTax: 0,

      class2Nic: 0,

      class4Nic: 0,

      studentLoan: 0,

      pensionContribution,

      totalTaxDue,

      cisDeductionsAnnual: cisAnnual,

      cisOffsetApplied: 0,

      cisSurplusOverTax: Math.round(Math.max(0, cisAnnual - totalTaxDue) * 100) / 100,

      taxPayableAfterCis: 0,

      effectiveTaxRate: 0,

      takeHomePay:
        Math.round((tradingProfit - pensionContribution) * 100) / 100,
    };
  }

  const personalAllowanceUsed = Math.min(netProfit, rates.personalAllowance);

  const taxableIncome =
    Math.round((netProfit - personalAllowanceUsed) * 100) / 100;

  const incomeTax = calculateIncomeTax(netProfit, rates);

  let class2Nic = 0;

  let class4Nic = 0;

  if (taxMethod === "uk_standard") {
    class2Nic = calculateClass2MandatoryGbp();

    class4Nic = calculateClass4(netProfit, rates);
  } else {
    const above = Math.max(0, netProfit - rates.class4LowerProfitsLimit);

    class2Nic =
      Math.round(above * (ILLUSTRATIVE.class2Percent / 100) * 100) / 100;

    class4Nic =
      Math.round(above * (ILLUSTRATIVE.class4Percent / 100) * 100) / 100;
  }

  const studentLoanAmount = calculateStudentLoan(studentLoan, netProfit, rates);

  const totalTaxDue =
    Math.round((incomeTax + class2Nic + class4Nic + studentLoanAmount) * 100) /
    100;

  const cisAnnual = Math.max(0, cisDeductionsAnnual);

  const cisOffsetApplied =
    Math.round(Math.min(cisAnnual, Math.max(0, totalTaxDue)) * 100) / 100;

  const taxPayableAfterCis =
    Math.round((totalTaxDue - cisOffsetApplied) * 100) / 100;

  const cisSurplusOverTax =
    Math.round(Math.max(0, cisAnnual - totalTaxDue) * 100) / 100;

  const takeHomePay =
    Math.round(
      (tradingProfit - pensionContribution - taxPayableAfterCis) * 100,
    ) / 100;

  const effectiveTaxRate =
    netProfit > 0
      ? Math.round((taxPayableAfterCis / netProfit) * 10_000) / 100
      : 0;

  return {
    totalIncome: annualTurnover,

    totalExpenses: annualCosts,

    netProfit,

    personalAllowanceUsed,

    taxableIncome,

    incomeTax: Math.round(incomeTax * 100) / 100,

    class2Nic,

    class4Nic,

    studentLoan: studentLoanAmount,

    pensionContribution,

    totalTaxDue,

    cisDeductionsAnnual: cisAnnual,

    cisOffsetApplied,

    cisSurplusOverTax,

    taxPayableAfterCis,

    effectiveTaxRate,

    takeHomePay,
  };
}

function periodLabel(p: IncomePeriod): string {
  switch (p) {
    case "year":
      return "per year";

    case "month":
      return "per month";

    case "week":
      return "per week";

    case "two_week":
      return "every 2 weeks";

    case "four_week":
      return "every 4 weeks";

    default:
      return "per year";
  }
}

function moneyStep(period: IncomePeriod): number {
  switch (period) {
    case "year":
      return 1_000;

    case "month":
      return 100;

    case "week":
      return 25;

    case "two_week":
      return 50;

    case "four_week":
      return 50;

    default:
      return 100;
  }
}

function toAnnual(amount: number, period: IncomePeriod): number {
  const m = PERIOD_TO_ANNUAL[period];

  return Math.round(amount * m * 100) / 100;
}

function fromAnnual(annual: number, period: IncomePeriod): number {
  const m = PERIOD_TO_ANNUAL[period];

  return Math.round((annual / m) * 100) / 100;
}

function SummaryTable({
  tax,

  formatCurrency,
}: {
  tax: TaxCalculation;

  formatCurrency: (n: number) => string;
}) {
  const nicTotal = tax.class2Nic + tax.class4Nic;

  const tradingProfit = tax.totalIncome - tax.totalExpenses;

  const rows: {
    label: string;
    yearly: number;
    monthly: number;
    weekly: number;
  }[] = [
    {
      label: "Gross turnover",
      yearly: tax.totalIncome,
      monthly: tax.totalIncome / 12,
      weekly: tax.totalIncome / 52,
    },

    {
      label: "Business costs",
      yearly: -tax.totalExpenses,
      monthly: -tax.totalExpenses / 12,
      weekly: -tax.totalExpenses / 52,
    },

    {
      label: "Net profit (after costs)",

      yearly: tradingProfit,

      monthly: tradingProfit / 12,

      weekly: tradingProfit / 52,
    },
  ];

  if (tax.pensionContribution > 0) {
    rows.push({
      label: "Private pension",

      yearly: -tax.pensionContribution,

      monthly: -tax.pensionContribution / 12,

      weekly: -tax.pensionContribution / 52,
    });
  }

  rows.push(
    {
      label: "Tax-free (personal allowance used)",

      yearly: tax.personalAllowanceUsed,

      monthly: tax.personalAllowanceUsed / 12,

      weekly: tax.personalAllowanceUsed / 52,
    },

    {
      label: "Taxable income (after PA)",

      yearly: tax.taxableIncome,

      monthly: tax.taxableIncome / 12,

      weekly: tax.taxableIncome / 52,
    },

    {
      label: "Income tax",
      yearly: -tax.incomeTax,
      monthly: -tax.incomeTax / 12,
      weekly: -tax.incomeTax / 52,
    },

    {
      label: "National Insurance",
      yearly: -nicTotal,
      monthly: -nicTotal / 12,
      weekly: -nicTotal / 52,
    },
  );

  if (tax.studentLoan > 0) {
    rows.push({
      label: "Student loan repayment",

      yearly: -tax.studentLoan,

      monthly: -tax.studentLoan / 12,

      weekly: -tax.studentLoan / 52,
    });
  }

  rows.push({
    label:
      tax.cisDeductionsAnnual > 0
        ? "Total tax, NIC & loan (after CIS)"
        : "Total tax, NIC & loan",

    yearly: -tax.taxPayableAfterCis,

    monthly: -tax.taxPayableAfterCis / 12,

    weekly: -tax.taxPayableAfterCis / 52,
  });

  rows.push({
    label: "Take-home (retained)",

    yearly: tax.takeHomePay,

    monthly: tax.takeHomePay / 12,

    weekly: tax.takeHomePay / 52,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-black/10">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        <caption className="border-b border-black/10 bg-neutral-50 px-4 py-3 text-left text-sm font-semibold text-brand-black">
          Your income summary
        </caption>

        <thead>
          <tr className="border-b border-black/10 bg-neutral-50/80 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
            <th className="px-4 py-2" scope="col">
              &nbsp;
            </th>

            <th className="px-4 py-2 text-right tabular-nums" scope="col">
              Yearly
            </th>

            <th className="px-4 py-2 text-right tabular-nums" scope="col">
              Monthly
            </th>

            <th className="px-4 py-2 text-right tabular-nums" scope="col">
              Weekly
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              className={`border-b border-black/5 ${
                r.label.startsWith("Take-home")
                  ? "bg-brand-mint/40 font-semibold text-brand-black"
                  : ""
              }`}
            >
              <th
                scope="row"
                className="px-4 py-2.5 text-left font-normal text-brand-black"
              >
                {r.label}
              </th>

              <td className="px-4 py-2.5 text-right tabular-nums text-brand-black">
                {formatCurrency(r.yearly)}
              </td>

              <td className="px-4 py-2.5 text-right tabular-nums text-brand-black">
                {formatCurrency(r.monthly)}
              </td>

              <td className="px-4 py-2.5 text-right tabular-nums text-brand-black">
                {formatCurrency(r.weekly)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="sr-only" aria-live="polite">
        Total tax, NIC and loan after CIS: {formatCurrency(tax.taxPayableAfterCis)} per year.
      </p>
    </div>
  );
}

export function TaxCalculator({
  profession,
  expenses,
  onTaxCalculated,
}: TaxCalculatorProps) {
  const onTaxCalculatedRef = useRef(onTaxCalculated);

  onTaxCalculatedRef.current = onTaxCalculated;

  const expensesTotal = useMemo(
    () =>
      expenses.reduce(
        (sum, exp) => sum + (Number.isFinite(exp.amount) ? exp.amount : 0),
        0,
      ),

    [expenses],
  );

  const [period, setPeriod] = useState<IncomePeriod>("year");

  const [taxYear, setTaxYear] = useState<TaxYearId>("2025-26");

  const [turnoverInput, setTurnoverInput] = useState<number>(0);

  const [costsInput, setCostsInput] = useState<number>(0);

  const [showOptions, setShowOptions] = useState(false);

  const [showDetail, setShowDetail] = useState(true);

  const [showAdvancedNic, setShowAdvancedNic] = useState(false);

  const [taxMethod, setTaxMethod] = useState<TaxMethod>("uk_standard");

  const [pensionPercent, setPensionPercent] = useState<number>(0);

  const [studentLoan, setStudentLoan] = useState<StudentLoanChoice>("none");

  const [cisDeductionsAnnual, setCisDeductionsAnnual] = useState(0);

  const cisConstruction = isCisConstructionTrade(profession);

  useEffect(() => {
    if (!cisConstruction) setCisDeductionsAnnual(0);
  }, [cisConstruction]);

  useEffect(() => {
    if (expensesTotal <= 0) return;

    setCostsInput(fromAnnual(expensesTotal, period));
  }, [expensesTotal, period]);

  const rates = RATES_BY_YEAR[taxYear];

  const annualTurnover = useMemo(
    () => toAnnual(turnoverInput, period),
    [turnoverInput, period],
  );

  const annualCosts = useMemo(
    () => toAnnual(costsInput, period),
    [costsInput, period],
  );

  const tax = useMemo(
    () =>
      buildTaxCalculation(
        annualTurnover,
        annualCosts,
        taxMethod,
        rates,
        pensionPercent,
        studentLoan,
        cisConstruction ? cisDeductionsAnnual : 0,
      ),

    [
      annualTurnover,
      annualCosts,
      taxMethod,
      rates,
      pensionPercent,
      studentLoan,
      cisConstruction,
      cisDeductionsAnnual,
    ],
  );

  useEffect(() => {
    onTaxCalculatedRef.current?.(tax);
  }, [tax]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",

      currency: "GBP",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }).format(value);

  const step = moneyStep(period);

  const bump = (setter: Dispatch<SetStateAction<number>>, delta: number) => {
    setter((v) => Math.max(0, Math.round((v + delta) * 100) / 100));
  };

  const periodButtons: { id: IncomePeriod; label: string }[] = [
    { id: "year", label: "Year" },

    { id: "month", label: "Month" },

    { id: "four_week", label: "4 weeks" },

    { id: "two_week", label: "2 weeks" },

    { id: "week", label: "Week" },
  ];

  const taxYearButtons: { id: TaxYearId; label: string }[] = [
    { id: "2024-25", label: "2024/25" },

    { id: "2025-26", label: "2025/26" },

    { id: "2026-27", label: "2026/27" },
  ];

  const tradingProfit = tax.totalIncome - tax.totalExpenses;

  const hasInput =
    turnoverInput > 0 ||
    costsInput > 0 ||
    annualTurnover > 0 ||
    annualCosts > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card">
      <div className="bg-gradient-to-r from-brand-black to-brand-green-dark px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          Self-employed tax calculator
        </h2>

        <p className="mt-1 text-sm text-white/85">
          {profession} — turnover, costs, then yearly / monthly / weekly summary
          (England &amp; NI)
        </p>
      </div>

      <div className="border-b border-black/10 p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {periodButtons.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setPeriod(b.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                period === b.id
                  ? "bg-brand-green text-white shadow-btn-green"
                  : "border border-black/15 bg-neutral-50 text-brand-muted hover:bg-neutral-100"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-brand-muted -mt-2">
          Figures below are {periodLabel(period)} (converted to a full tax
          year).
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-black">
              Self-employed turnover (£)
            </label>

            <div className="flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Decrease turnover"
                onClick={() => bump(setTurnoverInput, -step)}
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-neutral-50 text-brand-black hover:bg-neutral-100"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>

              <input
                type="number"
                min={0}
                step="any"
                value={turnoverInput === 0 ? "" : turnoverInput}
                onChange={(e) =>
                  setTurnoverInput(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-3 text-lg font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
              />

              <button
                type="button"
                aria-label="Increase turnover"
                onClick={() => bump(setTurnoverInput, step)}
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-neutral-50 text-brand-black hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-black">
              Costs / expenses (£)
            </label>

            <div className="flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Decrease costs"
                onClick={() => bump(setCostsInput, -step)}
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-neutral-50 text-brand-black hover:bg-neutral-100"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>

              <input
                type="number"
                min={0}
                step="any"
                value={costsInput === 0 ? "" : costsInput}
                onChange={(e) => setCostsInput(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-3 text-lg font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
              />

              <button
                type="button"
                aria-label="Increase costs"
                onClick={() => bump(setCostsInput, step)}
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-neutral-50 text-brand-black hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {cisConstruction ? (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4">
            <div className="flex items-start gap-3">
              <HardHat className="mt-0.5 h-5 w-5 shrink-0 text-amber-900" aria-hidden />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-semibold text-brand-black">
                  Construction Industry Scheme (CIS)
                </p>
                <p className="text-xs leading-relaxed text-brand-muted">
                  Use <strong className="text-brand-black">gross</strong> turnover above (before contractors deducted
                  CIS). Enter the total CIS tax you suffered in the full tax year — it is credited against Income Tax
                  and Class 4 NIC in this estimate. Any CIS above that bill may be repaid via Self Assessment.
                </p>
                <label
                  htmlFor="tc-cis-annual"
                  className="block text-xs font-semibold text-brand-black"
                >
                  Annual CIS tax suffered (£)
                </label>
                <div className="flex max-w-md items-stretch gap-2">
                  <button
                    type="button"
                    aria-label="Decrease CIS suffered"
                    onClick={() => bump(setCisDeductionsAnnual, -step)}
                    className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-white text-brand-black hover:bg-amber-100/80"
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </button>
                  <input
                    id="tc-cis-annual"
                    type="number"
                    min={0}
                    step="any"
                    value={cisDeductionsAnnual === 0 ? "" : cisDeductionsAnnual}
                    onChange={(e) =>
                      setCisDeductionsAnnual(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-lg font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
                  />
                  <button
                    type="button"
                    aria-label="Increase CIS suffered"
                    onClick={() => bump(setCisDeductionsAnnual, step)}
                    className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-white text-brand-black hover:bg-amber-100/80"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <span className="mb-2 block text-sm font-semibold text-brand-black">
            Tax year
          </span>

          <div className="flex flex-wrap gap-2">
            {taxYearButtons.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setTaxYear(b.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  taxYear === b.id
                    ? "bg-brand-green text-white shadow-btn-green"
                    : "border border-black/15 bg-white text-brand-muted hover:bg-neutral-50"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 text-left text-sm font-semibold text-brand-black"
        >
          <span>Options (student loan, pension)</span>

          {showOptions ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>

        {showOptions ? (
          <div className="space-y-4 rounded-xl border border-black/10 bg-white p-4">
            <div>
              <label
                htmlFor="tc-student-loan"
                className="block text-sm font-medium text-brand-black"
              >
                Student loan (Plan 2)
              </label>

              <select
                id="tc-student-loan"
                value={studentLoan}
                onChange={(e) =>
                  setStudentLoan(e.target.value as StudentLoanChoice)
                }
                className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-brand-black"
              >
                <option value="none">No student loan</option>

                <option value="plan2">
                  Plan 2 — 9% above threshold (illustrative)
                </option>
              </select>

              <p className="mt-1 text-xs text-brand-muted">
                Threshold £
                {rates.studentLoanPlan2Threshold.toLocaleString("en-GB")} for{" "}
                {taxYear}. Other plans differ; confirm with GOV.UK.
              </p>
            </div>

            <div>
              <label
                htmlFor="tc-pension"
                className="block text-sm font-medium text-brand-black"
              >
                Private pension (% of profit after costs)
              </label>

              <input
                id="tc-pension"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={pensionPercent === 0 ? "" : pensionPercent}
                onChange={(e) =>
                  setPensionPercent(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-brand-black"
              />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowAdvancedNic((v) => !v)}
          className="text-xs font-medium text-brand-muted underline-offset-2 hover:text-brand-black hover:underline"
        >
          {showAdvancedNic ? "Hide" : "Show"} illustrative % NIC (not HMRC)
        </button>

        {showAdvancedNic ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
            <label className="mr-2 font-medium">NIC method:</label>

            <button
              type="button"
              className={`mr-2 rounded px-2 py-0.5 ${taxMethod === "uk_standard" ? "bg-white font-semibold shadow-sm" : ""}`}
              onClick={() => setTaxMethod("uk_standard")}
            >
              UK Class 2 / 4
            </button>

            <button
              type="button"
              className={`rounded px-2 py-0.5 ${taxMethod === "percentage_nic" ? "bg-white font-semibold shadow-sm" : ""}`}
              onClick={() => setTaxMethod("percentage_nic")}
            >
              {ILLUSTRATIVE.class2Percent}% + {ILLUSTRATIVE.class4Percent}%
              slice
            </button>
          </div>
        ) : null}
      </div>

      {hasInput ? (
        <div className="p-6 space-y-6">
          <SummaryTable tax={tax} formatCurrency={formatCurrency} />

          <div>
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="flex w-full items-center justify-between border-b border-black/10 pb-2 text-left font-semibold text-brand-black"
            >
              <span>Tax calculation detail</span>

              {showDetail ? (
                <ChevronUp className="h-4 w-4 text-brand-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-brand-muted" />
              )}
            </button>

            {showDetail ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Gross turnover</span>

                  <span className="tabular-nums font-medium text-brand-black">
                    {formatCurrency(tax.totalIncome)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brand-muted">Less business costs</span>

                  <span className="tabular-nums text-red-600">
                    −{formatCurrency(tax.totalExpenses)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-black/10 pt-2">
                  <span className="font-medium text-brand-black">
                    Net profit (after costs)
                  </span>

                  <span className="tabular-nums font-bold text-brand-green">
                    {formatCurrency(tradingProfit)}
                  </span>
                </div>

                {tax.pensionContribution > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">
                      Less pension contribution
                    </span>

                    <span className="tabular-nums text-red-600">
                      −{formatCurrency(tax.pensionContribution)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Profit used for tax &amp; NIC
                  </span>

                  <span className="tabular-nums text-brand-black">
                    {formatCurrency(tax.netProfit)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Personal allowance (tax-free)
                  </span>

                  <span className="tabular-nums text-brand-black">
                    {formatCurrency(tax.personalAllowanceUsed)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Taxable income (after PA)
                  </span>

                  <span className="tabular-nums text-brand-black">
                    {formatCurrency(tax.taxableIncome)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Income tax (20% / 40% / 45%)
                  </span>

                  <span className="tabular-nums text-amber-800">
                    {formatCurrency(tax.incomeTax)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Class 2 NIC (mandatory)
                    {taxMethod === "uk_standard" ? "" : " (illustrative %)"}
                  </span>

                  <span className="tabular-nums text-amber-800">
                    {formatCurrency(tax.class2Nic)}
                  </span>
                </div>

                {taxMethod === "uk_standard" &&
                tax.netProfit > rates.selfEmployedSmallProfitsThreshold ? (
                  <div className="rounded-lg border border-brand-green/30 bg-brand-mint/60 px-3 py-2 text-xs leading-relaxed text-brand-black">
                    <strong>Class 2:</strong> You do not need to pay mandatory
                    Class 2 NI because your profits are above the small profits
                    threshold of £
                    {rates.selfEmployedSmallProfitsThreshold.toLocaleString(
                      "en-GB",
                    )}
                    . You get the National Insurance record benefits
                    automatically.
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span className="text-brand-muted">
                    Class 4 NIC{" "}
                    {taxMethod === "uk_standard"
                      ? "(6% / 2%)"
                      : "(illustrative %)"}
                  </span>

                  <span className="tabular-nums text-amber-800">
                    {formatCurrency(tax.class4Nic)}
                  </span>
                </div>

                {tax.studentLoan > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">
                      Student loan repayment
                    </span>

                    <span className="tabular-nums text-amber-800">
                      {formatCurrency(tax.studentLoan)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-brand-black">
                  <span>
                    {tax.cisDeductionsAnnual > 0
                      ? "Total tax, NIC & loan (before CIS)"
                      : "Total tax, NIC & loan"}
                  </span>

                  <span className="tabular-nums text-red-700">
                    {formatCurrency(tax.totalTaxDue)}
                  </span>
                </div>

                {tax.cisOffsetApplied > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">CIS credited (capped at bill)</span>

                    <span className="tabular-nums font-semibold text-emerald-700">
                      −{formatCurrency(tax.cisOffsetApplied)}
                    </span>
                  </div>
                ) : null}

                {tax.cisDeductionsAnnual > 0 ? (
                  <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-brand-black">
                    <span>Still payable after CIS</span>

                    <span className="tabular-nums text-red-700">
                      {formatCurrency(tax.taxPayableAfterCis)}
                    </span>
                  </div>
                ) : null}

                {tax.cisSurplusOverTax > 0 ? (
                  <p className="text-xs leading-relaxed text-brand-muted">
                    CIS suffered exceeds this headline tax bill by{" "}
                    {formatCurrency(tax.cisSurplusOverTax)}. You may be due a repayment on Self Assessment — confirm on{" "}
                    <a
                      href="https://www.gov.uk/what-is-the-construction-industry-scheme"
                      className="font-medium text-brand-green underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GOV.UK
                    </a>
                    .
                  </p>
                ) : null}

                <div className="flex justify-between text-xs text-brand-muted">
                  <span>Effective rate (of profit used for tax)</span>

                  <span>{tax.effectiveTaxRate.toFixed(1)}%</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-brand-green/25 bg-brand-mint/50 p-4">
            <div className="flex flex-col justify-between gap-3 min-[500px]:flex-row min-[500px]:items-center">
              <div>
                <p className="text-sm font-medium text-brand-black">
                  Take-home (profit less tax, NIC &amp; loan
                  {tax.cisDeductionsAnnual > 0 ? ", after CIS credit" : ""})
                </p>

                <p className="text-xs text-brand-muted">
                  Pension already deducted from profit above.
                  {tax.cisDeductionsAnnual > 0
                    ? " CIS reduces tax still payable, not your declared profit."
                    : ""}
                </p>
              </div>

              <div className="text-left min-[500px]:text-right">
                <p className="text-3xl font-bold text-brand-green">
                  {formatCurrency(tax.takeHomePay)}
                </p>

                <p className="text-xs text-brand-muted">per year</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-brand-muted">
          <Calculator
            className="mx-auto mb-3 h-10 w-10 opacity-40"
            strokeWidth={1.5}
            aria-hidden
          />

          <p className="text-sm">
            Enter turnover (and costs if any) to see your summary table.
          </p>

          <p className="mt-2 text-xs">
            Layout follows the same flow as popular UK calculators: period, tax
            year, options, then results.
          </p>
        </div>
      )}

      <div className="flex gap-2 border-t border-black/10 bg-neutral-50 px-6 py-3 text-xs text-brand-muted">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-green"
          aria-hidden
        />

        <p>
          Estimate only: simplified self-employment model, no PA taper above
          £100k, no Marriage Allowance. CIS offset for construction trades is
          capped at headline tax + NIC + loan in this model. Student loan and pension
          are illustrative. Rates change — confirm on{" "}
          <a
            href="https://www.gov.uk/income-tax-rates"
            className="font-medium text-brand-green underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK
          </a>{" "}
          or with an accountant. Not affiliated with third-party calculator
          sites.
        </p>
      </div>
    </div>
  );
}
