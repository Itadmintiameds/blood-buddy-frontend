import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/bloodCenter/bloodCenterTypes";

// Sends a one-time OTP to the given email so the account's password can be reset.
export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<string> {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    "/auth/forgot-password",
    payload,
  );

  return data.message;
}

// Verifies the OTP sent to the email and sets the new password.
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<string> {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    "/auth/reset-password",
    payload,
  );

  return data.message;
}
