"use client";

import { getAllowedMonthlyPeriods } from "@/lib/monthly-record-period";

type ReturnPeriodPickerProps = {
  periodFrom: string;
  periodTo: string;
  onPeriodFromChange: (iso: string) => void;
  onPeriodToChange: (iso: string) => void;
  periodValid: boolean;
  periodSummaryUk: string;
};

function isoDateToUkDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function ReturnPeriodPicker({
  periodFrom,
  periodTo,
  onPeriodFromChange,
  onPeriodToChange,
  periodValid,
  periodSummaryUk,
}: ReturnPeriodPickerProps) {
  const presets = getAllowedMonthlyPeriods();

  const applyPreset = (from: string, to: string) => {
    onPeriodFromChange(from);
    onPeriodToChange(to);
  };

  return (
    <section
      className="mt-8 max-w-2xl rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4 min-[900px]:px-6 min-[900px]:py-5"
      aria-labelledby="return-period-heading"
    >
      <h2 id="return-period-heading" className="text-sm font-bold text-brand-black">
        Return period
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        Save one month at a time. You can only add <strong>this month</strong> or <strong>last month</strong> — not
        future months. Quarterly HMRC submit opens near the end of each tax quarter.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Monthly period">
        {presets.map((preset) => {
          const active = periodFrom === preset.from && periodTo === preset.to;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.from, preset.to)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-brand-green bg-brand-mint text-brand-green-dark"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-green/40"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {periodSummaryUk ? (
        <p className="mt-3 text-sm text-brand-black">
          This monthly record covers{" "}
          <strong className="tabular-nums">{isoDateToUkDisplay(periodFrom)}</strong> up to{" "}
          <strong className="tabular-nums">{isoDateToUkDisplay(periodTo)}</strong>.
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-800">Choose this month or last month for these figures.</p>
      )}
      {periodFrom && periodTo && !periodValid ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          Choose this month or last month only (full calendar month).
        </p>
      ) : null}
    </section>
  );
}
