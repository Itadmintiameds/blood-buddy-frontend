import { api } from "@/utils/api";

export interface BloodCentreLoginPayload {
  email: string;
  password: string;
}

export interface BloodCentreLoginResponse {
  message: string;
  id: number;
  email: string;
  accessToken: string;
}

// Blood Centre Login
export async function loginBloodCentre(
  payload: BloodCentreLoginPayload,
): Promise<BloodCentreLoginResponse> {
  const response = await api.post<BloodCentreLoginResponse>(
    "/v1/login/mail-password",
    payload,
  );

  return response.data;
}
