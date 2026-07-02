/** Default idle timeout before auto sign-out (minutes). */
export const DEFAULT_SESSION_INACTIVITY_MINUTES = 30;

/** Show a warning this many minutes before sign-out. */
export const DEFAULT_SESSION_WARN_MINUTES = 2;

const MIN_INACTIVITY_MINUTES = 5;
const MAX_INACTIVITY_MINUTES = 480;

export function sessionInactivityMs(): number {
  const raw = process.env.NEXT_PUBLIC_SESSION_INACTIVITY_MINUTES?.trim();
  const minutes = raw ? Number(raw) : DEFAULT_SESSION_INACTIVITY_MINUTES;
  if (!Number.isFinite(minutes) || minutes < MIN_INACTIVITY_MINUTES || minutes > MAX_INACTIVITY_MINUTES) {
    return DEFAULT_SESSION_INACTIVITY_MINUTES * 60_000;
  }
  return minutes * 60_000;
}

export function sessionWarnMs(idleMs: number): number {
  const raw = process.env.NEXT_PUBLIC_SESSION_WARN_MINUTES?.trim();
  const minutes = raw ? Number(raw) : DEFAULT_SESSION_WARN_MINUTES;
  if (!Number.isFinite(minutes) || minutes < 1) {
    return Math.min(DEFAULT_SESSION_WARN_MINUTES * 60_000, idleMs / 2);
  }
  return Math.min(minutes * 60_000, idleMs - 60_000);
}
