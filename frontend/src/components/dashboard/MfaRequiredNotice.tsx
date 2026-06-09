"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Shield } from "lucide-react";

export function MfaRequiredNotice() {
  const params = useSearchParams();
  const required = params.get("mfa") === "required";
  const returnUrl = params.get("return_url") ?? "/dashboard";

  if (!required) return null;

  return (
    <div
      className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4 sm:px-6"
      role="alert"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div>
          <p className="font-bold text-amber-950">Two-step verification required</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-900">
            For your security, SelfSubmit requires two-step verification before you can use the dashboard or submit to
            HMRC. Set it up below using an authenticator app — then{" "}
            <Link href={returnUrl} className="font-semibold underline underline-offset-2">
              continue to your account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function MfaMandatoryBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
      <Shield className="h-3 w-3" aria-hidden />
      Required
    </span>
  );
}
