"use client";

import { loginBloodCentre } from "@/services/bloodCenter/bloodCenter.service";
import { loginSuperAdmin } from "@/services/bloodCenter/superAdmin/superAdminService";
import {
  saveAuthSession,
  type AuthUserType,
} from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/utils/api";

export interface CommonLoginResult {
  userType: AuthUserType;
  id: number;
  name?: string;
  email: string;
  role?: string;
  accessToken: string;
}

// Common Login
export async function loginCommon(
  email: string,
  password: string,
): Promise<CommonLoginResult> {
  const cleanEmail = email.trim();

  // 1. Super Admin Login

  try {
    const superAdminResponse = await loginSuperAdmin({
      email: cleanEmail,
      password,
    });

    console.log("Super Admin Login Response:", superAdminResponse);

    const isValidSuperAdmin =
      superAdminResponse &&
      Number.isFinite(Number(superAdminResponse.id)) &&
      String(superAdminResponse.role).toUpperCase() === "SUPERADMIN" &&
      typeof superAdminResponse.accessToken === "string" &&
      superAdminResponse.accessToken.length > 0;

    if (isValidSuperAdmin) {
      const session = {
        isLoggedIn: true as const,
        userType: "SUPER_ADMIN" as const,
        id: Number(superAdminResponse.id),
        name: superAdminResponse.name,
        email: superAdminResponse.email,
        role: "SUPERADMIN",
        accessToken: superAdminResponse.accessToken,
        loggedInAt: new Date().toISOString(),
      };

      saveAuthSession(session);

      return {
        userType: "SUPER_ADMIN",
        id: Number(superAdminResponse.id),
        name: superAdminResponse.name,
        email: superAdminResponse.email,
        role: "SUPERADMIN",
        accessToken: superAdminResponse.accessToken,
      };
    }
  } catch (superAdminError) {
    console.log(
      "Super Admin login failed. Trying Blood Centre login...",
      superAdminError,
    );
  }

  // 2. Blood Centre Login

  try {
    const bloodCentreResponse = await loginBloodCentre({
      email: cleanEmail,
      password,
    });

    console.log("Blood Centre Login Response:", bloodCentreResponse);

    if (
      !bloodCentreResponse ||
      !bloodCentreResponse.email ||
      !bloodCentreResponse.accessToken
    ) {
      throw new Error("Invalid Blood Centre login response.");
    }

    const session = {
      isLoggedIn: true as const,
      userType: "BLOOD_CENTRE" as const,
      id: Number(bloodCentreResponse.id),
      email: bloodCentreResponse.email,
      accessToken: bloodCentreResponse.accessToken,
      loggedInAt: new Date().toISOString(),
    };

    saveAuthSession(session);

    return {
      userType: "BLOOD_CENTRE",
      id: Number(bloodCentreResponse.id),
      email: bloodCentreResponse.email,
      accessToken: bloodCentreResponse.accessToken,
    };
  } catch (bloodCentreError) {
    console.error("Blood Centre login failed:", bloodCentreError);

    throw new Error(
      getApiErrorMessage(bloodCentreError, "Invalid email or password."),
    );
  }
}
