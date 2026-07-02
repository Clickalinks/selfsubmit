"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  /** When set, changing business navigates here after saving (e.g. /dashboard). */
  basePath?: string;
  className?: string;
  compact?: boolean;
};

async function persistActiveBusiness(businessId: string): Promise<boolean> {
  const res = await fetch("/api/business/active", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
  return res.ok;
}

export function BusinessSwitcher(props: Props) {
  return (
    <Suspense
      fallback={
        <div className={`flex items-center gap-2 text-sm text-slate-500 ${props.className ?? ""}`}>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>Loading businesses…</span>
        </div>
      }
    >
      <BusinessSwitcherInner {...props} />
    </Suspense>
  );
}

function BusinessSwitcherInner({ basePath, className = "", compact = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const syncedUrlRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const urlBusinessId = searchParams.get("businessId");
      const query = urlBusinessId ? `?businessId=${encodeURIComponent(urlBusinessId)}` : "";
      const res = await fetch(`/api/business${query}`);
      const data = (await res.json()) as BusinessApiPayload;
      if (!res.ok) return;
      setBusinesses(data.businesses ?? []);
      setActiveId(data.activeBusinessId ?? null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const urlBusinessId = searchParams.get("businessId");
    if (!urlBusinessId || loading || syncedUrlRef.current) return;

    syncedUrlRef.current = true;
    void (async () => {
      const ok = await persistActiveBusiness(urlBusinessId);
      if (!ok) {
        syncedUrlRef.current = false;
        return;
      }
      setActiveId(urlBusinessId);
      const path = basePath ?? window.location.pathname;
      router.replace(path);
      router.refresh();
    })();
  }, [basePath, loading, router, searchParams]);

  const onChange = async (businessId: string) => {
    if (!businessId || businessId === activeId) return;
    setSwitching(true);
    try {
      const ok = await persistActiveBusiness(businessId);
      if (!ok) return;
      setActiveId(businessId);
      if (basePath) {
        router.push(basePath);
      }
      router.refresh();
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

  if (businesses.length === 0) return null;

  if (businesses.length === 1) {
    const active = businesses[0];
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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor="active-business"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        <Building2 className="h-4 w-4 text-brand-green" aria-hidden />
        Active business
      </label>
      <div className="relative w-full min-w-0">
        <select
          id="active-business"
          value={activeId ?? ""}
          disabled={switching}
          onChange={(e) => void onChange(e.target.value)}
          className="w-full max-w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25 disabled:opacity-60"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.category})
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
