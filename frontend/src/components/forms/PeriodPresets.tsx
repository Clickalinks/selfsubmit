"use client";

import { getAllowedMonthlyPeriods, getRecordPeriodBounds } from "@/lib/monthly-record-period";

type PeriodPresetsProps = {
  periodFrom: string;
  periodTo: string;
  onApply: (from: string, to: string) => void;
};

export function PeriodPresets({ periodFrom, periodTo, onApply }: PeriodPresetsProps) {
  const presets = getAllowedMonthlyPeriods();
  return (
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Period presets">
      {presets.map((preset) => {
        const active = periodFrom === preset.from && periodTo === preset.to;
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => onApply(preset.from, preset.to)}
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
  );
}

export function PeriodDateInputs({
  periodFrom,
  periodTo,
  onPeriodFromChange,
  onPeriodToChange,
}: {
  periodFrom: string;
  periodTo: string;
  onPeriodFromChange: (iso: string) => void;
  onPeriodToChange: (iso: string) => void;
}) {
  const bounds = getRecordPeriodBounds();
  return (
    <div className="mt-4 grid gap-4 min-[520px]:grid-cols-2">
      <div>
        <label htmlFor="period-from" className="block text-sm font-semibold text-brand-black">
          From
        </label>
        <input
          id="period-from"
          type="date"
          value={periodFrom}
          min={bounds.minFrom}
          max={bounds.maxTo}
          onChange={(e) => onPeriodFromChange(e.target.value)}
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
          min={bounds.minFrom}
          max={bounds.maxTo}
          onChange={(e) => onPeriodToChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
        />
      </div>
    </div>
  );
}
