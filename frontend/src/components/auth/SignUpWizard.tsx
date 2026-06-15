"use client";

import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { ProfessionSelect } from "@/components/forms/ProfessionSelect";
import { UkAddressLookup } from "@/components/forms/UkAddressLookup";
import { SELF_EMPLOYED_PROFESSIONS } from "@/data/selfEmployedProfessions";
import {
  hasErrors,
  validatePassword,
  validateProfileFields,
  type FieldErrors,
  type ProfileInput,
} from "@/lib/profile-validation";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";
const labelClass = "block text-sm font-semibold text-slate-800";
const sectionClass = "space-y-4 scroll-mt-24";
const sectionTitleClass = "text-lg font-bold text-slate-900";
const sectionDividerClass = "border-t border-slate-100 pt-8";

const FIELD_SECTION: Partial<Record<keyof FieldErrors, string>> = {
  firstName: "section-personal",
  lastName: "section-personal",
  homeAddress: "section-personal",
  email: "section-personal",
  phone: "section-personal",
  businessAddress: "section-business",
  primaryProfession: "section-business",
  password: "section-account",
  confirmPassword: "section-account",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

function scrollToFirstError(errors: FieldErrors) {
  const firstKey = (Object.keys(errors) as (keyof FieldErrors)[]).find((k) => errors[k]);
  if (!firstKey) return;
  const sectionId = FIELD_SECTION[firstKey];
  if (!sectionId) return;
  requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const input = document.getElementById(firstKey);
    if (input instanceof HTMLElement) {
      input.focus({ preventScroll: true });
    }
  });
}

function needsEmailVerification(signUp: { status: string | null; unverifiedFields: string[] }) {
  return (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address")
  );
}

function finishSignUpNavigation(path: "/dashboard" | "/onboarding") {
  window.location.assign(path);
}

function formatSignUpError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const clerkErr = err as { errors?: Array<{ long_message?: string; message?: string }> };
    const first = clerkErr.errors?.[0];
    if (first?.long_message) return first.long_message;
    if (first?.message) return first.message;
  }

  if (err instanceof Error) {
    if (err.message.includes("<!DOCTYPE") || err.message.includes("is not valid JSON")) {
      return "Sign-up could not reach Clerk (stale auth configuration). Hard-refresh this page (Ctrl+Shift+R), then try again.";
    }
    return err.message;
  }

  return "Sign-up failed. Please try again.";
}

