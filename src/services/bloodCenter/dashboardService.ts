import { api } from "@/services/api/client";
import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";

export async function getAvailability(): Promise<BloodAvailabilityItem[]> {
  const { data } = await api.get<BloodAvailabilityItem[]>(
    "/v1/dashboard/bloodgroup_availability",
  );
  return data ?? [];
}
