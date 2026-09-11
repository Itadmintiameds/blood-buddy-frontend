import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";

export async function getBloodGroups(): Promise<MasterBloodGroup[]> {
  const { data } = await api.get<ApiEnvelope<MasterBloodGroup[]>>(
    "/public/masters/blood-groups",
  );
  return data.data ?? [];
}

export async function getBloodComponents(): Promise<MasterBloodComponent[]> {
  const { data } = await api.get<ApiEnvelope<MasterBloodComponent[]>>(
    "/public/masters/blood-components",
  );
  return data.data ?? [];
}
