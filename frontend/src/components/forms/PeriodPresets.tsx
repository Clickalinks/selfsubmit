"use client";

import { getAllowedMonthlyPeriods } from "@/lib/monthly-record-period";

type PeriodPresetsProps = {
  periodFrom: string;
  periodTo: string;
  onApply: (from: string, to: string) => void;
};

export function PeriodPresets({ periodFrom, periodTo, onApply }: PeriodPresetsProps) {
  const presets = getAllowedMonthlyPeriods();
  return (
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Monthly period">
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
