import type { ClientProfileRecord } from "@/lib/profile-server";

/** Serializable profile fields passed from server layouts into client dashboard UI. */
export type DashboardShellProfile = Pick<
  ClientProfileRecord,
  | "userId"
  | "firstName"
  | "lastName"
  | "homeAddress"
  | "email"
  | "phone"
  | "businessAddress"
  | "businessName"
  | "businessSameAsHome"
  | "primaryProfession"
>;

export function toDashboardShellProfile(profile: ClientProfileRecord): DashboardShellProfile {
  return {
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    homeAddress: profile.homeAddress,
    email: profile.email,
    phone: profile.phone,
    businessAddress: profile.businessAddress,
    businessName: profile.businessName,
    businessSameAsHome: profile.businessSameAsHome,
    primaryProfession: profile.primaryProfession,
  };
}
