export type ProfileInput = {
  firstName: string;
  lastName: string;
  homeAddress: string;
  email: string;
  phone: string;
  businessAddress: string;
  businessName?: string | null;
  businessSameAsHome: boolean;
};

export type FieldErrors = Partial<Record<keyof ProfileInput | "password" | "confirmPassword", string>>;

import { isPlausibleUkAddress, isValidUkPostcode } from "@/lib/uk-address";

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
  if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
