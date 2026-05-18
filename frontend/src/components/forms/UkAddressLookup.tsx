"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Loader2, Search } from "lucide-react";

import type { AddressOption } from "@/lib/address-providers";
import { formatStructuredAddress } from "@/lib/address-providers";
import { isValidUkPostcode, normalizePostcode } from "@/lib/uk-address";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const labelClass = "block text-sm font-semibold text-slate-800";

type PostcodeArea = {
  town: string;
  county: string;
  postcode: string;
};

type Props = {
  idPrefix: string;
  label: string;
  value: string;
  onChange: (address: string) => void;
  error?: string;
  disabled?: boolean;
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-slate-500">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function UkAddressLookup({ idPrefix, label, value, onChange, error, disabled = false }: Props) {
  const selectId = useId();

  const [postcode, setPostcode] = useState("");
  const [options, setOptions] = useState<AddressOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupHint, setLookupHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [structuredMode, setStructuredMode] = useState(false);
  const [area, setArea] = useState<PostcodeArea | null>(null);

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");

  useEffect(() => {
    if (!value.trim()) return;
    const lines = value.trim().split("\n");
    const last = lines[lines.length - 1]?.trim() ?? "";
    if (isValidUkPostcode(last) && !postcode) {
      setPostcode(normalizePostcode(last));
    }
  }, [value, postcode]);

  const applyStructuredAddress = useCallback(
    (next: { line1: string; line2: string; town: string; county: string; postcode: string }) => {
      onChange(formatStructuredAddress(next));
    },
    [onChange],
  );

  const runLookup = useCallback(async () => {
    setLookupError(null);
    setLookupHint(null);

    if (!isValidUkPostcode(postcode)) {
      setLookupError("Enter a valid UK postcode (e.g. SW1A 2AA).");
      return;
    }

    setLoading(true);
    setLookupDone(false);
    setOptions([]);
    setSelectedId("");
    setStructuredMode(false);
    onChange("");

    try {
      const normalized = normalizePostcode(postcode);
      const res = await fetch(`/api/address/lookup?postcode=${encodeURIComponent(normalized)}`);
      const data = (await res.json()) as {
        addresses?: AddressOption[];
        error?: string;
        hint?: string;
        fallback?: string;
        area?: PostcodeArea;
        postcode?: string;
      };

      setLookupDone(true);

      if (data.fallback === "structured" && data.area) {
        setStructuredMode(true);
        setArea(data.area);
        setLookupHint(
          data.error ??
            `Postcode found (${data.area.town}${data.area.county ? `, ${data.area.county}` : ""}). Enter your street address below.`,
        );
        applyStructuredAddress({
          line1,
          line2,
          town: data.area.town,
          county: data.area.county,
          postcode: data.area.postcode,
        });
        return;
      }

      if (!res.ok) {
        setLookupError(data.error ?? "Could not find addresses for this postcode.");
        setStructuredMode(true);
        return;
      }

      setOptions(data.addresses ?? []);
      if ((data.addresses?.length ?? 0) === 0) {
        setLookupError("No addresses found. Enter your address manually below.");
        setStructuredMode(true);
      }
    } catch {
      setLookupError("Lookup failed. Enter your address manually below.");
      setStructuredMode(true);
      setLookupDone(true);
    } finally {
      setLoading(false);
    }
  }, [postcode, line1, line2, onChange, applyStructuredAddress]);

  const onSelectAddress = (id: string) => {
    setSelectedId(id);
    const match = options.find((opt) => opt.id === id);
    if (match) {
      onChange(match.formatted);
      setLookupError(null);
    }
  };

  const onStructuredFieldChange = (field: "line1" | "line2", next: string) => {
    const nextLine1 = field === "line1" ? next : line1;
    const nextLine2 = field === "line2" ? next : line2;
    if (field === "line1") setLine1(next);
    else setLine2(next);
    if (!area) return;
    applyStructuredAddress({
      line1: nextLine1,
      line2: nextLine2,
      town: area.town,
      county: area.county,
      postcode: area.postcode,
    });
  };

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className={labelClass}>{label}</legend>
      <FieldHint>Enter your postcode and click Find address. Pick your address from the list, or enter it below.</FieldHint>

      <div>
        <label className="text-xs font-semibold text-slate-600" htmlFor={`${idPrefix}-postcode`}>
          Postcode
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            id={`${idPrefix}-postcode`}
            className={inputClass}
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase());
              setLookupDone(false);
              setOptions([]);
              setSelectedId("");
              setStructuredMode(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runLookup();
              }
            }}
            placeholder="e.g. EX2 5FP"
            autoComplete="postal-code"
          />
          <button
            type="button"
            onClick={() => void runLookup()}
            disabled={disabled || loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60 sm:mt-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find address
          </button>
        </div>
        {lookupHint ? <p className="mt-2 text-xs text-indigo-700">{lookupHint}</p> : null}
        {lookupError && !error ? <FieldError message={lookupError} /> : null}
      </div>

      {lookupDone && options.length > 0 && !structuredMode ? (
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor={selectId}>
            Select your address
          </label>
          <select
            id={selectId}
            className={inputClass}
            value={selectedId}
            onChange={(e) => onSelectAddress(e.target.value)}
          >
            <option value="">Choose an address…</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {structuredMode ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">Enter your street address</p>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor={`${idPrefix}-line1`}>
              Building name or number and street
            </label>
            <input
              id={`${idPrefix}-line1`}
              className={inputClass}
              value={line1}
              onChange={(e) => onStructuredFieldChange("line1", e.target.value)}
              placeholder="e.g. 10 High Street"
              autoComplete="address-line1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor={`${idPrefix}-line2`}>
              Additional line <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id={`${idPrefix}-line2`}
              className={inputClass}
              value={line2}
              onChange={(e) => onStructuredFieldChange("line2", e.target.value)}
              placeholder="Flat, unit, etc."
              autoComplete="address-line2"
            />
          </div>
          {area ? (
            <p className="text-xs text-slate-600">
              Town: <span className="font-semibold">{area.town || "—"}</span>
              {area.county ? (
                <>
                  {" "}
                  · County: <span className="font-semibold">{area.county}</span>
                </>
              ) : null}
              {" "}
              · Postcode: <span className="font-semibold">{area.postcode}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {value && !structuredMode && selectedId ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Selected address</p>
          <p className="mt-1 whitespace-pre-wrap">{value}</p>
        </div>
      ) : null}

      {value && structuredMode && line1.trim() ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Your address</p>
          <p className="mt-1 whitespace-pre-wrap">{value}</p>
        </div>
      ) : null}

      <FieldError message={error} />
    </fieldset>
  );
}
