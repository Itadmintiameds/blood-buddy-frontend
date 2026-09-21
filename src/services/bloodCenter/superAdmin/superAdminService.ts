"use client";

import { api } from "@/utils/api";

export interface SuperAdminRegistrationRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  retypePassword: string;
  role: "SUPERADMIN";
}

export interface SuperAdminRegistrationResponse {
  message: string;
}

export async function registerSuperAdmin(
  payload: SuperAdminRegistrationRequest,
): Promise<SuperAdminRegistrationResponse> {
  const response = await api.post<SuperAdminRegistrationResponse>(
    "/superadmin/adduser",
    payload,
  );

  return response.data;
}
