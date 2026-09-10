import { api } from "@/services/api/client";
import { Availability } from "@/types/bloodCenter/bloodAvailabilityTypes";
import { AddAvailabilityPayload } from "@/types/bloodCenter/bloodCenterTypes";

export async function getBloodAvailability(): Promise<Availability[]> {
  const response = await api.get<Availability[]>(
    "/dashboard/bloodgroup_availability",
  );

  return response.data;
}

export async function addBloodAvailability(
  payload: AddAvailabilityPayload,
): Promise<Availability> {
  const response = await api.post<Availability>(
    "/dashboard/add_availability",
    payload,
  );

  return response.data;
}
