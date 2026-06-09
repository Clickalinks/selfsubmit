"use client";

import type { LucideIcon } from "lucide-react";

import { ALL_PROFESSIONS } from "@/data/expenseCategories";
import { DEFAULT_PROFESSION_ICON, PROFESSION_ICONS } from "@/data/tradeIcons";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

type ProfessionSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
  showIcon?: boolean;
};

export function ProfessionSelect({
  id = "primaryProfession",
  value,
  onChange,
  disabled,
  label = "Business type",
  error,
  showIcon = false,
}: ProfessionSelectProps) {
  const Icon: LucideIcon = PROFESSION_ICONS[value] ?? DEFAULT_PROFESSION_ICON;

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <div className={showIcon ? "mt-2 flex gap-3" : "mt-2"}>
        {showIcon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-mint">
            <Icon className="h-6 w-6 text-brand-green" strokeWidth={1.75} aria-hidden />
          </div>
        ) : null}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">Select your business type…</option>
          {ALL_PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      <p className="mt-1.5 text-xs text-slate-500">
        Choose the type that best matches your work — this sets your income and expense categories.
      </p>
    </div>
  );
}
