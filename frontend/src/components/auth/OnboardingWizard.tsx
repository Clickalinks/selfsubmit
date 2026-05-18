"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { UkAddressLookup } from "@/components/forms/UkAddressLookup";
import {
  hasErrors,
  validateProfileFields,
  type FieldErrors,
  type ProfileInput,
} from "@/lib/profile-validation";

const STEPS = ["Your details", "Business"] as const;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const labelClass = "block text-sm font-semibold text-slate-800";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

/** Profile-only onboarding for Google/OAuth users or anyone who signed in without our sign-up wizard. */
export function OnboardingWizard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessSameAsHome, setBusinessSameAsHome] = useState(false);
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.firstName) setFirstName(user.firstName);
    if (user.lastName) setLastName(user.lastName);
    const primaryEmail = user.primaryEmailAddress?.emailAddress;
    if (primaryEmail) setEmail(primaryEmail);
  }, [user]);

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
    }),
    [firstName, lastName, homeAddress, email, phone, businessAddress, businessName, businessSameAsHome],
  );

  const goNext = useCallback(() => {
    setFormError(null);
    const errors = validateProfileFields({
      ...profileInput,
      businessAddress: businessSameAsHome ? homeAddress : businessAddress,
    });
    const stepErrors: FieldErrors = {};
    (["firstName", "lastName", "homeAddress", "email", "phone"] as const).forEach((k) => {
      if (errors[k]) stepErrors[k] = errors[k];
    });
    setFieldErrors(stepErrors);
    if (hasErrors(stepErrors)) return;
    setStep(1);
  }, [profileInput, businessSameAsHome, homeAddress, businessAddress]);

  const onSameAddressChange = (checked: boolean) => {
    setBusinessSameAsHome(checked);
    if (checked) {
      setBusinessAddress(homeAddress);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.businessAddress;
        return next;
      });
    }
  };

  const onHomeAddressChange = (address: string) => {
    setHomeAddress(address);
    if (businessSameAsHome) setBusinessAddress(address);
  };

  const submit = async () => {
    setFormError(null);
    const errors = validateProfileFields(profileInput);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileInput),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Could not save your profile.");
        return;
      }
      setSuccess(true);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <p className="text-center text-sm text-slate-500">Loading…</p>;
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center shadow-sm">
        <Check className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={2} />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Profile saved</h2>
        <p className="mt-2 text-sm text-slate-600">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950">
        You&apos;re signed in{user?.externalAccounts.length ? " with Google or another provider" : ""}. Complete your
        SelfSubmit details below to open the dashboard.
      </p>

      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`} />
            <p className={`text-center text-xs font-medium ${i === step ? "text-indigo-600" : "text-slate-400"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 min-[900px]:p-8">
        {step === 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
            <div className="grid gap-4 min-[520px]:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="ob-firstName">
                  First name
                </label>
                <input
                  id="ob-firstName"
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
                <FieldError message={fieldErrors.firstName} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ob-lastName">
                  Second name
                </label>
                <input
                  id="ob-lastName"
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
                <FieldError message={fieldErrors.lastName} />
              </div>
            </div>
            <UkAddressLookup
              idPrefix="ob-home"
              label="Home address"
              value={homeAddress}
              onChange={onHomeAddressChange}
              error={fieldErrors.homeAddress}
            />
            <div>
              <label className={labelClass} htmlFor="ob-email">
                Email address
              </label>
              <input
                id="ob-email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(user?.primaryEmailAddress)}
                autoComplete="email"
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ob-phone">
                Phone number
              </label>
              <input
                id="ob-phone"
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
              <FieldError message={fieldErrors.phone} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Business information</h2>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-indigo-200">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={businessSameAsHome}
                onChange={(e) => onSameAddressChange(e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-700">
                Business address is the same as home address
              </span>
            </label>
            {!businessSameAsHome ? (
              <UkAddressLookup
                idPrefix="ob-business"
                label="Business address"
                value={businessAddress}
                onChange={setBusinessAddress}
                error={fieldErrors.businessAddress}
              />
            ) : (
              <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                Your home address will be used as your business address.
              </p>
            )}
            <div>
              <label className={labelClass} htmlFor="ob-businessName">
                Business name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="ob-businessName"
                className={inputClass}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>
        )}

        {formError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 min-[480px]:flex-row min-[480px]:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setFieldErrors({});
                setStep(0);
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <span />
          )}
          {step === 0 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving…" : "Save and open dashboard"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
