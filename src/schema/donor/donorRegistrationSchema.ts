import { z } from "zod";
import { requiredSelectionId } from "@/schema/selectionSchema";
import type { DonorRegistrationInput } from "@/types/donor/donorTypes";

const knownInvalidMobileNumbers = new Set([
  "0000000000",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "6666666666",
  "7777777777",
  "8888888888",
  "9999999999",
  "1234567890",
  "0123456789",
  "9876543210",
  "0987654321",
]);

function isValidIndianMobile(value: string) {
  if (!/^[6-9]\d{9}$/.test(value)) return false;
  if (knownInvalidMobileNumbers.has(value)) return false;
  if (/(\d)\1{3,}/.test(value)) return false;
  if (/^(\d{1,2})\1+$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const ascending = digits.every((n, i) => i === 0 || n === digits[i - 1] + 1);
  const descending = digits.every((n, i) => i === 0 || n === digits[i - 1] - 1);
  return !ascending && !descending;
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isAtLeast18YearsOld(value: string): boolean {
  const dob = parseIsoDate(value);
  if (!dob) return false;

  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  return dob <= eighteenYearsAgo;
}

function isNotFutureDate(value: string): boolean {
  const date = parseIsoDate(value);
  if (!date) return false;
  return date.getTime() <= Date.now();
}

export const MIN_DONOR_AGE_YEARS = 18;
export const MAX_DONOR_AGE_YEARS = 65;

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Earliest / latest date of birth the Date of Birth picker should offer, as
// YYYY-MM-DD for the <input type="date"> min / max attributes. Mirrors the
// schema: at least 18 and strictly under 65 years old.
export function getDonorDobBounds(): { min: string; max: string } {
  const today = new Date();

  // Born exactly 65 years ago today = turned 65 today, which is not "under 65",
  // so the earliest allowed date is the day after.
  const earliest = new Date(
    today.getFullYear() - MAX_DONOR_AGE_YEARS,
    today.getMonth(),
    today.getDate() + 1,
  );
  const latest = new Date(
    today.getFullYear() - MIN_DONOR_AGE_YEARS,
    today.getMonth(),
    today.getDate(),
  );

  return { min: toIsoDate(earliest), max: toIsoDate(latest) };
}

function isUnder65YearsOld(value: string): boolean {
  const dob = parseIsoDate(value);
  if (!dob) return false;

  const today = new Date();
  const sixtyFiveYearsAgo = new Date(
    today.getFullYear() - MAX_DONOR_AGE_YEARS,
    today.getMonth(),
    today.getDate(),
  );

  return dob > sixtyFiveYearsAgo;
}

export const donorRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full Name must be at least 2 characters")
      .max(100, "Full Name must not exceed 100 characters")
      .regex(
        /^[A-Za-z][A-Za-z .'-]*$/,
        "Use letters, spaces, apostrophe or hyphen only",
      ),
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^\d+$/, "Mobile number must contain digits only")
      .length(10, "Mobile number must be exactly 10 digits")
      .refine(isValidIndianMobile, "Enter a valid mobile number"),
    alternativeMobileNumber: z
      .string()
      .trim()
      .regex(/^\d*$/, "Alternate mobile number must contain digits only")
      .refine(
        (value) => value === "" || value.length === 10,
        "Alternate mobile number must be exactly 10 digits",
      )
      .optional()
      .or(z.literal("")),
    bloodGroupId: requiredSelectionId("Please select a blood group"),
    dob: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .refine((value) => parseIsoDate(value) !== null, "Enter a valid date")
      .refine(isNotFutureDate, "Date of birth cannot be in the future")
      .refine(isAtLeast18YearsOld, "Donor must be at least 18 years old")
      .refine(isUnder65YearsOld, "Donor must be younger than 65 years"),
    address: z
      .string()
      .trim()
      .max(200, "Address must not exceed 200 characters")
      .optional()
      .or(z.literal("")),
    district: z
      .string()
      .trim()
      .min(2, "District is required")
      .max(100, "District must not exceed 100 characters")
      .regex(/^[A-Za-z][A-Za-z .'-]*$/, "District must contain letters only"),
    city: z
      .string()
      .trim()
      .min(2, "City is required")
      .max(100, "City must not exceed 100 characters")
      .regex(/^[A-Za-z][A-Za-z .'-]*$/, "City must contain letters only"),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
      .refine((value) => !/^0+$/.test(value), "Enter a valid pincode"),
    lastBloodDonationDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || parseIsoDate(value) !== null,
        "Enter a valid date",
      )
      .refine(
        (value) => value === "" || isNotFutureDate(value),
        "Last donation date cannot be in the future",
      )
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (
      data.alternativeMobileNumber &&
      data.alternativeMobileNumber === data.mobileNumber
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["alternativeMobileNumber"],
        message: "Alternate mobile number must be different from mobile number",
      });
    }
  });

export function normalizeDonorForm(
  data: DonorRegistrationInput,
): DonorRegistrationInput {
  return {
    fullName: data.fullName.trim().replace(/\s+/g, " "),
    mobileNumber: data.mobileNumber.replace(/\D/g, "").slice(-10),
    alternativeMobileNumber: data.alternativeMobileNumber
      .replace(/\D/g, "")
      .slice(-10),
    bloodGroupId: data.bloodGroupId,
    dob: data.dob.trim(),
    address: data.address.trim().replace(/\s+/g, " "),
    district: data.district.trim().replace(/\s+/g, " "),
    city: data.city.trim().replace(/\s+/g, " "),
    pincode: data.pincode.replace(/\D/g, "").slice(0, 6),
    lastBloodDonationDate: data.lastBloodDonationDate.trim(),
  };
}
