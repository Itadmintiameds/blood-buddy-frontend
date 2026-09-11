import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  BloodRequestPayload,
  BloodRequestResponse,
} from "@/types/recipient/receipientTypes";

// Real, live endpoint — POST /public/blood-requests
// (bloodbuddy.backend.controller.BloodRequestController).
export async function submitBloodRequest(
  payload: BloodRequestPayload,
): Promise<BloodRequestResponse> {
  const { data } = await api.post<ApiEnvelope<BloodRequestResponse>>(
    "/public/blood-requests",
    payload,
  );
  return data.data;
}
