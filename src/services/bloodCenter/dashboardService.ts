import { api } from "@/services/api/client";
import { getOwnBloodCentreId } from "@/services/auth/authStorage";
import type { ApiEnvelope } from "@/types/api.types";
import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";

interface InventoryResponse {
  inventoryId: number;
  bloodGroupId: number;
  bloodGroupName: string;
  bloodComponentId: number;
  bloodComponentName: string;
  availableUnits: number;
}

interface CentreResponse {
  bloodCentreName: string;
}

interface CentreInventoryResponse {
  bloodCentre: CentreResponse | null;
  inventory: InventoryResponse[];
}

export interface AvailabilitySnapshot {
  bloodCentreName: string | null;
  items: BloodAvailabilityItem[];
}

// GET /blood-centres/{id}/inventory returns the caller's own centre stock plus
// its own centre details; the centre name is read from here.
export async function getAvailability(): Promise<AvailabilitySnapshot> {
  const { data } =
    await api.get<ApiEnvelope<CentreInventoryResponse>>(
      `/blood-centres/${getOwnBloodCentreId()}/inventory`,
    );

  return {
    bloodCentreName: data.data?.bloodCentre?.bloodCentreName ?? null,
    items: (data.data?.inventory ?? []).map((item) => ({
      id: item.inventoryId,
      bloodGroupId: item.bloodGroupId,
      bloodComponentId: item.bloodComponentId,
      bloodGroup: item.bloodGroupName,
      bloodComponent: item.bloodComponentName,
      unitsAvailable: item.availableUnits,
    })),
  };
}
