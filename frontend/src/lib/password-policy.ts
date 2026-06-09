export const PASSWORD_MIN_LENGTH = 12;

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function getPasswordRuleResults(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));
}

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function getPasswordPolicyError(password: string): string | null {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (!failed) return null;
  return `Password does not meet requirements: ${failed.label.toLowerCase()}.`;
}
