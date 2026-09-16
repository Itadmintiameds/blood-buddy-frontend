export interface RecipientRequestInput {
  patientName: string;
  mobileNumber: string;
  bloodGroupId: number | "";
  bloodComponentId: number | "";
  requiredUnits: string;
  dob: string;
  hospitalName: string;
  address: string;
  district: string;
  city: string;
  pincode: string;
}

// Sent to POST /public/blood-requests (bloodbuddy.backend.dto.request.BloodRequestSubmission).
export interface BloodRequestPayload {
  recipientName: string;
  mobileNumber: string;
  bloodGroupId: number;
  bloodComponentId: number;
  requiredUnits: number;
  dob: string;
  hospitalName?: string;
  address?: string;
  city: string;
  district: string;
  pincode: string;
}

// bloodbuddy.backend.dto.request.BloodRequestResponse
export interface BloodRequestResponse {
  bloodRequestId: number;
  matched: boolean;
  matchedCentreCount: number;
  message: string;
}

// Local-only search stand-ins — the backend has no search endpoint yet
// (see recipientSearchService.ts).
export interface NearbyBloodBank {
  id: number;
  name: string;
  bloodGroup: string;
  unitsAvailable: number;
  address: string;
  mobileNumber: string;
  pincode: string;
}

export interface NearbyDonor {
  id: number;
  fullName: string;
  bloodGroup: string;
  mobileNumber: string;
  pincode: string;
  available: boolean;
}
