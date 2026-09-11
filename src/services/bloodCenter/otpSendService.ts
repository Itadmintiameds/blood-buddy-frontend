import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  ApiMessageResponse,
  SendOtpPayload,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function sendOtp(
  payload: SendOtpPayload,
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiEnvelope<void>>(
    "/public/blood-centres/send-otp",
    payload,
  );
  return { message: data.message };
}
