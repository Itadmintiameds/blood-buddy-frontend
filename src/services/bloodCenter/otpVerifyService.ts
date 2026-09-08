import { api } from "@/services/api/client";
import type {
  OtpPayload,
  OtpResponse,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function verifyOtp(payload: OtpPayload): Promise<OtpResponse> {
  const { data } = await api.post<OtpResponse>("/v1/otp/verify", payload);
  return data;
}
