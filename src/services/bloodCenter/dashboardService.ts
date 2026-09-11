import { api } from "@/services/api/client";
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

interface CentreInventoryResponse {
  bloodCentre: unknown;
  inventory: InventoryResponse[];
}

// GET /inventory returns the caller's own centre stock (centre id comes from the JWT).
export async function getAvailability(): Promise<BloodAvailabilityItem[]> {
  const { data } =
    await api.get<ApiEnvelope<CentreInventoryResponse>>("/inventory");

  return (data.data?.inventory ?? []).map((item) => ({
    id: item.inventoryId,
    bloodGroup: item.bloodGroupName,
    bloodType: item.bloodComponentName,
    unitsAvailable: item.availableUnits,
  }));
}
