"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { Check, Copy, KeyRound, Loader2, Mail, Shield, Smartphone } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MfaMandatoryBadge } from "@/components/dashboard/MfaRequiredNotice";

type EmailAddressWithMfa = {
  emailAddress?: string;
  reservedForSecondFactor?: boolean;
  verification?: { status?: string };
  setReservedForSecondFactor?: (params: { reserved: boolean }) => Promise<unknown>;
};

type TotpResource = {
  uri?: string;
  secret?: string;
};

type BackupCodeResource = {
  codes?: string[];
};

type UserWithBackup = {
  backupCodeEnabled?: boolean;
  createBackupCode?: () => Promise<BackupCodeResource>;
};

type TotpStep = "idle" | "qr" | "verify";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
      }`}
    >
      {enabled ? <Check className="h-3 w-3" /> : null}
      {enabled ? "Enabled" : "Off"}
    </span>
  );
}

export function MfaSettingsSection() {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [totpStep, setTotpStep] = useState<TotpStep>("idle");
  const [totp, setTotp] = useState<TotpResource | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [freshBackupCodes, setFreshBackupCodes] = useState<string[] | null>(null);

  const backupUser = user as (typeof user & UserWithBackup) | null | undefined;
  const backupCodesSupported = typeof backupUser?.createBackupCode === "function";
  const backupCodesEnabled = Boolean(backupUser?.backupCodeEnabled);

  const createTOTP = useReverification(() => user?.createTOTP());
  const disableTOTP = useReverification(() => user?.disableTOTP());

  const setEmailMfaReserved = useReverification(async (reserved: boolean) => {
    const email = user?.primaryEmailAddress as EmailAddressWithMfa | null | undefined;
    if (!email) throw new Error("Add a verified email to your account first.");
    if (typeof email.setReservedForSecondFactor !== "function") {
      throw new Error(
        "Email OTP is not available. In the Clerk Dashboard, open User & authentication → Multi-factor and enable Email verification code.",
      );
    }
    await email.setReservedForSecondFactor({ reserved });
    await user?.reload();
  });

  const primaryEmail = user?.primaryEmailAddress as EmailAddressWithMfa | null | undefined;
  const emailVerified = primaryEmail?.verification?.status === "verified";
  const emailMfaEnabled = Boolean(primaryEmail?.reservedForSecondFactor);
  const emailOtpSupported = typeof primaryEmail?.setReservedForSecondFactor === "function";
  const totpEnabled = Boolean(user?.totpEnabled);
  const mfaActive = Boolean(user?.twoFactorEnabled);

  const runAction = useCallback(async (key: string, action: () => Promise<void>) => {
    setError(null);
    setMessage(null);
    setBusy(key);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }, []);

  const startTotpSetup = () =>
    runAction("totp-setup", async () => {
      const resource = await createTOTP();
      if (!resource) throw new Error("Could not start authenticator setup.");
      setTotp(resource as TotpResource);
      setTotpStep("qr");
      setTotpCode("");
    });

  const verifyTotp = () =>
    runAction("totp-verify", async () => {
      const code = totpCode.trim();
      if (!code) throw new Error("Enter the code from your authenticator app.");
      await user?.verifyTOTP({ code });
      await user?.reload();
      setTotp(null);
      setTotpStep("idle");
      setTotpCode("");
      setMessage("Authenticator app enabled. You will be asked for a code when signing in.");
    });

  const removeTotp = () =>
    runAction("totp-disable", async () => {
      await disableTOTP();
      await user?.reload();
      setTotp(null);
      setTotpStep("idle");
      setMessage("Authenticator app removed.");
    });

  const enableEmailOtp = () =>
    runAction("email-enable", async () => {
      await setEmailMfaReserved(true);
      setMessage("Email OTP enabled. A code will be emailed when you sign in.");
    });

  const disableEmailOtp = () =>
    runAction("email-disable", async () => {
      await setEmailMfaReserved(false);
      setMessage("Email OTP disabled.");
    });

  const generateBackupCodes = () =>
    runAction("backup-codes", async () => {
      if (!backupUser?.createBackupCode) {
        throw new Error(
          "Backup codes are not enabled for this environment. Enable Backup codes under Clerk Dashboard → Multi-factor.",
        );
      }
      const resource = await backupUser.createBackupCode();
      const codes = resource.codes ?? [];
      if (codes.length === 0) throw new Error("No backup codes were returned.");
      setFreshBackupCodes(codes);
      await user?.reload();
      setMessage("Save these backup codes in a safe place — they will not be shown again.");
    });

  const copyBackupCodes = async () => {
    if (!freshBackupCodes?.length) return;
    try {
      await navigator.clipboard.writeText(freshBackupCodes.join("\n"));
      setMessage("Backup codes copied to clipboard.");
    } catch {
      setError("Could not copy to clipboard. Please copy the codes manually.");
    }
  };

  if (!isLoaded) {
    return (
      <DashboardCard title="Multi-factor authentication" description="Loading security settings…">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </DashboardCard>
    );
  }

  const qrUrl = totp?.uri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totp.uri)}`
    : null;

  return (
    <DashboardCard
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          Two-step verification
          <MfaMandatoryBadge />
        </span>
      }
      description="SelfSubmit requires two-step verification before you can use the dashboard or submit returns. Set up an authenticator app below."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <Shield className="h-4 w-4 shrink-0 text-amber-700" />
        <span>
          {mfaActive
            ? "You are set up. You can now use the dashboard and submit to HMRC."
            : "Choose at least one method — this is required for all SelfSubmit accounts."}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <Shield className="h-4 w-4 text-brand-green" />
        <span className="font-medium text-slate-800">Account protection:</span>
        <StatusBadge enabled={mfaActive} />
        {mfaActive ? (
          <span className="text-slate-500">MFA is active on your account.</span>
        ) : (
          <span className="text-slate-500">Enable a method below to turn on MFA.</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-mint">
                <Smartphone className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authenticator app</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Use Google Authenticator, Microsoft Authenticator, 1Password, or similar apps.
                </p>
              </div>
            </div>
            <StatusBadge enabled={totpEnabled} />
          </div>

          {totpEnabled && totpStep === "idle" ? (
            <div className="mt-4">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void removeTotp()}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                {busy === "totp-disable" ? "Removing…" : "Remove authenticator"}
              </button>
            </div>
          ) : null}

          {!totpEnabled && totpStep === "idle" ? (
            <div className="mt-4">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void startTotpSetup()}
                className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50"
              >
                {busy === "totp-setup" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing…
                  </span>
                ) : (
                  "Set up authenticator app"
                )}
              </button>
            </div>
          ) : null}

          {totpStep === "qr" && totp ? (
            <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Scan this QR code with your authenticator app, or enter the secret manually.
              </p>
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="Authenticator QR code"
                  className="mx-auto h-[200px] w-[200px] rounded-lg border border-slate-200 bg-white p-2"
                />
              ) : null}
              {totp.secret ? (
                <p className="break-all rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                  {totp.secret}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setTotpStep("verify")}
                className="text-sm font-semibold text-brand-green hover:text-brand-green-dark"
              >
                I have scanned the code →
              </button>
            </div>
          ) : null}

          {totpStep === "verify" ? (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void verifyTotp();
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-slate-800" htmlFor="totp-verify-code">
                  Verification code
                </label>
                <input
                  id="totp-verify-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={inputClass}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50"
                >
                  {busy === "totp-verify" ? "Verifying…" : "Verify and enable"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTotpStep("idle");
                    setTotp(null);
                    setTotpCode("");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {emailOtpSupported || emailMfaEnabled ? (
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-mint">
                <Mail className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email OTP</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Receive a one-time code at{" "}
                  <span className="font-medium text-slate-700">
                    {primaryEmail?.emailAddress ?? "your email"}
                  </span>{" "}
                  when signing in.
                </p>
              </div>
            </div>
            <StatusBadge enabled={emailMfaEnabled} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!emailMfaEnabled ? (
              <button
                type="button"
                disabled={!emailVerified || busy !== null}
                onClick={() => void enableEmailOtp()}
                className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50"
              >
                {busy === "email-enable" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enabling…
                  </span>
                ) : (
                  "Enable email OTP"
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void disableEmailOtp()}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === "email-disable" ? "Disabling…" : "Disable email OTP"}
              </button>
            )}
          </div>
          {!emailVerified ? (
            <p className="mt-2 text-xs text-amber-700">Verify your email address before enabling email OTP.</p>
          ) : null}
        </div>
        ) : null}

        {backupCodesSupported || backupCodesEnabled ? (
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-mint">
                  <KeyRound className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Backup codes</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    One-time codes you can use if you lose access to your authenticator or email OTP. Store them offline.
                  </p>
                </div>
              </div>
              <StatusBadge enabled={backupCodesEnabled} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!mfaActive || busy !== null}
                onClick={() => void generateBackupCodes()}
                className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50"
                title={!mfaActive ? "Enable 2FA before generating backup codes" : undefined}
              >
                {busy === "backup-codes" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </span>
                ) : backupCodesEnabled ? (
                  "Generate new backup codes"
                ) : (
                  "Generate backup codes"
                )}
              </button>
            </div>

            {!mfaActive ? (
              <p className="mt-2 text-xs text-amber-700">Enable two-step verification above before generating backup codes.</p>
            ) : null}

            {freshBackupCodes?.length ? (
              <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="text-sm font-semibold text-amber-950">Save these codes now — they will not be shown again</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {freshBackupCodes.map((code) => (
                    <li
                      key={code}
                      className="rounded-lg border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-slate-800"
                    >
                      {code}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => void copyBackupCodes()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green-dark"
                >
                  <Copy className="h-4 w-4" />
                  Copy all codes
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 rounded-xl border border-brand-green/20 bg-brand-mint px-4 py-3 text-sm text-brand-forest">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <p className="mt-4 text-xs text-slate-500">
        Recovery if you lose your authenticator: use <strong>email OTP</strong> (if enabled on your account) or{" "}
        <strong>password reset</strong> on the sign-in page. Backup codes are optional in Clerk and are not enabled on
        this application.
      </p>
    </DashboardCard>
  );
}
