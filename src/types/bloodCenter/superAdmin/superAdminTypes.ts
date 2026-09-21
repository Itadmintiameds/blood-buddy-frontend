export type SuperAdminSection = "blood-bank" | "donor" | "recipient";

export interface BloodAvailability {
  id: number;
  bloodGroupId: number;
  bloodComponentId: number;
  bloodGroup: string;
  bloodType: string;
  units: number;
}

export interface SuperAdminBloodBank {
  id: number;
  bloodBankName: string;
  category: string;
  address: string;
  city: string;
  phoneNumber: string;
  availability: BloodAvailability[];
}

export interface UpdateBloodUnitsInput {
  bloodBankId: number;
  availabilityId: number;
  bloodGroupId: number;
  bloodComponentId: number;
  previousUnits: number;
  units: number;
}

export interface SuperAdminDonor {
  id: number;
  donorName: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  bloodGroupId: number;
  bloodGroup: string;
  dateOfBirth: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate: string | null;
  createdAt: string;
}

// Sent to POST /admin/blood-centres/{id}/inventory/add-availability
// (bloodbuddy.backend.dto.inventory.AddAvailabilityRequest) — SUPERADMIN
// adding stock directly to a specific centre.
export interface AdminAddStockInput {
  bloodCentreId: number;
  bloodGroupId: number;
  bloodComponentId: number;
  units: number;
  remarks?: string;
}

/* ============================================================
   BLOOD REQUESTS (bloodbuddy.backend.controller.AdminBloodRequestController)
============================================================ */

export type BloodRequestStatus =
  | "CENTRES_FOUND"
  | "NO_CENTRES_FOUND"
  | "CLOSED"
  | "CANCELLED";

// bloodbuddy.backend.dto.bloodrequest.BloodRequestSummaryResponse
export interface SuperAdminBloodRequestSummary {
  id: number;
  recipientName: string;
  mobileNumber: string;
  bloodGroup: string;
  bloodType: string;
  units: number;
  city: string;
  district: string;
  pincode: string;
  status: BloodRequestStatus;
  createdAt: string;
}

// Lightweight centre reference used inside a blood request's matched
// centres list — full stock detail lives in Blood Bank Management.
export interface SuperAdminBloodRequestCentre {
  id: number;
  bloodBankName: string;
  category: string;
  address: string;
  city: string;
  phoneNumber: string;
}

// bloodbuddy.backend.dto.bloodrequest.BloodRequestDetailResponse
export interface SuperAdminBloodRequestDetail extends SuperAdminBloodRequestSummary {
  bloodGroupId: number;
  bloodComponentId: number;
  dateOfBirth: string | null;
  hospitalName: string | null;
  address: string | null;
  remarks: string | null;
  matchedCentres: SuperAdminBloodRequestCentre[];
  donatedBy: SuperAdminDonor[];
  donorCandidates: SuperAdminDonor[];
}
