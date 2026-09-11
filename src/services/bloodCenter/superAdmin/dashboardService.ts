import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  SuperAdminBloodBank,
  UpdateBloodUnitsInput,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";

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

// GET ALL BLOOD BANKS (+ each centre's stock, SUPERADMIN only).
export async function getSuperAdminBloodBanks(): Promise<
  SuperAdminBloodBank[]
> {
  const { data: centresEnvelope } = await api.get<
    ApiEnvelope<BloodCentreResponse[]>
  >("/admin/blood-centres");

  const centres = centresEnvelope.data ?? [];

  return Promise.all(
    centres.map(async (centre) => {
      const { data: inventoryEnvelope } = await api.get<
        ApiEnvelope<CentreInventoryResponse>
      >(`/admin/blood-centres/${centre.bloodCentreId}/inventory`);

      const inventory = inventoryEnvelope.data?.inventory ?? [];

      return {
        id: centre.bloodCentreId,
        bloodBankName: centre.bloodCentreName,
        category: centre.bloodBankCategory ?? "—",
        address: centre.address ?? "—",
        city: centre.city,
        phoneNumber: centre.mobileNumber,
        availability: inventory.map((item) => ({
          id: item.inventoryId,
          bloodGroupId: item.bloodGroupId,
          bloodComponentId: item.bloodComponentId,
          bloodGroup: item.bloodGroupName,
          bloodType: item.bloodComponentName,
          units: item.availableUnits,
        })),
      };
    }),
  );
}

// UPDATE BLOOD UNITS
// The UI collects a new absolute unit count; the backend's stock-adjustment
// endpoint only accepts a signed delta, so it's applied here as a CORRECTION.
export async function updateSuperAdminBloodUnits(
  payload: UpdateBloodUnitsInput,
): Promise<{
  success: boolean;
  message: string;
}> {
  const changedUnits = payload.units - payload.previousUnits;

  if (changedUnits === 0) {
    return { success: true, message: "No change." };
  }

  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/admin/blood-centres/${payload.bloodBankId}/inventory/stock-adjustment`,
    {
      bloodGroupId: payload.bloodGroupId,
      bloodComponentId: payload.bloodComponentId,
      movement: "CORRECTION",
      changedUnits,
    },
  );

  return { success: true, message: data.message };
}
