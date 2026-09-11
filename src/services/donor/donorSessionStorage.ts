"use client";

import type {
  DonorAvailabilityInput,
  DonorRegistrationInput,
} from "@/types/donor/donorTypes";

// ============================================================
// STUB DONOR AUTH — the backend only exposes POST /public/donors/register
// (see donorRegistrationService.ts). There is no donor login, OTP-verify,
// or availability endpoint yet, so this file simulates all of that locally
// (localStorage / sessionStorage) so the Register -> Verify -> Login ->
// Dashboard -> Update Availability flow works end to end for a demo.
// Replace this with real API calls once the backend adds donor auth.
// ============================================================

const PENDING_REGISTRATION_KEY = "donorPendingRegistration";
const DIRECTORY_KEY = "donorLocalDirectory";
const SESSION_KEY = "donorSession";
const AVAILABILITY_KEY_PREFIX = "donorAvailability:";

export interface PendingDonorRegistration extends DonorRegistrationInput {
  bloodDonorDetailsId: number;
}

// Deferred until OTP verification "succeeds" (see DonorOtpVerificationScreen).
export function savePendingDonorRegistration(
  data: PendingDonorRegistration,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
}

export function getPendingDonorRegistration(): PendingDonorRegistration | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingDonorRegistration;
  } catch {
    return null;
  }
}

export function clearPendingDonorRegistration(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

export interface DonorDirectoryEntry {
  bloodDonorDetailsId: number;
  fullName: string;
  mobileNumber: string;
  password: string;
  bloodGroupId: number;
  address: string;
  district: string;
  city: string;
  pincode: string;
}

function readDirectory(): DonorDirectoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DIRECTORY_KEY);
    return raw ? (JSON.parse(raw) as DonorDirectoryEntry[]) : [];
  } catch {
    return [];
  }
}

// Called once OTP verification "succeeds", so the donor can log in later.
export function addDonorToLocalDirectory(entry: DonorDirectoryEntry): void {
  if (typeof window === "undefined") return;
  const directory = readDirectory().filter(
    (item) => item.mobileNumber !== entry.mobileNumber,
  );
  directory.push(entry);
  localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory));
}

export function findDonorInDirectory(
  mobileNumber: string,
  password: string,
): DonorDirectoryEntry | null {
  const match = readDirectory().find(
    (item) => item.mobileNumber === mobileNumber && item.password === password,
  );
  return match ?? null;
}

export interface DonorSession {
  bloodDonorDetailsId: number;
  fullName: string;
  mobileNumber: string;
  bloodGroupId: number;
  address: string;
  district: string;
  city: string;
  pincode: string;
  loggedInAt: string;
}

export function saveDonorSession(session: DonorSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getDonorSession(): DonorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DonorSession) : null;
  } catch {
    return null;
  }
}

export function logoutDonor(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function saveDonorAvailability(
  donorId: number,
  availability: DonorAvailabilityInput,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${AVAILABILITY_KEY_PREFIX}${donorId}`,
    JSON.stringify(availability),
  );
}

export function getDonorAvailability(
  donorId: number,
): DonorAvailabilityInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${AVAILABILITY_KEY_PREFIX}${donorId}`);
    return raw ? (JSON.parse(raw) as DonorAvailabilityInput) : null;
  } catch {
    return null;
  }
}
