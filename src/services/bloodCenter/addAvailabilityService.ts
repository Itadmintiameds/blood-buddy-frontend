import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type { AddAvailabilityPayload } from "@/types/bloodCenter/bloodCenterTypes";

// POST /inventory/add-availability adds to the caller's own centre stock
// (centre id comes from the JWT); returns the updated centre inventory.
export async function addAvailability(
  payload: AddAvailabilityPayload,
): Promise<void> {
  await api.post<ApiEnvelope<unknown>>(
    "/inventory/add-availability",
    payload,
  );
}

export async function saveAvailability(
  payload: AddAvailabilityPayload,
): Promise<void> {
  return addAvailability(payload);
}
