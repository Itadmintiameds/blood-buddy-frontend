import { z } from "zod";
import type {
  BloodCentreCategory,
  BloodCentreRegistrationInput,
} from "@/types/bloodCenter/bloodCenterTypes";

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

const categorySchema = z.enum(
  ["Government", "Private", "Charitable", "Redcross"] as const,
  {
    error: "Please select a category",
  },
);

function isFutureDate(value: string) {
  const date = new Date(`${value}T23:59:59`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export const bloodCentreRegistrationSchema = z
  .object({
    bloodCentreName: z
      .string()
      .trim()
      .min(2, "Blood Centre Name must be at least 2 characters")
      .max(100, "Blood Centre Name must not exceed 100 characters")
      .regex(
        /^[A-Za-z][A-Za-z .&'-]*$/,
        "Use letters, spaces, &, apostrophe or hyphen only",
      ),
    licenseNumber: z
      .string()
      .trim()
      .min(16, "License Number must be at least 16 characters")
      .max(30, "License Number must not exceed 30 characters")
      .regex(/^[A-Za-z0-9][A-Za-z0-9./_-]*$/, "Enter a valid license number"),
    category: categorySchema,
    dateOfExpiry: z
      .string()
      .trim()
      .min(1, "Date of Expiry is required")
      .refine(isFutureDate, "Date of Expiry must be today or a future date"),
    email: z
      .string()
      .trim()
      .min(1, "Email Address is required")
      .max(254, "Email Address is too long")
      .email("Enter a valid email address"),
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^\d+$/, "Mobile number must contain digits only")
      .length(10, "Mobile number must be exactly 10 digits")
      .refine(isValidIndianMobile, "Enter a valid mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must not exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      )
      .refine((value) => !/\s/.test(value), "Password must not contain spaces"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must not exceed 200 characters")
      .refine((value) => /[A-Za-z0-9]/.test(value), "Enter a valid address"),
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
    pinCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Pin Code must be exactly 6 digits")
      .refine((value) => !/^0+$/.test(value), "Enter a valid Pin Code"),
    latitude: z.string().trim().refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -90 && parsed <= 90;
    }, "Enter a valid latitude (-90 to 90)"),
    longitude: z.string().trim().refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -180 && parsed <= 180;
    }, "Enter a valid longitude (-180 to 180)"),
    locationUrl: z
      .string()
      .trim()
      .min(1, "Location URL is required")
      .url("Enter a valid URL"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export function normalizeBloodCentreForm(
  data: BloodCentreRegistrationInput,
): BloodCentreRegistrationInput {
  return {
    bloodCentreName: data.bloodCentreName.trim().replace(/\s+/g, " "),
    licenseNumber: data.licenseNumber.trim().toUpperCase(),
    category: data.category as BloodCentreCategory,
    dateOfExpiry: data.dateOfExpiry.trim(),
    email: data.email.trim().toLowerCase(),
    mobileNumber: data.mobileNumber.replace(/\D/g, "").slice(-10),
    password: data.password,
    confirmPassword: data.confirmPassword,
    address: data.address.trim().replace(/\s+/g, " "),
    district: data.district.trim().replace(/\s+/g, " "),
    city: data.city.trim().replace(/\s+/g, " "),
    pinCode: data.pinCode.replace(/\D/g, "").slice(0, 6),
    latitude: data.latitude.trim(),
    longitude: data.longitude.trim(),
    locationUrl: data.locationUrl.trim(),
  };
}
