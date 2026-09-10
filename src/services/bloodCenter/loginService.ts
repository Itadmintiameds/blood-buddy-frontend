"use client";

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

export async function loginBloodCentre(
  payload: BloodCentreLoginPayload,
): Promise<BloodCentreLoginResponse> {
  const response = await api.post<BloodCentreLoginResponse>(
    "/login/mail-password",
    payload,
  );

  return response.data;
}
