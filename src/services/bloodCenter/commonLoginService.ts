"use client";

import { api } from "@/services/api/client";
import {
  saveAuthSession,
  type AuthUserType,
} from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/utils/api";
import type { ApiEnvelope } from "@/types/api.types";

export interface CommonLoginResult {
  userType: AuthUserType;
  id: number;
  email: string;
  role: string;
  accessToken: string;
}

// Backend AuthResponse (bloodbuddy.backend.dto.auth.AuthResponse).
interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  username: string;
  role: string;
  bloodCentreId: number | null;
}

// Single login endpoint for every role — SUPERADMIN and BLOOD_CENTRE accounts
// both authenticate against POST /auth/login; the role in the response
// decides where the app routes the user next.
export async function loginCommon(
  email: string,
  password: string,
): Promise<CommonLoginResult> {
  const cleanEmail = email.trim();

  try {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", {
      username: cleanEmail,
      password,
    });

    const auth = data.data;
    const role = String(auth.role ?? "").toUpperCase();
    const userType: AuthUserType =
      role === "SUPERADMIN" ? "SUPER_ADMIN" : "BLOOD_CENTRE";

    // The backend has no plain numeric user id in AuthResponse; use the
    // centre id for BLOOD_CENTRE accounts (there is exactly one Super Admin).
    const id = userType === "BLOOD_CENTRE" ? (auth.bloodCentreId ?? 0) : 1;

    saveAuthSession({
      isLoggedIn: true,
      userType,
      id,
      email: auth.username,
      role,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      loggedInAt: new Date().toISOString(),
    });

    return {
      userType,
      id,
      email: auth.username,
      role,
      accessToken: auth.accessToken,
    };
  } catch (error) {
    console.error("Login error:", error);

    throw new Error(getApiErrorMessage(error, "Invalid email or password."));
  }
}
