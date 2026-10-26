import { api } from "@/services/api/client";
import type { ApiEnvelope, ConsentForm } from "@/types/api.types";
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

// GET /public/blood-requests/consent — the active recipient consent wording.
// Its version must be sent back as `consentVersion` when submitting.
export async function getRecipientConsentForm(): Promise<ConsentForm> {
  const { data } = await api.get<ApiEnvelope<ConsentForm>>(
    "/public/blood-requests/consent",
  );
  return data.data;
}
