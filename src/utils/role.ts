import { UserRole } from "@/types/authTypes";

export function normalizeRole(role?: string | null): UserRole {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();

  if (
    normalized === "SUPER_ADMIN" ||
    normalized === "SUPERADMIN" ||
    normalized === "ADMIN"
  ) {
    return "SUPERADMIN";
  }

  if (
    normalized === "BLOOD_CENTRE" ||
    normalized === "BLOOD_CENTER" ||
    normalized === "BLOODBANK"
  ) {
    return "BLOOD_CENTRE";
  }

  return "USER";
}

export function isSuperAdmin(role?: string | null) {
  return normalizeRole(role) === "SUPERADMIN";
}
