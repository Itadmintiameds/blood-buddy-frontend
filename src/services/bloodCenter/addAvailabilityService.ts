import { api } from "@/services/api/client";
import type {
  AddAvailabilityPayload,
  BloodAvailabilityItem,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function addAvailability(
  payload: AddAvailabilityPayload,
): Promise<BloodAvailabilityItem> {
  const { data } = await api.post<BloodAvailabilityItem>(
    "/v1/dashboard/add_availability",
    payload,
  );
  return data;
}

export async function saveAvailability(
  payload: AddAvailabilityPayload,
): Promise<BloodAvailabilityItem> {
  return addAvailability(payload);
}
