/** Flip to true once live HMRC MTD API filing is enabled in production. */
export const HMRC_LIVE_FILING_ENABLED = false;

/** Sandbox cumulative quarterly updates to HMRC test API (Phase 3). */
export function isHmrcSandboxFilingEnabled(): boolean {
  return process.env.HMRC_SANDBOX_FILING_ENABLED === "true";
}

export const MTD_PLATFORM_FEATURES = [
  {
    label: "Digital record-keeping",
    status: "live" as const,
    detail: "Income, expenses, receipts, and monthly records in your account.",
  },
  {
    label: "Monthly records",
    status: "live" as const,
    detail: "Save and review each period in profession-tailored forms with running totals.",
  },
  {
    label: "HMRC account connection",
    status: "live" as const,
    detail: "Connect your HMRC account, fetch obligations, and link your businesses.",
  },
  {
    label: "Quarterly MTD updates",
    status: "live" as const,
    detail: "Preview and submit cumulative quarterly updates when your HMRC account is connected.",
  },
  {
    label: "Production HMRC filing",
    status: "planned" as const,
    detail: "Live submissions to HMRC production following API recognition.",
  },
  {
    label: "GOV.UK compatible software listing",
    status: "planned" as const,
    detail: "Listed on GOV.UK after HMRC production approval.",
  },
] as const;

/** @deprecated Use MTD_PLATFORM_FEATURES */
export const MTD_FILING_ROADMAP = MTD_PLATFORM_FEATURES;

export function isPracticeHmrcReference(reference: string | null | undefined): boolean {
  if (!reference) return true;
  return reference.startsWith("HMRC-MOCK-");
}

export function isSandboxHmrcReference(reference: string | null | undefined): boolean {
  if (!reference) return false;
  return /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/.test(reference);
}

export type SubmissionFilingDisplay = {
  label: string;
  detail: string | null;
  tone: "live" | "practice" | "neutral";
};

export function getSubmissionFilingDisplay(input: {
  status: string;
  hmrcReference: string | null;
  hmrcStatus: string | null;
}): SubmissionFilingDisplay {
  const practice =
    input.status === "practice_saved" ||
    input.status === "sent_hmrc" ||
    isPracticeHmrcReference(input.hmrcReference);

  const sandbox =
    input.status === "sandbox_submitted" ||
    (input.hmrcReference && isSandboxHmrcReference(input.hmrcReference));

  if (HMRC_LIVE_FILING_ENABLED && input.hmrcReference && !isPracticeHmrcReference(input.hmrcReference) && !sandbox) {
    return {
      label: "Filed to HMRC",
      detail: input.hmrcReference,
      tone: "live",
    };
  }

  if (sandbox && input.hmrcReference) {
    return {
      label: "Sandbox submitted to HMRC",
      detail: input.hmrcReference,
      tone: "neutral",
    };
  }

  if (practice && input.hmrcReference) {
    return {
      label: "Monthly record saved",
      detail: "Stored in your submission history",
      tone: "practice",
    };
  }

  if (practice) {
    return {
      label: "Monthly record saved",
      detail: null,
      tone: "practice",
    };
  }

  return {
    label: input.status.replace(/_/g, " "),
    detail: input.hmrcReference,
    tone: "neutral",
  };
}
