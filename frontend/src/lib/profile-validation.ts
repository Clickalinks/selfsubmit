import { isKnownProfession } from "@/data/expenseCategories";
import { getPasswordPolicyError } from "@/lib/password-policy";
import { isPlausibleUkAddress } from "@/lib/uk-address";

export type ProfileInput = {
  firstName: string;
  lastName: string;
  homeAddress: string;
  email: string;
  phone: string;
  businessAddress: string;
  businessName?: string | null;
  businessSameAsHome: boolean;
  primaryProfession: string;
};

export type FieldErrors = Partial<Record<keyof ProfileInput | "password" | "confirmPassword", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfileFields(input: ProfileInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.firstName.trim()) errors.firstName = "First name is required.";
  if (!input.lastName.trim()) errors.lastName = "Second name is required.";
  if (!input.homeAddress.trim()) {
    errors.homeAddress = "Enter your postcode and complete your home address.";
  } else if (!isPlausibleUkAddress(input.homeAddress)) {
    errors.homeAddress = "Enter your building or street and town after searching your postcode.";
  }
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (!input.phone.trim()) errors.phone = "Phone number is required.";
  if (!input.primaryProfession.trim()) {
    errors.primaryProfession = "Select your business type.";
  } else if (!isKnownProfession(input.primaryProfession)) {
    errors.primaryProfession = "Choose a business type from the list.";
  }
  if (!input.businessSameAsHome) {
    if (!input.businessAddress.trim()) {
      errors.businessAddress = "Enter your postcode and complete your business address.";
    } else if (!isPlausibleUkAddress(input.businessAddress)) {
      errors.businessAddress = "Enter your building or street and town after searching your postcode.";
    }
  }

  return errors;
}

export function validatePassword(password: string, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {};
  const policyError = getPasswordPolicyError(password);
  if (policyError) errors.password = policyError;
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
