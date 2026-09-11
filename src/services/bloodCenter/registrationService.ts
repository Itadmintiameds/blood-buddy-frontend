import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  BloodCentreRegistrationPayload,
  BloodCentreRegistrationResponse,
} from "@/types/bloodCenter/bloodCenterTypes";

// Backend gates this on a prior verified OTP for the same email
// (see EmailVerificationService.assertEmailVerified) — call sendOtp/verifyOtp first.
export async function registerBloodCentre(
  payload: BloodCentreRegistrationPayload,
): Promise<BloodCentreRegistrationResponse> {
  const { data } = await api.post<ApiEnvelope<BloodCentreRegistrationResponse>>(
    "/public/blood-centres/register",
    payload,
  );
  return data.data;
}
