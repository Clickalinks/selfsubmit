"use client";

type PeriodPresetsProps = {
  periodFrom: string;
  periodTo: string;
  onApply: (from: string, to: string) => void;
};

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildPresets(now = new Date()) {
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
  const qStart = q * 3;
  const qEnd = qStart + 2;
  const quarterFrom = toIso(y, qStart + 1, 1);
  const quarterTo = toIso(y, qEnd + 1, lastDayOfMonth(y, qEnd));
  const prevQ = q === 0 ? 3 : q - 1;
  const prevQY = q === 0 ? y - 1 : y;
  const prevQStart = prevQ * 3;
  const prevQEnd = prevQStart + 2;
  return [
    { label: "This month", from: thisFrom, to: thisTo },
    { label: "Last month", from: lastFrom, to: lastTo },
    { label: "This quarter", from: quarterFrom, to: quarterTo },
    {
      label: "Last quarter",
      from: toIso(prevQY, prevQStart + 1, 1),
      to: toIso(prevQY, prevQEnd + 1, lastDayOfMonth(prevQY, prevQEnd)),
    },
  ];
}

export function PeriodPresets({ periodFrom, periodTo, onApply }: PeriodPresetsProps) {
  const presets = buildPresets();
  return (
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick period presets">
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
