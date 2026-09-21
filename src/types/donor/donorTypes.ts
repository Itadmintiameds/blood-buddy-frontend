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
