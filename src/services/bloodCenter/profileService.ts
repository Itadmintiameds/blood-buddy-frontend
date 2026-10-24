import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  BloodCentreProfile,
  BloodCentreProfileUpdatePayload,
} from "@/types/bloodCenter/bloodCenterTypes";

// The signed-in centre's own profile. The centre id comes from the JWT on the
// server, so there's no id in the path.
export async function getCentreProfile(): Promise<BloodCentreProfile> {
  const { data } = await api.get<ApiEnvelope<BloodCentreProfile>>(
    "/blood-centre/profile",
  );

  return data.data;
}

// EDIT THE SIGNED-IN CENTRE'S PROFILE — a full replacement of the editable
// fields (email, licence and active status aren't editable here).
export async function updateCentreProfile(
  payload: BloodCentreProfileUpdatePayload,
): Promise<BloodCentreProfile> {
  const { data } = await api.put<ApiEnvelope<BloodCentreProfile>>(
    "/blood-centre/profile",
    payload,
  );

  return data.data;
}
