import type { BloodCentreRegistrationPayload } from "@/types/bloodCenter/bloodCenterTypes";

// Backend gates blood-centre registration on a prior verified email OTP, so
// the form's payload is stashed here after "Send OTP" and only actually
// submitted to POST /public/blood-centres/register once the OTP screen
// confirms the code. See BloodCentreService.register / EmailVerificationService.
export const PENDING_REGISTRATION_KEY = "bloodCentrePendingRegistration";

export function savePendingRegistration(
  payload: BloodCentreRegistrationPayload,
): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(payload));
}

export function getPendingRegistration(): BloodCentreRegistrationPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BloodCentreRegistrationPayload;
  } catch {
    return null;
  }
}

export function clearPendingRegistration(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}
