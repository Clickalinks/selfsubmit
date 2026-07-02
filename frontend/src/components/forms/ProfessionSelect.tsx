"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";

import { ALL_PROFESSIONS } from "@/data/expenseCategories";
import { DEFAULT_PROFESSION_ICON, PROFESSION_ICONS } from "@/data/tradeIcons";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

const searchClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

type ProfessionSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
  showIcon?: boolean;
  required?: boolean;
  helperText?: string;
};

export function ProfessionSelect({
  id = "primaryProfession",
  value,
  onChange,
  disabled,
  label = "Business type",
  error,
  showIcon = false,
  required = false,
  helperText = "Choose the type that best matches your work — this sets your income and expense categories.",
}: ProfessionSelectProps) {
  const [query, setQuery] = useState("");
  const Icon: LucideIcon = PROFESSION_ICONS[value] ?? DEFAULT_PROFESSION_ICON;

  const filteredProfessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_PROFESSIONS;
    return ALL_PROFESSIONS.filter((p) => p.toLowerCase().includes(q));
  }, [query]);

  const options = useMemo(() => {
    if (!value || filteredProfessions.includes(value)) return filteredProfessions;
    return [value, ...filteredProfessions];
  }, [filteredProfessions, value]);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>

      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Search professions…"
          className={searchClass}
          aria-label="Search professions"
        />
      </div>

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
          required={required}
          size={Math.min(Math.max(options.length, 1), 8)}
          className={`${selectClass} max-h-56`}
        >
          {!required ? <option value="">Select your business type…</option> : null}
          {options.length === 0 ? (
            <option value="" disabled>
              No professions match your search
            </option>
          ) : (
            options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))
          )}
        </select>
      </div>

      {query.trim() && options.length > 0 ? (
        <p className="mt-1.5 text-xs text-slate-500">
          {options.length} profession{options.length === 1 ? "" : "s"} match &ldquo;{query.trim()}&rdquo;
        </p>
      ) : null}

      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      {helperText ? <p className="mt-1.5 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
