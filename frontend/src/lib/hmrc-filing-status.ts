/** Flip to true once live HMRC MTD API filing is enabled in production. */
export const HMRC_LIVE_FILING_ENABLED = false;

/** Sandbox cumulative quarterly updates to HMRC test API (Phase 3). */
export function isHmrcSandboxFilingEnabled(): boolean {
  return process.env.HMRC_SANDBOX_FILING_ENABLED === "true";
}

export const MTD_FILING_ROADMAP = [
  {
    label: "Digital record-keeping",
    status: "live" as const,
    detail: "Income, expenses, receipts, and monthly records in your account.",
  },
  {
    label: "Practice submissions",
    status: "live" as const,
    detail: "Save and review returns in SelfSubmit — not sent to HMRC yet.",
  },
  {
    label: "HMRC account connection",
    status: "live" as const,
    detail: "Connect sandbox test users on HMRC connect, fetch obligations, and link HMRC businesses.",
  },
  {
    label: "Sandbox quarterly MTD updates",
    status: "in_development" as const,
    detail: "Preview and submit cumulative quarterly updates to HMRC sandbox from your dashboard.",
  },
  {
    label: "Live quarterly MTD updates",
    status: "planned" as const,
    detail: "Submit quarterly updates to HMRC after API approval.",
  },
  {
    label: "GOV.UK compatible software listing",
    status: "planned" as const,
    detail: "After HMRC production credentials and recognition process.",
  },
] as const;

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
      label: "Practice record",
      detail: "Saved in SelfSubmit — not sent to HMRC",
      tone: "practice",
    };
  }

  if (practice) {
    return {
      label: "Practice record",
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
