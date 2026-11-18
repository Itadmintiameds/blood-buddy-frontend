import { api } from "@/services/api/client";
import { getOwnBloodCentreId } from "@/services/auth/authStorage";
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

// POST /blood-centres/{id}/inventory/stock-adjustment issues/discards/corrects
// the caller's own centre stock; returns the updated inventory.
export async function adjustStock(
  payload: StockAdjustmentPayload,
): Promise<BloodAvailabilityItem[]> {
  const { data } = await api.post<ApiEnvelope<CentreInventoryResponse>>(
    `/blood-centres/${getOwnBloodCentreId()}/inventory/stock-adjustment`,
    payload,
  );

  return (data.data?.inventory ?? []).map((item) => ({
    id: item.inventoryId,
    bloodGroupId: item.bloodGroupId,
    bloodComponentId: item.bloodComponentId,
    bloodGroup: item.bloodGroupName,
    bloodComponent: item.bloodComponentName,
    unitsAvailable: item.availableUnits,
  }));
}
