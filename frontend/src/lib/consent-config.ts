/** Published policy / consent document versions — bump when legal text changes materially. */
export const CONSENT_POLICY_VERSION = "2026-07-06";

export const CONSENT_TYPES = {
  COOKIE_ESSENTIAL: "cookie_essential",
  TERMS_SIGNUP: "terms_signup",
  PRIVACY_SIGNUP: "privacy_signup",
} as const;

export type ConsentType = (typeof CONSENT_TYPES)[keyof typeof CONSENT_TYPES];

export const COOKIE_CONSENT_STORAGE_KEY = "ss_cookie_consent";

export type StoredCookieConsent = {
  version: string;
  granted: boolean;
  recordedAt: string;
};
