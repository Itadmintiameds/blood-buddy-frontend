import { api } from "@/services/api/client";
import { getOwnBloodCentreId } from "@/services/auth/authStorage";
import type { ApiEnvelope } from "@/types/api.types";
import type { AddAvailabilityPayload } from "@/types/bloodCenter/bloodCenterTypes";

// POST /blood-centres/{id}/inventory/add-availability adds to the caller's own
// centre stock; returns the updated centre inventory.
export async function addAvailability(
  payload: AddAvailabilityPayload,
): Promise<void> {
  await api.post<ApiEnvelope<unknown>>(
    `/blood-centres/${getOwnBloodCentreId()}/inventory/add-availability`,
    payload,
  );
}

export async function saveAvailability(
  payload: AddAvailabilityPayload,
): Promise<void> {
  return addAvailability(payload);
}
