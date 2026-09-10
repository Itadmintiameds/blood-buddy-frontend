import { api } from "@/services/api/client";
import type {
  SendOtpPayload,
  SendOtpResponse,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function sendOtp(
  payload: SendOtpPayload,
): Promise<SendOtpResponse> {
  const { data } = await api.post<SendOtpResponse>("/otp/send", payload);
  return data;
}
