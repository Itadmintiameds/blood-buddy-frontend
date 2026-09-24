"use client";

import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type { StockMovement } from "@/types/bloodCenter/bloodCenterTypes";

// One audit record for an inventory item — mirrors the backend
// InventoryAuditResponse. `changedUnits` is signed (+added, -issued/discarded);
// `remainingUnits` is the resulting on-hand balance after the movement.
export interface InventoryAuditResponse {
  inventoryAuditId: number;
  inventoryId: number;
  bloodGroupId: number;
  bloodGroupName: string;
  bloodComponentId: number;
  bloodComponentName: string;
  stockMovement: StockMovement;
  changedUnits: number;
  remainingUnits: number;
  remarks: string | null;
  createdAt: string; // ISO timestamp (LocalDateTime)
  createdBy: string;
}

// GET /inventory/{inventoryId}/history — the full movement trail for a single
// inventory item (blood group + component).
export async function getInventoryHistory(
  inventoryId: number,
): Promise<InventoryAuditResponse[]> {
  const { data } = await api.get<ApiEnvelope<InventoryAuditResponse[]>>(
    `/inventory/${inventoryId}/history`,
  );

  return data.data ?? [];
}
