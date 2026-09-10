import { api } from "@/services/api/client";
import type {
  BloodCentreRegistrationPayload,
  RegistrationResponse,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function registerBloodCentre(
  payload: BloodCentreRegistrationPayload,
): Promise<RegistrationResponse> {
  const { data } = await api.post<RegistrationResponse>(
    "/blood-centres/send-otp",
    payload,
  );
  return data;
}
