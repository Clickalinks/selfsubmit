/** Failed attempts per identifier (email) before temporary lockout. */
export const MAX_FAILED_ATTEMPTS_PER_ACCOUNT = 5;

/** Failed attempts per IP across any accounts before IP lockout. */
export const MAX_FAILED_ATTEMPTS_PER_IP = 25;

/** Rolling window for counting failed attempts. */
export const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** How long account / IP stays locked after threshold exceeded. */
export const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

/** Max check/failure API calls per IP per window (abuse of our endpoints). */
export const RATE_LIMIT_MAX_REQUESTS_PER_IP = 60;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Login failure reports must follow a recent pre-check for the same email + IP. */
export const LOGIN_PRECHECK_MAX_AGE_MS = 10 * 60 * 1000;

/** Failures in this window trigger a suspicious-activity flag. */
export const SUSPICIOUS_FAILURE_THRESHOLD = 3;

export const SUSPICIOUS_FAILURE_WINDOW_MS = 5 * 60 * 1000;
