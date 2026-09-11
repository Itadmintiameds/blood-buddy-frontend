import { z } from "zod";
import type { RecipientRequestInput } from "@/types/recipient/receipientTypes";

function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

export const recipientRequestSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name must not exceed 100 characters")
    .regex(/^[A-Za-z][A-Za-z .'-]*$/, "Use letters, spaces, apostrophe or hyphen only"),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, "Mobile number must contain digits only")
    .length(10, "Mobile number must be exactly 10 digits")
    .refine(isValidIndianMobile, "Enter a valid mobile number"),
  bloodGroupId: z
    .union([z.number(), z.literal("")])
    .refine((value) => value !== "", { message: "Please select a blood group" }),
  bloodComponentId: z
    .union([z.number(), z.literal("")])
    .refine((value) => value !== "", { message: "Please select the blood type required" }),
  requiredUnits: z
    .string()
    .trim()
    .min(1, "Units required is required")
    .regex(/^\d+$/, "Enter a valid number of units")
    .refine((value) => Number(value) >= 1 && Number(value) <= 999, {
      message: "Enter units between 1 and 999",
    }),
  hospitalName: z
    .string()
    .trim()
    .max(150, "Hospital name must not exceed 150 characters")
    .optional()
    .or(z.literal("")),
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
});

export function normalizeRecipientForm(
  data: RecipientRequestInput,
): RecipientRequestInput {
  return {
    patientName: data.patientName.trim().replace(/\s+/g, " "),
    mobileNumber: data.mobileNumber.replace(/\D/g, "").slice(-10),
    bloodGroupId: data.bloodGroupId,
    bloodComponentId: data.bloodComponentId,
    requiredUnits: data.requiredUnits.replace(/\D/g, ""),
    hospitalName: data.hospitalName.trim().replace(/\s+/g, " "),
    address: data.address.trim().replace(/\s+/g, " "),
    district: data.district.trim().replace(/\s+/g, " "),
    city: data.city.trim().replace(/\s+/g, " "),
    pincode: data.pincode.replace(/\D/g, "").slice(0, 6),
  };
}
