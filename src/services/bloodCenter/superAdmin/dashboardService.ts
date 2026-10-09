import { api } from "@/services/api/client";
import type { ApiEnvelope, PagedResponse } from "@/types/api.types";
import type {
  AdminAddStockInput,
  DeactivateDonorInput,
  LockDonorInput,
  SuperAdminBloodBank,
  SuperAdminBloodCentreStats,
  SuperAdminDonor,
  UpdateBloodUnitsInput,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import type {
  DonorAvailabilityStatus,
  DonorRegistrationResponse,
} from "@/types/donor/donorTypes";

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
  bloodCentreLicenceNumber?: string | null;
  licenceExpiryDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationUrl?: string | null;
}

interface InventoryResponse {
  inventoryId: number;
  bloodGroupId: number;
  bloodGroupName: string;
  bloodComponentId: number;
  bloodComponentName: string;
  availableUnits: number;
}

interface CentreInventoryResponse {
  bloodCentre: BloodCentreResponse;
  inventory: InventoryResponse[];
}

// Sent as query params to GET /admin/blood-centres/paginated
// (bloodbuddy.backend.dto.centre.BloodCentreFilterRequest). Every field is
// optional; an unset field means "don't filter on this".
export interface BloodCentreFilter {
  /** Active/inactive status; omit for both. */
  isActive?: boolean;
  /** Match centres located in any of these cities (exact, case-insensitive). */
  cities?: string[];
  /** Match centres located in any of these districts (exact, case-insensitive). */
  districts?: string[];
  /** Match centres stocking any of these blood groups (with units in stock). */
  bloodGroupIds?: number[];
  /** Match centres stocking any of these components (with units in stock). */
  bloodComponentIds?: number[];
  /** Free-text search across name, email, mobile, address, city, district, pincode, licence. */
  search?: string;
}

// Spring Pageable params. `page` is zero-based; `sort` is "field,dir".
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

function mapCentreToBank(
  centre: BloodCentreResponse,
  availability: SuperAdminBloodBank["availability"],
): SuperAdminBloodBank {
  return {
    id: centre.bloodCentreId,
    bloodBankName: centre.bloodCentreName,
    category: centre.bloodBankCategory ?? "",
    address: centre.address ?? "—",
    city: centre.city,
    district: centre.district,
    pincode: centre.pincode,
    phoneNumber: centre.mobileNumber,
    email: centre.email,
    isActive: centre.isActive,
    licenceNumber: centre.bloodCentreLicenceNumber ?? undefined,
    licenceExpiryDate: centre.licenceExpiryDate ?? undefined,
    latitude: centre.latitude ?? undefined,
    longitude: centre.longitude ?? undefined,
    locationUrl: centre.locationUrl ?? undefined,
    availability,
  };
}

// GET ONE PAGE OF BLOOD BANKS (SUPERADMIN only), filtered + sorted server-side.
// The list rows don't show stock, so centres come back without inventory; the
// selected centre's stock is loaded on demand via getSuperAdminBloodBankDetail.
export async function getSuperAdminBloodCentresPage(
  filter: BloodCentreFilter,
  page: PageRequest,
): Promise<PagedResponse<SuperAdminBloodBank>> {
  // URLSearchParams (not a plain object) so repeated keys serialise as
  // `cities=a&cities=b` — what Spring's @ModelAttribute List<> binding expects,
  // rather than axios's default `cities[]=a`.
  const params = new URLSearchParams();
  params.set("page", String(page.page));
  params.set("size", String(page.size));
  if (page.sort) {
    params.set("sort", page.sort);
  }
  if (filter.isActive !== undefined) {
    params.set("isActive", String(filter.isActive));
  }
  filter.cities?.forEach((city) => params.append("cities", city));
  filter.districts?.forEach((district) => params.append("districts", district));
  filter.bloodGroupIds?.forEach((id) =>
    params.append("bloodGroupIds", String(id)),
  );
  filter.bloodComponentIds?.forEach((id) =>
    params.append("bloodComponentIds", String(id)),
  );
  if (filter.search?.trim()) {
    params.set("search", filter.search.trim());
  }

  const { data } = await api.get<
    ApiEnvelope<PagedResponse<BloodCentreResponse>>
  >("/admin/blood-centres/paginated", { params });

  const paged = data.data;

  return {
    content: (paged.content ?? []).map((centre) => mapCentreToBank(centre, [])),
    page: paged.page,
    size: paged.size,
    totalElements: paged.totalElements,
    totalPages: paged.totalPages,
    last: paged.last,
  };
}