export function SignUpWizard() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

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
  const [primaryProfession, setPrimaryProfession] = useState<string>(SELF_EMPLOYED_PROFESSIONS[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [resolvingSession, setResolvingSession] = useState(false);

  const fieldsDisabled = pendingVerification || resolvingSession;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    setResolvingSession(true);

    void (async () => {
      try {
        const res = await fetch("/api/profile");
        if (cancelled) return;
        finishSignUpNavigation(res.ok ? "/dashboard" : "/onboarding");
      } catch {
        if (!cancelled) finishSignUpNavigation("/onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

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
    [
      firstName,
      lastName,
      homeAddress,
      email,
      phone,
      businessAddress,
      businessName,
      businessSameAsHome,
      primaryProfession,
    ],
  );

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
    if (businessSameAsHome) {
      setBusinessAddress(address);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.businessAddress;
        return next;
      });
    }
  };

  const saveProfileAndFinish = useCallback(
    async (sessionId: string) => {
      await clerk.setActive({ session: sessionId });

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileInput),
      });
      await res.json().catch(() => ({}));

      if (res.status === 409) {
        finishSignUpNavigation("/dashboard");
        return;
      }

      if (!res.ok) {
        finishSignUpNavigation("/onboarding");
        return;
      }

      setSuccess(true);
      finishSignUpNavigation("/dashboard");
    },
    [clerk, profileInput],
  );

  const submit = async () => {
    if (!isLoaded || !clerk.loaded) return;
    const signUp = clerk.client?.signUp;
    if (!signUp) {
      setFormError("Authentication is still loading. Please try again.");
      return;
    }

    setFormError(null);
    setVerificationMessage(null);

    if (!pendingVerification) {
      const profileErrors = validateProfileFields(profileInput);
      const passwordErrors = validatePassword(password, confirmPassword);
      const merged = { ...profileErrors, ...passwordErrors };
      setFieldErrors(merged);
      if (hasErrors(merged)) {
        scrollToFirstError(merged);
        return;
      }
    }

    setLoading(true);
    try {
      if (!pendingVerification) {
        await signUp.create({
          emailAddress: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        if (signUp.status === "complete" && signUp.createdSessionId) {
          await saveProfileAndFinish(signUp.createdSessionId);
          return;
        }

        if (needsEmailVerification(signUp)) {
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setPendingVerification(true);
          setVerificationMessage(
            `We sent a verification code to ${email.trim()}. Enter it below to finish creating your account.`,
          );
          requestAnimationFrame(() => {
            document.getElementById("section-verify")?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }

        if (signUp.status === "missing_requirements") {
          setFormError(
            "Additional verification is required. Complete the security check below, then try again.",
          );
          document.getElementById("clerk-captcha")?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        setFormError("Could not complete sign-up. Please try again.");
        return;
      }

      const code = verificationCode.trim();
      if (!code) {
        setFormError("Enter the verification code from your email.");
        document.getElementById("verificationCode")?.focus();
        return;
      }

      await signUp.attemptEmailAddressVerification({ code });

      if (signUp.status === "complete" && signUp.createdSessionId) {
        await saveProfileAndFinish(signUp.createdSessionId);
        return;
      }

      if (needsEmailVerification(signUp)) {
        setFormError("That code did not work. Check your email and try again, or resend a new code.");
        return;
      }

      if (signUp.status === "missing_requirements") {
        setFormError(
          "Additional verification is required. Complete the security check below, then submit again.",
        );
        document.getElementById("clerk-captcha")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      setFormError("Could not complete sign-up. Please try again.");
    } catch (err) {
      setFormError(formatSignUpError(err));
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    const signUp = clerk.client?.signUp;
    if (!signUp) return;
    setFormError(null);
    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationMessage("A new code has been sent to your email.");
    } catch (err) {
      setFormError(formatSignUpError(err));
    } finally {
      setLoading(false);
    }
  };

  if (resolvingSession) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-green" />
        <p className="mt-4 text-sm font-medium text-slate-600">Taking you to your account…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center shadow-sm">
        <Check className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={2} />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Account created</h2>
        <p className="mt-2 text-sm text-slate-600">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto w-full max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <section id="section-personal" className={sectionClass}>
            <h2 className={sectionTitleClass}>Personal details</h2>
            <div className="grid gap-4 min-[520px]:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  disabled={fieldsDisabled}
                />
                <FieldError message={fieldErrors.firstName} />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Second name
                </label>
                <input
                  id="lastName"
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  disabled={fieldsDisabled}
                />
                <FieldError message={fieldErrors.lastName} />
              </div>
            </div>
            <UkAddressLookup
              idPrefix="home"
              label="Home address"
              value={homeAddress}
              onChange={onHomeAddressChange}
              error={fieldErrors.homeAddress}
              disabled={fieldsDisabled}
            />
            <div>
              <label className={labelClass} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={fieldsDisabled}
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                disabled={fieldsDisabled}
              />
              <FieldError message={fieldErrors.phone} />
            </div>
          </section>

          <section id="section-business" className={`${sectionClass} ${sectionDividerClass}`}>
            <h2 className={sectionTitleClass}>Business information</h2>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-brand-green/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                checked={businessSameAsHome}
                onChange={(e) => onSameAddressChange(e.target.checked)}
                disabled={fieldsDisabled}
              />
              <span className="text-sm font-medium text-slate-700">
                Business address is the same as home address
              </span>
            </label>
            {!businessSameAsHome ? (
              <UkAddressLookup
                idPrefix="business"
                label="Business address"
                value={businessAddress}
                onChange={setBusinessAddress}
                error={fieldErrors.businessAddress}
                disabled={fieldsDisabled}
              />
            ) : (
              <p className="rounded-xl bg-brand-mint px-4 py-3 text-sm text-brand-forest">
                Your home address will be used as your business address.
              </p>
            )}
            <ProfessionSelect
              value={primaryProfession}
              onChange={setPrimaryProfession}
              disabled={fieldsDisabled}
              error={fieldErrors.primaryProfession}
            />
            <div>
              <label className={labelClass} htmlFor="businessName">
                Business name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="businessName"
                className={inputClass}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={fieldsDisabled}
              />
            </div>
          </section>

          <section id="section-account" className={`${sectionClass} ${sectionDividerClass}`}>
            <h2 className={sectionTitleClass}>Create your account</h2>
            <p className="text-sm text-slate-500">
              Choose a strong password for {email || "your email"} (minimum 12 characters).
            </p>
            <div>
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={fieldsDisabled}
              />
              <FieldError message={fieldErrors.password} />
              {!fieldsDisabled ? <PasswordRequirements password={password} className="mt-3" /> : null}
            </div>
            <div>
              <label className={labelClass} htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={fieldsDisabled}
              />
              <FieldError message={fieldErrors.confirmPassword} />
            </div>
          </section>

          {pendingVerification ? (
            <section id="section-verify" className={`${sectionClass} ${sectionDividerClass}`}>
              <h2 className={sectionTitleClass}>Verify your email</h2>
              <p className="text-sm text-slate-500">
                Enter the code we sent to <span className="font-medium text-slate-700">{email}</span>.
              </p>
              <div>
                <label className={labelClass} htmlFor="verificationCode">
                  Verification code
                </label>
                <input
                  id="verificationCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={inputClass}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <button
                type="button"
                onClick={() => void resendVerificationCode()}
                disabled={loading}
                className="text-sm font-semibold text-brand-green hover:text-brand-green-dark disabled:opacity-50"
              >
                Resend code
              </button>
            </section>
          ) : null}
        </div>

        {verificationMessage ? (
          <p className="mt-6 rounded-xl border border-brand-green/20 bg-brand-mint px-4 py-3 text-sm text-brand-forest">
            {verificationMessage}
          </p>
        ) : null}

        {formError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
        ) : null}

        <div
          id="clerk-captcha"
          className="mt-6 flex min-h-[4.5rem] justify-center"
          data-cl-theme="light"
          data-cl-size="flexible"
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in instead
          </Link>
          <button
            type="submit"
            disabled={loading || !isLoaded || !clerk.loaded}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-green/30 transition hover:bg-brand-green-dark disabled:opacity-60 sm:min-w-[11rem]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading
              ? pendingVerification
                ? "Verifying…"
                : "Creating account…"
              : pendingVerification
                ? "Verify and finish"
                : "Create account"}
          </button>
        </div>
      </div>
    </form>
  );
}
