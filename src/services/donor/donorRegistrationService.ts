import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  DonorRegistrationPayload,
  DonorRegistrationResponse,
} from "@/types/donor/donorTypes";

// Real, live endpoint — POST /public/donors/register
// (bloodbuddy.backend.controller.DonorController).
export async function registerDonor(
  payload: DonorRegistrationPayload,
): Promise<DonorRegistrationResponse> {
  const { data } = await api.post<ApiEnvelope<DonorRegistrationResponse>>(
    "/public/donors/register",
    payload,
  );
  return data.data;
}
