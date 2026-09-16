import { api } from "@/services/api/client";
import type {
  ApiTextResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function sendForgotPasswordOtp(
  payload: ForgotPasswordPayload,
): Promise<ApiTextResponse> {
  const { data } = await api.post<ApiTextResponse>(
    "/auth/forgot-password",
    payload,
  );

  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ApiTextResponse> {
  const { data } = await api.post<ApiTextResponse>(
    "/auth/reset-password",
    payload,
  );

  return data;
}
