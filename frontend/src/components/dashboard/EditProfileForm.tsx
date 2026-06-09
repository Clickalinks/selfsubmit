"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { ProfessionSelect } from "@/components/forms/ProfessionSelect";
import { UkAddressLookup } from "@/components/forms/UkAddressLookup";
import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import {
  hasErrors,
  validateProfileFields,
  type FieldErrors,
  type ProfileInput,
} from "@/lib/profile-validation";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";
const labelClass = "block text-sm font-semibold text-slate-800";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function EditProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessSameAsHome, setBusinessSameAsHome] = useState(false);
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [primaryProfession, setPrimaryProfession] = useState<string>(SELF_EMPLOYED_PROFESSIONS[0]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profile");
        const data = (await res.json()) as {
          profile?: {
            firstName: string;
            lastName: string;
            homeAddress: string;
            email: string;
            phone: string;
            businessAddress: string;
            businessName: string | null;
            businessSameAsHome: boolean;
            primaryProfession: string | null;
          };
        };
        if (res.ok && data.profile) {
          const p = data.profile;
          setFirstName(p.firstName);
          setLastName(p.lastName);
          setHomeAddress(p.homeAddress);
          setEmail(p.email);
          setPhone(p.phone);
          setBusinessAddress(p.businessAddress);
          setBusinessName(p.businessName ?? "");
          setBusinessSameAsHome(p.businessSameAsHome);
          if (p.primaryProfession) setPrimaryProfession(p.primaryProfession);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profileInput: ProfileInput = useMemo(
    () => ({
      firstName,
      lastName,
      homeAddress,
      email,
      phone,
      businessAddress: businessSameAsHome ? homeAddress : businessAddress,
      businessName: businessName || null,
      businessSameAsHome,
      primaryProfession,
    }),
    [firstName, lastName, homeAddress, email, phone, businessAddress, businessName, businessSameAsHome, primaryProfession],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors = validateProfileFields(profileInput);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileInput),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Could not save changes.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setFormError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Profile updated successfully.
        </p>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Personal details</h3>
        <div className="grid gap-4 min-[520px]:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ep-firstName">
              First name
            </label>
            <input id="ep-firstName" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <FieldError message={fieldErrors.firstName} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ep-lastName">
              Second name
            </label>
            <input id="ep-lastName" className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <FieldError message={fieldErrors.lastName} />
          </div>
        </div>
        <UkAddressLookup
          idPrefix="ep-home"
          label="Home address"
          value={homeAddress}
          onChange={(address) => {
            setHomeAddress(address);
            if (businessSameAsHome) setBusinessAddress(address);
          }}
          error={fieldErrors.homeAddress}
        />
        <div>
          <label className={labelClass} htmlFor="ep-email">
            Email
          </label>
          <input id="ep-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError message={fieldErrors.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ep-phone">
            Phone
          </label>
          <input id="ep-phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <FieldError message={fieldErrors.phone} />
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-900">Business details</h3>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green"
            checked={businessSameAsHome}
            onChange={(e) => {
              const checked = e.target.checked;
              setBusinessSameAsHome(checked);
              if (checked) {
                setBusinessAddress(homeAddress);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.businessAddress;
                  return next;
                });
              }
            }}
          />
          <span className="text-sm font-medium text-slate-700">Business address same as home</span>
        </label>
        {!businessSameAsHome ? (
          <UkAddressLookup
            idPrefix="ep-business"
            label="Business address"
            value={businessAddress}
            onChange={setBusinessAddress}
            error={fieldErrors.businessAddress}
          />
        ) : null}
        <ProfessionSelect
          value={primaryProfession}
          onChange={setPrimaryProfession}
          error={fieldErrors.primaryProfession}
        />
        <div>
          <label className={labelClass} htmlFor="ep-businessName">
            Business name
          </label>
          <input id="ep-businessName" className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
      </div>

      {formError ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-green-dark disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
