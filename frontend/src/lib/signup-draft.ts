import type { ProfileInput } from "@/lib/profile-validation";

const DRAFT_KEY = "selfsubmit_signup_draft_v1";
const DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type SignupDraft = ProfileInput & {
  termsAccepted: true;
  redirectUrl: string | null;
  savedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveSignupDraft(
  input: ProfileInput,
  redirectUrl: string | null = null,
): void {
  if (!isBrowser()) return;
  const draft: SignupDraft = {
    ...input,
    termsAccepted: true,
    redirectUrl,
    savedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private mode / quota — ignore.
  }
}

export function loadSignupDraft(): SignupDraft | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SignupDraft>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.savedAt !== "number" || Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) {
      clearSignupDraft();
      return null;
    }
    if (
      typeof parsed.firstName !== "string" ||
      typeof parsed.lastName !== "string" ||
      typeof parsed.homeAddress !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.phone !== "string" ||
      typeof parsed.businessAddress !== "string"
    ) {
      return null;
    }
    return {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      homeAddress: parsed.homeAddress,
      email: parsed.email,
      phone: parsed.phone,
      businessAddress: parsed.businessAddress,
      businessName: typeof parsed.businessName === "string" ? parsed.businessName : null,
      businessSameAsHome: Boolean(parsed.businessSameAsHome),
      primaryProfession: typeof parsed.primaryProfession === "string" ? parsed.primaryProfession : "",
      termsAccepted: true,
      redirectUrl: typeof parsed.redirectUrl === "string" ? parsed.redirectUrl : null,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function clearSignupDraft(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function draftToProfilePayload(draft: SignupDraft) {
  return {
    firstName: draft.firstName,
    lastName: draft.lastName,
    homeAddress: draft.homeAddress,
    email: draft.email,
    phone: draft.phone,
    businessAddress: draft.businessAddress,
    businessName: draft.businessName,
    businessSameAsHome: draft.businessSameAsHome,
    primaryProfession: draft.primaryProfession,
    termsAccepted: true as const,
  };
}
