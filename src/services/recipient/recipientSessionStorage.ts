"use client";

const LAST_PINCODE_KEY = "recipientLastPincode";

export function saveLastRecipientPincode(pincode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_PINCODE_KEY, pincode);
}

export function getLastRecipientPincode(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(LAST_PINCODE_KEY) ?? "";
}
