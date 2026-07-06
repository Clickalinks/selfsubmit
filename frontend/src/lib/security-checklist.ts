/** Public security feature list — used on /security and dashboard overview. */
export const SECURITY_FEATURES = [
  {
    id: "password-hashing",
    title: "Strong password hashing",
    summary: "Passwords are hashed by Clerk using industry-standard one-way algorithms — never stored in plain text.",
  },
  {
    id: "email-verification",
    title: "Email verification",
    summary: "New accounts must verify their email address before certain features (such as email OTP) can be enabled.",
  },
  {
    id: "password-reset",
    title: "Password reset",
    summary: "Self-service password reset is available on the sign-in page and from your account Security menu.",
  },
  {
    id: "login-limits",
    title: "Login limits",
    summary: "Sign-in API endpoints are rate-limited per IP to reduce brute-force and abuse.",
  },
  {
    id: "lockout",
    title: "Lockout (brute-force protection)",
    summary:
      "After repeated failed sign-in attempts, accounts and IP addresses are temporarily locked (typically 30 minutes). This complements Clerk Attack protection — Clerk does not always show a separate “brute force” toggle.",
  },
  {
    id: "session-expiry",
    title: "Session expiry",
    summary:
      "Idle sessions are signed out automatically after inactivity (default 30 minutes, configurable). Clerk also manages session lifetime.",
  },
  {
    id: "secure-cookies",
    title: "Secure cookies",
    summary:
      "Session cookies use HttpOnly and Secure flags in production. Application cookies (such as active business selection) use HttpOnly, SameSite=Lax, and Secure in production.",
  },
  {
    id: "2fa",
    title: "Two-factor authentication (2FA)",
    summary:
      "Authenticator app (TOTP) and email OTP are enabled. SelfSubmit requires 2FA before using the dashboard and submissions.",
  },
  {
    id: "bot-detection",
    title: "Bot & attack protection",
    summary:
      "Clerk Attack protection (bot detection) is enabled. SelfSubmit also applies its own rate limits and temporary lockouts after failed sign-in attempts.",
  },
  {
    id: "login-history",
    title: "Login history",
    summary: "Recent successful and failed sign-in attempts are logged and visible under Settings → Login protection.",
  },
  {
    id: "device-alerts",
    title: "Device alerts",
    summary:
      "Sign-ins from a new device or network trigger security alerts on your dashboard. Failed-attempt bursts also raise alerts.",
  },
] as const;
