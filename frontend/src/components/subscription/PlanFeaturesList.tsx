import { Check } from "lucide-react";

import { PLAN_INCLUDED_FEATURES } from "@/lib/plan-config";

type Props = {
  className?: string;
  /** light = on dark pricing banner; dark = on white pages */
  variant?: "light" | "dark";
  columns?: 1 | 2 | 3;
};

export function PlanFeaturesList({ className = "", variant = "dark", columns = 3 }: Props) {
  const textClass = variant === "light" ? "text-white/85" : "text-brand-black/90";
  const gridClass =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={`grid gap-2.5 ${gridClass} ${className}`}>
      {PLAN_INCLUDED_FEATURES.map((feature) => (
        <li key={feature} className={`flex items-start gap-2 text-sm ${textClass}`}>
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
