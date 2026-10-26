import { api } from "@/services/api/client";
import type { ApiEnvelope, ConsentForm } from "@/types/api.types";
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

// GET /public/donors/consent — the active donor consent wording. Its version
// must be sent back as `consentVersion` when registering.
export async function getDonorConsentForm(): Promise<ConsentForm> {
  const { data } = await api.get<ApiEnvelope<ConsentForm>>(
    "/public/donors/consent",
  );
  return data.data;
}
