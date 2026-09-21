import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  BloodRequestStatus,
  SuperAdminBloodRequestCentre,
  SuperAdminBloodRequestDetail,
  SuperAdminBloodRequestSummary,
  SuperAdminDonor,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import type { DonorRegistrationResponse } from "@/types/donor/donorTypes";

interface BloodRequestSummaryResponse {
  bloodRequestId: number;
  recipientName: string;
  mobileNumber: string;
  bloodGroupName: string;
  bloodComponentName: string;
  requiredUnits: number;
  city: string;
  district: string;
  pincode: string;
  status: BloodRequestStatus;
  createdAt: string;
}

interface BloodCentreResponse {
  bloodCentreId: number;
  bloodCentreName: string;
  bloodBankCategory: string | null;
  mobileNumber: string;
  email: string;
  address: string | null;
  district: string;
  city: string;
  pincode: string;
  isActive: boolean;
}

interface BloodRequestDetailResponse extends BloodRequestSummaryResponse {
  bloodGroupId: number;
  bloodComponentId: number;
  dob: string | null;
  hospitalName: string | null;
  address: string | null;
  remarks: string | null;
  matchedCentres: BloodCentreResponse[];
  donatedBy: DonorRegistrationResponse[];
  donorCandidates: DonorRegistrationResponse[];
}

function toSummary(
  response: BloodRequestSummaryResponse,
): SuperAdminBloodRequestSummary {
  return {
    id: response.bloodRequestId,
    recipientName: response.recipientName,
    mobileNumber: response.mobileNumber,
    bloodGroup: response.bloodGroupName,
    bloodType: response.bloodComponentName,
    units: response.requiredUnits,
    city: response.city,
    district: response.district,
    pincode: response.pincode,
    status: response.status,
    createdAt: response.createdAt,
  };
}

function toCentre(response: BloodCentreResponse): SuperAdminBloodRequestCentre {
  return {
    id: response.bloodCentreId,
    bloodBankName: response.bloodCentreName,
    category: response.bloodBankCategory ?? "—",
    address: response.address ?? "—",
    city: response.city,
    phoneNumber: response.mobileNumber,
  };
}

function toDonor(response: DonorRegistrationResponse): SuperAdminDonor {
  return {
    id: response.bloodDonorDetailsId,
    donorName: response.fullName,
    mobileNumber: response.mobileNumber,
    alternateMobileNumber: response.alternativeMobileNumber ?? "—",
    bloodGroupId: response.bloodGroupId,
    bloodGroup: response.bloodGroupName,
    dateOfBirth: response.dob,
    address: response.address,
    city: response.city,
    district: response.district,
    pincode: response.pincode,
    lastBloodDonationDate: response.lastBloodDonationDate,
    createdAt: response.createdAt,
  };
}

function toDetail(
  response: BloodRequestDetailResponse,
): SuperAdminBloodRequestDetail {
  return {
    ...toSummary(response),
    bloodGroupId: response.bloodGroupId,
    bloodComponentId: response.bloodComponentId,
    dateOfBirth: response.dob,
    hospitalName: response.hospitalName,
    address: response.address,
    remarks: response.remarks,
    matchedCentres: (response.matchedCentres ?? []).map(toCentre),
    donatedBy: (response.donatedBy ?? []).map(toDonor),
    donorCandidates: (response.donorCandidates ?? []).map(toDonor),
  };
}

// GET ALL BLOOD REQUESTS (SUPERADMIN only).
export async function getSuperAdminBloodRequests(): Promise<
  SuperAdminBloodRequestSummary[]
> {
  const { data } = await api.get<ApiEnvelope<BloodRequestSummaryResponse[]>>(
    "/admin/blood-requests",
  );

  return (data.data ?? []).map(toSummary);
}

// GET BLOOD REQUEST DETAIL (matched centres, donated-by, donor candidates).
export async function getSuperAdminBloodRequestDetail(
  bloodRequestId: number,
): Promise<SuperAdminBloodRequestDetail> {
  const { data } = await api.get<ApiEnvelope<BloodRequestDetailResponse>>(
    `/admin/blood-requests/${bloodRequestId}`,
  );

  return toDetail(data.data);
}

// RECORD A DONOR'S DONATION AGAINST A REQUEST.
export async function recordBloodRequestDonation(
  bloodRequestId: number,
  bloodDonorDetailsId: number,
): Promise<SuperAdminBloodRequestDetail> {
  const { data } = await api.post<ApiEnvelope<BloodRequestDetailResponse>>(
    `/admin/blood-requests/${bloodRequestId}/donation`,
    { bloodDonorDetailsId },
  );

  return toDetail(data.data);
}

// CLOSE A BLOOD REQUEST, with optional remarks.
export async function closeBloodRequest(
  bloodRequestId: number,
  remarks?: string,
): Promise<SuperAdminBloodRequestDetail> {
  const { data } = await api.patch<ApiEnvelope<BloodRequestDetailResponse>>(
    `/admin/blood-requests/${bloodRequestId}/close`,
    remarks ? { remarks } : undefined,
  );

  return toDetail(data.data);
}
