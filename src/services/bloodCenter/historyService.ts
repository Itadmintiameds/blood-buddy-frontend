"use client";

import { api } from "@/services/api/client";
import type { ApiEnvelope, PagedResponse } from "@/types/api.types";
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

// GET /inventory/{inventoryId}/history — one page of the movement trail for a
// single inventory item (blood group + component). Newest-first by default
// (the backend keeps ORDER BY createdAt DESC). `page` is zero-based.
export async function getInventoryHistory(
  inventoryId: number,
  page: { page: number; size: number },
): Promise<PagedResponse<InventoryAuditResponse>> {
  const params = new URLSearchParams();
  params.set("page", String(page.page));
  params.set("size", String(page.size));

  const { data } = await api.get<
    ApiEnvelope<PagedResponse<InventoryAuditResponse>>
  >(`/inventory/${inventoryId}/history`, { params });

  const paged = data.data;

  return {
    content: paged.content ?? [],
    page: paged.page,
    size: paged.size,
    totalElements: paged.totalElements,
    totalPages: paged.totalPages,
    last: paged.last,
  };
}
