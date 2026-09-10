import { api } from "@/services/api/client";
import type {
  PasswordResetPayload,
  ApiTextResponse,
} from "@/types/bloodCenter/bloodCenterTypes";

export async function resetPassword(
  payload: PasswordResetPayload,
): Promise<ApiTextResponse> {
  const { data } = await api.post<ApiTextResponse>("/password/reset", payload);
  return data;
}
