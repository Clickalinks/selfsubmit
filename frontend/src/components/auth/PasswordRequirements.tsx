"use client";

import { Check, Circle } from "lucide-react";

import { getPasswordRuleResults } from "@/lib/password-policy";

type Props = {
  password: string;
  className?: string;
};

export function PasswordRequirements({ password, className = "" }: Props) {
  const rules = getPasswordRuleResults(password);
  const allMet = rules.every((r) => r.met);

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${allMet && password ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200 bg-slate-50/80"} ${className}`}
      aria-live="polite"
    >
      <p className="text-xs font-semibold text-slate-700">Password must include:</p>
      <ul className="mt-2 space-y-1.5">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-start gap-2 text-xs">
            {rule.met ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
            ) : (
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={2} />
            )}
            <span className={rule.met ? "text-emerald-800" : "text-slate-600"}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
