"use client";

import { PeriodDateInputs, PeriodPresets } from "@/components/forms/PeriodPresets";

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
  return (
    <section
      className="mt-8 max-w-2xl rounded-2xl border border-black/10 bg-neutral-50/80 px-4 py-4 min-[900px]:px-6 min-[900px]:py-5"
      aria-labelledby="return-period-heading"
    >
      <h2 id="return-period-heading" className="text-sm font-bold text-brand-black">
        Return period
      </h2>
      <p className="mt-1 text-xs text-brand-muted">
        Use a quick preset or pick exact dates. You can catch up on <strong>last quarter</strong>, or record{" "}
        <strong>this month</strong> / <strong>last month</strong>. Future dates are not allowed. Quarterly HMRC submit
        opens near the end of each tax quarter.
      </p>

      <PeriodPresets
        periodFrom={periodFrom}
        periodTo={periodTo}
        onApply={(from, to) => {
          onPeriodFromChange(from);
          onPeriodToChange(to);
        }}
      />
      <PeriodDateInputs
        periodFrom={periodFrom}
        periodTo={periodTo}
        onPeriodFromChange={onPeriodFromChange}
        onPeriodToChange={onPeriodToChange}
      />

      {periodSummaryUk ? (
        <p className="mt-3 text-sm text-brand-black">
          This record covers <strong className="tabular-nums">{isoDateToUkDisplay(periodFrom)}</strong> up to{" "}
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
  );
}
