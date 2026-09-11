import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  ApiMessageResponse,
  OtpPayload,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function verifyOtp(
  payload: OtpPayload,
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiEnvelope<void>>(
    "/public/blood-centres/verify-otp",
    payload,
  );
  return { message: data.message };
}
