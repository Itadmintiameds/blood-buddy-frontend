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

// Super Admin Registration
export async function registerSuperAdmin(
  payload: SuperAdminRegistrationRequest,
): Promise<SuperAdminRegistrationResponse> {
  try {
    const response = await api.post<SuperAdminRegistrationResponse>(
      "/v1/superadmin/adduser",
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Super Admin Registration Error:", error);

    throw error;
  }
}

// Super Admin Login
export async function loginSuperAdmin(
  payload: SuperAdminLoginRequest,
): Promise<SuperAdminLoginResponse> {
  try {
    const response = await api.post<SuperAdminLoginResponse>(
      "/v1/superadmin/login",
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Super Admin Login Error:", error);

    throw error;
  }
}