// GET ONE CENTRE'S FULL DETAILS + STOCK (SUPERADMIN only).
export async function getSuperAdminBloodBankDetail(
  bloodCentreId: number,
): Promise<SuperAdminBloodBank> {
  const { data } = await api.get<ApiEnvelope<CentreInventoryResponse>>(
    `/admin/blood-centres/${bloodCentreId}/inventory`,
  );

  const centre = data.data.bloodCentre;
  const inventory = data.data.inventory ?? [];

  return mapCentreToBank(
    centre,
    inventory.map((item) => ({
      id: item.inventoryId,
      bloodGroupId: item.bloodGroupId,
      bloodComponentId: item.bloodComponentId,
      bloodGroup: item.bloodGroupName,
      bloodComponent: item.bloodComponentName,
      units: item.availableUnits,
    })),
  );
}

// Distinct cities + districts across all centres, for the filter dropdowns.
// Matches bloodbuddy.backend.dto...LocationOptionsResponse.
export interface BloodCentreLocationOptions {
  cities: string[];
  districts: string[];
}

export async function getBloodCentreLocations(): Promise<BloodCentreLocationOptions> {
  const { data } = await api.get<ApiEnvelope<BloodCentreLocationOptions>>(
    "/admin/blood-centres/locations",
  );
  return {
    cities: data.data?.cities ?? [],
    districts: data.data?.districts ?? [],
  };
}

// Dashboard aggregate stats across ALL centres (not the current page/filter).
export async function getSuperAdminBloodCentreStats(): Promise<SuperAdminBloodCentreStats> {
  const { data } = await api.get<ApiEnvelope<SuperAdminBloodCentreStats>>(
    "/admin/blood-centres/stats",
  );
  return data.data;
}

// UPDATE BLOOD UNITS
// The caller picks the movement reason (Issue / Discard / Correction) and
// supplies the already-signed delta to apply via the stock-adjustment endpoint.
export async function updateSuperAdminBloodUnits(
  payload: UpdateBloodUnitsInput,
): Promise<{
  success: boolean;
  message: string;
}> {
  if (payload.changedUnits === 0) {
    return { success: true, message: "No change." };
  }

  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/admin/blood-centres/${payload.bloodBankId}/inventory/stock-adjustment`,
    {
      bloodGroupId: payload.bloodGroupId,
      bloodComponentId: payload.bloodComponentId,
      movement: payload.movement,
      changedUnits: payload.changedUnits,
    },
  );

  return { success: true, message: data.message };
}

// ADD STOCK TO A SPECIFIC CENTRE (SUPERADMIN only).
// Unlike updateSuperAdminBloodUnits (a signed CORRECTION), this hits the
// dedicated add-availability endpoint for that centre, same as a centre
// adding its own stock.
export async function addStockToCentre(
  payload: AdminAddStockInput,
): Promise<{
  success: boolean;
  message: string;
}> {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/admin/blood-centres/${payload.bloodCentreId}/inventory/add-availability`,
    {
      bloodGroupId: payload.bloodGroupId,
      bloodComponentId: payload.bloodComponentId,
      units: payload.units,
      remarks: payload.remarks,
    },
  );

  return { success: true, message: data.message };
}

// Distinct cities + districts across all donors, for the filter dropdowns.
// Same shape as the blood-centre locations response.
export async function getDonorLocations(): Promise<BloodCentreLocationOptions> {
  const { data } = await api.get<ApiEnvelope<BloodCentreLocationOptions>>(
    "/admin/donors/locations",
  );
  return {
    cities: data.data?.cities ?? [],
    districts: data.data?.districts ?? [],
  };
}

function mapDonor(donor: DonorRegistrationResponse): SuperAdminDonor {
  return {
    id: donor.bloodDonorDetailsId,
    donorName: donor.fullName,
    mobileNumber: donor.mobileNumber,
    alternateMobileNumber: donor.alternativeMobileNumber ?? "—",
    bloodGroupId: donor.bloodGroupId,
    bloodGroup: donor.bloodGroupName,
    dateOfBirth: donor.dob,
    address: donor.address,
    city: donor.city,
    district: donor.district,
    pincode: donor.pincode,
    lastBloodDonationDate: donor.lastBloodDonationDate,
    createdAt: donor.createdAt,
    status: donor.status,
    unavailabilityReason: donor.unavailabilityReason,
    remarks: donor.remarks,
    lockedFrom: donor.lockedFrom,
    lockedUntil: donor.lockedUntil,
    available: donor.available,
  };
}

// GET ALL DONORS (SUPERADMIN only).
export async function getSuperAdminDonors(): Promise<SuperAdminDonor[]> {
  const { data } =
    await api.get<ApiEnvelope<DonorRegistrationResponse[]>>("/admin/donors");

  return (data.data ?? []).map(mapDonor);
}

