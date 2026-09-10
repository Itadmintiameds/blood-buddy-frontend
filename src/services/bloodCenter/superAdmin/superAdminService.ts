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

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  loginSuccessful: string;
  id: number;
  name: string;
  email: string;
  role: string;
  accessToken: string;
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

export async function loginSuperAdmin(
  payload: SuperAdminLoginRequest,
): Promise<SuperAdminLoginResponse> {
  const response = await api.post<SuperAdminLoginResponse>(
    "/superadmin/login",
    payload,
  );

  return response.data;
}
