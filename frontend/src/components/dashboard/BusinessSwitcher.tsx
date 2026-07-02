"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";

type BusinessRow = {
  id: string;
  name: string;
  category: string;
};

type BusinessApiPayload = {
  businesses?: BusinessRow[];
  activeBusinessId?: string | null;
  canSwitchBusiness?: boolean;
};

type Props = {
  /** When set, changing business navigates here with ?businessId= (e.g. /dashboard or /submit). */
  basePath?: string;
  className?: string;
  compact?: boolean;
};

export function BusinessSwitcher({ basePath, className = "", compact = false }: Props) {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business");
      const data = (await res.json()) as BusinessApiPayload;
      if (!res.ok) return;
      setBusinesses(data.businesses ?? []);
      setActiveId(data.activeBusinessId ?? null);
      setCanSwitch(Boolean(data.canSwitchBusiness));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onChange = async (businessId: string) => {
    if (!businessId || businessId === activeId) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/business/active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!res.ok) return;
      setActiveId(businessId);
      if (basePath) {
        const url = new URL(basePath, window.location.origin);
        url.searchParams.set("businessId", businessId);
        router.push(`${url.pathname}${url.search}`);
      } else {
        router.refresh();
      }
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading businesses…</span>
      </div>
    );
  }

  if (!canSwitch || businesses.length <= 1) {
    const active = businesses.find((b) => b.id === activeId) ?? businesses[0];
    if (!active) return null;
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
        <Building2 className="h-4 w-4 shrink-0 text-brand-green" aria-hidden />
        <span className="truncate">
          <span className="font-semibold text-slate-900">{active.name}</span>
          {!compact ? <span className="text-slate-500"> · {active.category}</span> : null}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 ${className}`}>
      <label htmlFor="active-business" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Building2 className="h-4 w-4 text-brand-green" aria-hidden />
        Active business
      </label>
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <select
          id="active-business"
          value={activeId ?? ""}
          disabled={switching}
          onChange={(e) => void onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25 disabled:opacity-60"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.category}
            </option>
          ))}
        </select>
        {switching ? (
          <Loader2 className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : null}
      </div>
    </div>
  );
}
