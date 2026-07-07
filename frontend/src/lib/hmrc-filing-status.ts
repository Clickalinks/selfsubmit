/** Flip to true once live HMRC MTD API filing is enabled in production. */
export const HMRC_LIVE_FILING_ENABLED = false;

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
    status: "in_development" as const,
    detail: "Connect sandbox test users in Settings and fetch obligations — live filing still planned.",
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

  if (HMRC_LIVE_FILING_ENABLED && input.hmrcReference && !isPracticeHmrcReference(input.hmrcReference)) {
    return {
      label: "Filed to HMRC",
      detail: input.hmrcReference,
      tone: "live",
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
