import { api } from "@/services/api/client";
import type { ApiEnvelope, PagedResponse } from "@/types/api.types";
import type {
  BloodRequestStatus,
  SuperAdminBloodRequestCentre,
  SuperAdminBloodRequestDetail,
  SuperAdminBloodRequestStats,
  SuperAdminBloodRequestSummary,
  SuperAdminDonor,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import type { PageRequest } from "@/services/bloodCenter/superAdmin/dashboardService";
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

// Sent as query params to GET /admin/blood-requests/paginated
// (bloodbuddy.backend.dto.bloodrequest.BloodRequestFilterRequest). Every field
// is optional; an unset field means "don't filter on this".
export interface BloodRequestFilter {
  /** Match requests in any of these lifecycle statuses. */
  statuses?: BloodRequestStatus[];
  /** Match requests for any of these blood groups. */
  bloodGroupIds?: number[];
  /** Match requests for any of these blood components. */
  bloodComponentIds?: number[];
  /** Match requests located in any of these cities (exact, case-insensitive). */
  cities?: string[];
  /** Match requests located in any of these districts (exact, case-insensitive). */
  districts?: string[];
  /** Free-text search across recipient name, mobile, hospital, address, city, district, pincode. */
  search?: string;
}

// GET ONE PAGE OF BLOOD REQUESTS (SUPERADMIN only), filtered + sorted
// server-side.
export async function getSuperAdminBloodRequestsPage(
  filter: BloodRequestFilter,
  page: PageRequest,
): Promise<PagedResponse<SuperAdminBloodRequestSummary>> {
  // URLSearchParams so repeated keys serialise as `statuses=a&statuses=b` —
  // what Spring's @ModelAttribute List<> binding expects.
  const params = new URLSearchParams();
  params.set("page", String(page.page));
  params.set("size", String(page.size));
  if (page.sort) {
    params.set("sort", page.sort);
  }
  filter.statuses?.forEach((status) => params.append("statuses", status));
  filter.bloodGroupIds?.forEach((id) =>
    params.append("bloodGroupIds", String(id)),
  );
  filter.bloodComponentIds?.forEach((id) =>
    params.append("bloodComponentIds", String(id)),
  );
  filter.cities?.forEach((city) => params.append("cities", city));
  filter.districts?.forEach((district) => params.append("districts", district));
  if (filter.search?.trim()) {
    params.set("search", filter.search.trim());
  }

  const { data } = await api.get<
    ApiEnvelope<PagedResponse<BloodRequestSummaryResponse>>
  >("/admin/blood-requests/paginated", { params });

  const paged = data.data;

  return {
    content: (paged.content ?? []).map(toSummary),
    page: paged.page,
    size: paged.size,
    totalElements: paged.totalElements,
    totalPages: paged.totalPages,
    last: paged.last,
  };
}

// Distinct cities + districts across all blood requests, for the filter
// dropdowns. Same shape as the donor/centre locations responses.
export interface BloodRequestLocationOptions {
  cities: string[];
  districts: string[];
}

export async function getBloodRequestLocations(): Promise<BloodRequestLocationOptions> {
  const { data } = await api.get<ApiEnvelope<BloodRequestLocationOptions>>(
    "/admin/blood-requests/locations",
  );
  return {
    cities: data.data?.cities ?? [],
    districts: data.data?.districts ?? [],
  };
}

// Aggregate blood-request stats across ALL requests (not the current filter),
// for the dashboard stat tiles.
export async function getSuperAdminBloodRequestStats(): Promise<SuperAdminBloodRequestStats> {
  const { data } = await api.get<ApiEnvelope<SuperAdminBloodRequestStats>>(
    "/admin/blood-requests/stats",
  );
  return data.data;
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