// Sent as query params to GET /admin/donors/paginated
// (bloodbuddy.backend.dto.donor.DonorFilterRequest). Every field is optional;
// an unset field means "don't filter on this".
export interface DonorFilter {
  /** Match donors with any of these blood groups. */
  bloodGroupIds?: number[];
  /** Match donors located in any of these cities (exact, case-insensitive). */
  cities?: string[];
  /** Match donors located in any of these districts (exact, case-insensitive). */
  districts?: string[];
  /** Free-text search across name, mobile, alternative mobile, address, city, district, pincode. */
  search?: string;
  /**
   * Match donors in any of these availability statuses. Omitting this (the
   * default) returns only currently-available donors — locked and deactivated
   * donors stay hidden until an explicit status is requested.
   */
  statuses?: DonorAvailabilityStatus[];
}

// Aggregate donor dashboard stats across ALL donors (not the current
// page/filter). Matches GET /admin/donors/stats.
export interface SuperAdminDonorStats {
  totalDonors: number;
  distinctBloodGroupCount: number;
  recentDonationCount: number;
  // Donors currently locked (temporarily unavailable) and deactivated
  // (permanently removed).
  lockedDonors: number;
  deactivatedDonors: number;
}

export async function getSuperAdminDonorStats(): Promise<SuperAdminDonorStats> {
  const { data } = await api.get<ApiEnvelope<SuperAdminDonorStats>>(
    "/admin/donors/stats",
  );
  return data.data;
}

// GET ONE PAGE OF DONORS (SUPERADMIN only), filtered + sorted server-side.
export async function getSuperAdminDonorsPage(
  filter: DonorFilter,
  page: PageRequest,
): Promise<PagedResponse<SuperAdminDonor>> {
  // URLSearchParams so repeated keys serialise as `cities=a&cities=b` — what
  // Spring's @ModelAttribute List<> binding expects.
  const params = new URLSearchParams();
  params.set("page", String(page.page));
  params.set("size", String(page.size));
  if (page.sort) {
    params.set("sort", page.sort);
  }
  filter.bloodGroupIds?.forEach((id) =>
    params.append("bloodGroupIds", String(id)),
  );
  filter.cities?.forEach((city) => params.append("cities", city));
  filter.districts?.forEach((district) => params.append("districts", district));
  filter.statuses?.forEach((status) => params.append("statuses", status));
  if (filter.search?.trim()) {
    params.set("search", filter.search.trim());
  }

  const { data } = await api.get<
    ApiEnvelope<PagedResponse<DonorRegistrationResponse>>
  >("/admin/donors/paginated", { params });

  const paged = data.data;

  return {
    content: (paged.content ?? []).map(mapDonor),
    page: paged.page,
    size: paged.size,
    totalElements: paged.totalElements,
    totalPages: paged.totalPages,
    last: paged.last,
  };
}

// LOCK A DONOR (SUPERADMIN only) — a temporary, auto-expiring unavailability.
// PATCH /admin/donors/{donorId}/lock. Returns the updated donor. The backend
// 400s (surfaced to the caller) when the reason isn't a lock reason, the dates
// are in the past, or lockedUntil precedes lockedFrom.
export async function lockDonor(
  donorId: number,
  input: LockDonorInput,
): Promise<SuperAdminDonor> {
  const body: LockDonorInput = {
    reason: input.reason,
    lockedUntil: input.lockedUntil,
  };
  if (input.lockedFrom) body.lockedFrom = input.lockedFrom;
  if (input.remarks) body.remarks = input.remarks;

  const { data } = await api.patch<ApiEnvelope<DonorRegistrationResponse>>(
    `/admin/donors/${donorId}/lock`,
    body,
  );

  return mapDonor(data.data);
}

// DEACTIVATE A DONOR (SUPERADMIN only) — a permanent removal.
// PATCH /admin/donors/{donorId}/deactivate. Returns the updated donor.
export async function deactivateDonor(
  donorId: number,
  input: DeactivateDonorInput,
): Promise<SuperAdminDonor> {
  const body: DeactivateDonorInput = { reason: input.reason };
  if (input.remarks) body.remarks = input.remarks;

  const { data } = await api.patch<ApiEnvelope<DonorRegistrationResponse>>(
    `/admin/donors/${donorId}/deactivate`,
    body,
  );

  return mapDonor(data.data);
}

// REACTIVATE A DONOR (SUPERADMIN only) — restores to ACTIVE, clearing any lock
// or deactivation. PATCH /admin/donors/{donorId}/reactivate (no body).
export async function reactivateDonor(
  donorId: number,
): Promise<SuperAdminDonor> {
  const { data } = await api.patch<ApiEnvelope<DonorRegistrationResponse>>(
    `/admin/donors/${donorId}/reactivate`,
  );

  return mapDonor(data.data);
}
