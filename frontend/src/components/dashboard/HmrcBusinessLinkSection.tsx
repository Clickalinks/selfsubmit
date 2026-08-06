"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Check, Link2, Loader2, Unlink } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ensureHmrcFraudContext } from "@/lib/hmrc-fraud-client";

type LocalBusinessLink = {
  id: string;
  name: string;
  category: string;
  hmrcBusinessId: string | null;
};

type HmrcBusinessRow = {
  businessId: string;
  typeOfBusiness: string;
  tradingName: string | null;
};

type HmrcBusinessDetails = {
  businessId: string;
  typeOfBusiness: string;
  tradingName: string | null;
  accountingType: string | null;
  commencementDate: string | null;
};

type HmrcConnectionStatus = {
  connected: boolean;
};

export function HmrcBusinessLinkSection() {
  const [hmrcConnected, setHmrcConnected] = useState(false);
  const [localBusinesses, setLocalBusinesses] = useState<LocalBusinessLink[]>([]);
  const [hmrcBusinesses, setHmrcBusinesses] = useState<HmrcBusinessRow[] | null>(null);
  const [hmrcDetails, setHmrcDetails] = useState<HmrcBusinessDetails[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedHmrcId, setSelectedHmrcId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadLocalLinks = useCallback(async () => {
    const res = await fetch("/api/hmrc/business-links");
    if (!res.ok) return [];
    const data = (await res.json()) as { businesses?: LocalBusinessLink[] };
    return data.businesses ?? [];
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, businesses] = await Promise.all([
        fetch("/api/hmrc/status"),
        loadLocalLinks(),
      ]);
      const status = statusRes.ok ? ((await statusRes.json()) as HmrcConnectionStatus) : null;
      setHmrcConnected(Boolean(status?.connected));
      setLocalBusinesses(businesses);
      if (businesses.length > 0) {
        setSelectedBusinessId((prev) => {
          if (prev && businesses.some((b) => b.id === prev)) return prev;
          return businesses.find((b) => b.hmrcBusinessId)?.id ?? businesses[0].id;
        });
        setSelectedHmrcId((prev) => {
          if (prev) return prev;
          const linked = businesses.find((b) => b.hmrcBusinessId);
          return linked?.hmrcBusinessId ?? "";
        });
      }
    } catch {
      setError("Could not load business link status.");
    } finally {
      setLoading(false);
    }
  }, [loadLocalLinks]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const loadHmrcBusinesses = async () => {
    setBusy("load");
    setError(null);
    setMessage(null);
    try {
      const prepared = await ensureHmrcFraudContext();
      if (!prepared) {
        setError("Could not prepare fraud prevention headers. Try again.");
        return;
      }
      const res = await fetch("/api/hmrc/businesses");
      const data = (await res.json().catch(() => ({}))) as {
        businesses?: HmrcBusinessRow[];
        details?: HmrcBusinessDetails[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load HMRC businesses.");
        return;
      }
      setHmrcBusinesses(data.businesses ?? []);
      setHmrcDetails(data.details ?? []);
      if ((data.businesses ?? []).length === 0) {
        setMessage("HMRC returned no businesses for your test user.");
      } else {
        const detailCount = data.details?.length ?? 0;
        setMessage(
          detailCount > 0
            ? `Loaded ${data.businesses!.length} HMRC business(es) and retrieved full details for ${detailCount}.`
            : `Loaded ${data.businesses!.length} HMRC business(es).`,
        );
        if (!selectedHmrcId && data.businesses?.[0]) {
          const selfEmployment = data.businesses.find((b) => b.typeOfBusiness === "self-employment");
          setSelectedHmrcId(selfEmployment?.businessId ?? data.businesses[0].businessId);
        }
      }
    } catch {
      setError("Could not load HMRC businesses.");
    } finally {
      setBusy(null);
    }
  };

  const saveLink = async (hmrcBusinessId: string | null) => {
    if (!selectedBusinessId) {
      setError("Choose a SelfSubmit business first.");
      return;
    }
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/hmrc/business-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selectedBusinessId, hmrcBusinessId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save HMRC business link.");
        return;
      }
      setMessage(hmrcBusinessId ? "HMRC business linked successfully." : "HMRC business link removed.");
      const businesses = await loadLocalLinks();
      setLocalBusinesses(businesses);
      if (hmrcBusinessId) {
        setSelectedHmrcId(hmrcBusinessId);
      }
    } catch {
      setError("Could not save HMRC business link.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <DashboardCard title="HMRC business link" description="Loading…">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading business links…
        </p>
      </DashboardCard>
    );
  }

  if (!hmrcConnected) {
    return (
      <DashboardCard
        title="HMRC business link"
        description="Connect your HMRC account above before linking a business for sandbox quarterly updates."
      >
        <p className="text-sm text-slate-600">Available after HMRC account connection.</p>
      </DashboardCard>
    );
  }

  const linkedCount = localBusinesses.filter((b) => b.hmrcBusinessId).length;

  return (
    <DashboardCard
      title="HMRC business link"
      description="Link one of your SelfSubmit businesses to the matching HMRC income source. Required before sandbox quarterly submission (Phase 3)."
    >
      {message ? (
        <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div className="space-y-4 text-sm text-slate-600">
        <p>
          {linkedCount > 0
            ? `${linkedCount} SelfSubmit business${linkedCount === 1 ? "" : "es"} linked to HMRC.`
            : "No businesses linked yet."}{" "}
          You can link one HMRC business per SelfSubmit business (only one needs linking if you use a single business).
        </p>

        {localBusinesses.length > 0 ? (
          <ul className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {localBusinesses.map((business) => (
              <li key={business.id} className="flex flex-wrap items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="font-medium text-slate-800">{business.name}</span>
                <span className="text-slate-500">({business.category})</span>
                {business.hmrcBusinessId ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    <Check className="h-3 w-3" />
                    {business.hmrcBusinessId}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Not linked
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            Add a business on your dashboard before linking to HMRC.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="hmrc-link-local-business">
              SelfSubmit business
            </label>
            <select
              id="hmrc-link-local-business"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              value={selectedBusinessId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedBusinessId(id);
                const match = localBusinesses.find((b) => b.id === id);
                setSelectedHmrcId(match?.hmrcBusinessId ?? selectedHmrcId);
              }}
            >
              {localBusinesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} ({business.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="hmrc-link-hmrc-business">
              HMRC business ID
            </label>
            {hmrcBusinesses && hmrcBusinesses.length > 0 ? (
              <select
                id="hmrc-link-hmrc-business"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                value={selectedHmrcId}
                onChange={(e) => setSelectedHmrcId(e.target.value)}
              >
                <option value="">Choose HMRC business…</option>
                {hmrcBusinesses.map((business) => (
                  <option key={business.businessId} value={business.businessId}>
                    {business.businessId}
                    {business.tradingName ? ` — ${business.tradingName}` : ""} ({business.typeOfBusiness})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="hmrc-link-hmrc-business"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono text-slate-900 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                value={selectedHmrcId}
                onChange={(e) => setSelectedHmrcId(e.target.value.toUpperCase())}
                placeholder="e.g. XBIS12345678901"
                autoComplete="off"
              />
            )}
            <p className="mt-1 text-xs text-slate-500">
              Load from HMRC or paste the ID from your obligations table (self-employment IDs start with XBIS).
            </p>
          </div>
        </div>

        {hmrcDetails.length > 0 ? (
          <ul className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
            {hmrcDetails.map((d) => (
              <li key={d.businessId}>
                <span className="font-semibold">{d.businessId}</span>
                {d.tradingName ? ` — ${d.tradingName}` : ""}
                {d.accountingType ? ` · ${d.accountingType}` : ""}
                {d.commencementDate ? ` · started ${d.commencementDate}` : ""}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void loadHmrcBusinesses()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === "load" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Load HMRC businesses
          </button>
          <button
            type="button"
            disabled={busy !== null || !selectedBusinessId || !selectedHmrcId}
            onClick={() => void saveLink(selectedHmrcId)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white hover:bg-brand-green/90 disabled:opacity-60"
          >
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Save link
          </button>
          <button
            type="button"
            disabled={busy !== null || !selectedBusinessId}
            onClick={() => void saveLink(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
            Unlink
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}
