"use client";

// STUB SESSION — the backend has no recipient login/OTP endpoint, so a
// verified "session" here just means the mobile-OTP step was completed
// locally (see recipientOtpService.ts). Replace with a real session once
// the backend adds recipient authentication.

const SESSION_KEY = "recipientSession";

export interface RecipientSession {
  mobileNumber: string;
  verifiedAt: string;
}

export function saveRecipientSession(mobileNumber: string): void {
  if (typeof window === "undefined") return;
  const session: RecipientSession = {
    mobileNumber,
    verifiedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getRecipientSession(): RecipientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as RecipientSession) : null;
  } catch {
    return null;
  }
}

export function logoutRecipient(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

const LAST_PINCODE_KEY = "recipientLastPincode";

export function saveLastRecipientPincode(pincode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_PINCODE_KEY, pincode);
}

export function getLastRecipientPincode(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(LAST_PINCODE_KEY) ?? "";
}
