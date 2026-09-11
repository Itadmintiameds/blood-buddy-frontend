import { z } from "zod";
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

export const donorRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full Name must be at least 2 characters")
      .max(100, "Full Name must not exceed 100 characters")
      .regex(/^[A-Za-z][A-Za-z .'-]*$/, "Use letters, spaces, apostrophe or hyphen only"),
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^\d+$/, "Mobile number must contain digits only")
      .length(10, "Mobile number must be exactly 10 digits")
      .refine(isValidIndianMobile, "Enter a valid mobile number"),
    bloodGroupId: z
      .union([z.number(), z.literal("")])
      .refine((value) => value !== "", { message: "Please select a blood group" }),
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
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must not exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .refine((value) => !/\s/.test(value), "Password must not contain spaces"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
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

export function normalizeDonorForm(
  data: DonorRegistrationInput,
): DonorRegistrationInput {
  return {
    fullName: data.fullName.trim().replace(/\s+/g, " "),
    mobileNumber: data.mobileNumber.replace(/\D/g, "").slice(-10),
    bloodGroupId: data.bloodGroupId,
    address: data.address.trim().replace(/\s+/g, " "),
    district: data.district.trim().replace(/\s+/g, " "),
    city: data.city.trim().replace(/\s+/g, " "),
    pincode: data.pincode.replace(/\D/g, "").slice(0, 6),
    password: data.password,
    confirmPassword: data.confirmPassword,
  };
}
