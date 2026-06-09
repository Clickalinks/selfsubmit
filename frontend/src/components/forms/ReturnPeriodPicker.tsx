"use client";

type ReturnPeriodPickerProps = {
  periodFrom: string;
  periodTo: string;
  onPeriodFromChange: (iso: string) => void;
  onPeriodToChange: (iso: string) => void;
  periodValid: boolean;
  periodSummaryUk: string;
};

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoDateToUkDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

type Preset = { label: string; from: string; to: string };

function buildPresets(now = new Date()): Preset[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisFrom = toIso(y, m + 1, 1);
  const thisTo = toIso(y, m + 1, lastDayOfMonth(y, m));

  const prev = new Date(y, m - 1, 1);
  const py = prev.getFullYear();
  const pm = prev.getMonth();
  const lastFrom = toIso(py, pm + 1, 1);
  const lastTo = toIso(py, pm + 1, lastDayOfMonth(py, pm));

  const q = Math.floor(m / 3);
  const qStartMonth = q * 3;
  const qEndMonth = qStartMonth + 2;
  const quarterFrom = toIso(y, qStartMonth + 1, 1);
  const quarterTo = toIso(y, qEndMonth + 1, lastDayOfMonth(y, qEndMonth));

  const prevQ = q === 0 ? 3 : q - 1;
  const prevQY = q === 0 ? y - 1 : y;
  const prevQStart = prevQ * 3;
  const prevQEnd = prevQStart + 2;
  const prevQuarterFrom = toIso(prevQY, prevQStart + 1, 1);
  const prevQuarterTo = toIso(prevQY, prevQEnd + 1, lastDayOfMonth(prevQY, prevQEnd));

  return [
    { label: "This month", from: thisFrom, to: thisTo },
    { label: "Last month", from: lastFrom, to: lastTo },
    { label: "This quarter", from: quarterFrom, to: quarterTo },
    { label: "Last quarter", from: prevQuarterFrom, to: prevQuarterTo },
  ];
}

export function ReturnPeriodPicker({
  periodFrom,
  periodTo,
  onPeriodFromChange,
  onPeriodToChange,
  periodValid,
  periodSummaryUk,
}: ReturnPeriodPickerProps) {
  const presets = buildPresets();

  const applyPreset = (preset: Preset) => {
    onPeriodFromChange(preset.from);
    onPeriodToChange(preset.to);
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
        Choose the dates this income and these expenses relate to. Use a quick preset or pick exact dates.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick period presets">
        {presets.map((preset) => {
          const active = periodFrom === preset.from && periodTo === preset.to;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
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

      <div className="mt-4 grid gap-4 min-[520px]:grid-cols-2">
        <div>
          <label htmlFor="period-from" className="block text-sm font-semibold text-brand-black">
            From
          </label>
          <input
            id="period-from"
            type="date"
            value={periodFrom}
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
            onChange={(e) => onPeriodToChange(e.target.value)}
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
  );
}
