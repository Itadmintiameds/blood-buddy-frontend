import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  BloodAvailabilityItem,
  StockAdjustmentPayload,
} from "@/types/bloodCenter/bloodCenterTypes";

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

// POST /inventory/stock-adjustment issues/discards/corrects the caller's own
// centre stock (centre id comes from the JWT); returns the updated inventory.
export async function adjustStock(
  payload: StockAdjustmentPayload,
): Promise<BloodAvailabilityItem[]> {
  const { data } = await api.post<ApiEnvelope<CentreInventoryResponse>>(
    "/inventory/stock-adjustment",
    payload,
  );

  return (data.data?.inventory ?? []).map((item) => ({
    id: item.inventoryId,
    bloodGroupId: item.bloodGroupId,
    bloodComponentId: item.bloodComponentId,
    bloodGroup: item.bloodGroupName,
    bloodType: item.bloodComponentName,
    unitsAvailable: item.availableUnits,
  }));
}
