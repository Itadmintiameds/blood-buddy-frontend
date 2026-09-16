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
  password: string;
  confirmPassword: string;
}
// Sent to POST /public/donors/register (bloodbuddy.backend.dto.donor.DonorRegistrationRequest).
// Note: the backend request has no password field — it only accepts the donor's
// profile details. Password is captured locally so the stubbed donor login
// (see donorSessionStorage.ts) has something to check against until the
// backend adds real donor authentication.
export interface DonorRegistrationPayload {
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber?: string;
  bloodGroupId: number;
  dob: string;
  pincode: string;
  lastBloodDonationDate?: string;
}

// bloodbuddy.backend.dto.donor.DonorResponse — shared by the registration
// response and the SUPERADMIN donor list (GET /admin/donors).
export interface DonorRegistrationResponse {
  bloodDonorDetailsId: number;
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber: string | null;
  bloodGroupId: number;
  bloodGroupName: string;
  dob: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate: string | null;
  createdAt: string;
}

export type DonorAvailabilityStatus = "AVAILABLE" | "NOT_AVAILABLE";

export interface DonorAvailabilityInput {
  status: DonorAvailabilityStatus;
  note?: string;
}
