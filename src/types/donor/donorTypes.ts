export interface DonorRegistrationInput {
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber: string;
  bloodGroupId: number | "";
  dob: string;
  address: string;
  district: string;
  city: string;
  pincode: string;
  lastBloodDonationDate: string;
}
// Sent to POST /public/donors/register (bloodbuddy.backend.dto.donor.DonorRegistrationRequest).
export interface DonorRegistrationPayload {
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber?: string;
  bloodGroupId: number;
  dob: string;
  address?: string;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate?: string;
}

// A donor's availability lifecycle. ACTIVE donors are reachable; LOCKED is a
// temporary, auto-expiring unavailability; DEACTIVATED is permanent.
export type DonorAvailabilityStatus = "ACTIVE" | "LOCKED" | "DEACTIVATED";

// Reasons that accompany a temporary lock.
export type DonorLockReason = "ILLNESS" | "OUT_OF_STATION";

// Reasons that accompany a permanent deactivation.
export type DonorDeactivationReason = "MEDICAL" | "DEATH" | "RELOCATED";

// Any reason that can appear in `unavailabilityReason` — a lock or a
// deactivation reason.
export type DonorUnavailabilityReason =
  | DonorLockReason
  | DonorDeactivationReason;

// bloodbuddy.backend.dto.donor.DonorResponse — shared by the registration
// response and the SUPERADMIN donor list (GET /admin/donors).
export interface DonorRegistrationResponse {
  bloodDonorDetailsId: number;
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber: string | null;
  bloodGroupId: number;
  bloodGroupName: string;
  dob: string | null;
  address: string | null;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate: string | null;
  createdAt: string;
  // Availability management. `available` is the source of truth for the badge
  // (a lock whose `lockedUntil` has passed reads as available again even while
  // `status` still says LOCKED); the rest drive the detail view.
  status: DonorAvailabilityStatus;
  unavailabilityReason: DonorUnavailabilityReason | null;
  remarks: string | null;
  lockedFrom: string | null;
  lockedUntil: string | null;
  available: boolean;
}
