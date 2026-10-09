import { z } from "zod";
import { requiredSelectionId } from "@/schema/selectionSchema";
import type { RecipientRequestInput } from "@/types/recipient/receipientTypes";

function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

export const MAX_RECIPIENT_AGE_YEARS = 100;

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
  bloodGroupId: requiredSelectionId("Please select a blood group"),
  bloodComponentId: requiredSelectionId(
    "Please select the blood component required",
  ),
  requiredUnits: z
    .string()
    .trim()
    .min(1, "Units required is required")
    .regex(/^\d+$/, "Enter a valid number of units")
    .refine((value) => Number(value) >= 1 && Number(value) <= 999, {
      message: "Enter units between 1 and 999",
    }),
  age: z
    .string()
    .trim()
    .min(1, "Age is required")
    .regex(/^\d+$/, "Enter the age in whole years")
    .refine((value) => Number(value) <= MAX_RECIPIENT_AGE_YEARS, {
      message: `Enter an age between 0 and ${MAX_RECIPIENT_AGE_YEARS}`,
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
    .max(200, "Hospital address must not exceed 200 characters")
    .optional()
    .or(z.literal("")),
  district: z
    .string()
    .trim()
    .min(2, "Hospital district is required")
    .max(100, "Hospital district must not exceed 100 characters")
    .regex(
      /^[A-Za-z][A-Za-z .'-]*$/,
      "Hospital district must contain letters only",
    ),
  city: z
    .string()
    .trim()
    .min(2, "Hospital city is required")
    .max(100, "Hospital city must not exceed 100 characters")
    .regex(/^[A-Za-z][A-Za-z .'-]*$/, "Hospital city must contain letters only"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .refine((value) => !/^0+$/.test(value), "Enter a valid pincode"),
});

// Maximum units a single request may ask for, by blood component. Matched
// against the master component name (case-insensitive). Returns null for
// components with no ceiling (SDP) or any name we don't recognise.
//   PRBC 6 · Whole Blood 3 · Platelets 12 · Frozen Plasma 12 · SDP no limit
export function getComponentUnitLimit(
  componentName: string | null | undefined,
): number | null {
  if (!componentName) {
    return null;
  }

  const name = componentName.toLowerCase();

  if (name.includes("prbc") || name.includes("packed red")) {
    return 6;
  }
  if (name.includes("whole blood")) {
    return 3;
  }
  // SDP (Single Donor Platelets) has no limit — check it before "platelet" so
  // its name doesn't get caught by the Platelets rule.
  if (name.includes("sdp") || name.includes("single donor")) {
    return null;
  }
  if (name.includes("platelet")) {
    return 12;
  }
  if (name.includes("plasma")) {
    return 12;
  }

  return null;
}

// The base schema plus a per-component ceiling on `requiredUnits`. Pass a map of
// componentId → { name, max } built from the loaded master list; ids absent
// from the map (e.g. SDP) are left uncapped. Falls back to the base schema when
// no limits are known yet (masters still loading).
export function makeRecipientRequestSchema(
  componentLimits?: Map<number, { name: string; max: number }>,
) {
  if (!componentLimits || componentLimits.size === 0) {
    return recipientRequestSchema;
  }

  return recipientRequestSchema.superRefine((data, ctx) => {
    const componentId =
      typeof data.bloodComponentId === "number"
        ? data.bloodComponentId
        : Number(data.bloodComponentId);

    if (!componentId) {
      return;
    }

    const limit = componentLimits.get(componentId);

    if (!limit) {
      return;
    }

    const units = Number(data.requiredUnits);

    if (Number.isFinite(units) && units > limit.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiredUnits"],
        message: `Maximum ${limit.max} units allowed for ${limit.name}`,
      });
    }
  });
}

// Builds the componentId → { name, max } map the schema expects from a master
// component list, skipping components that have no ceiling.
export function buildComponentLimits(
  components: { bloodComponentId: number; bloodComponentName: string }[],
): Map<number, { name: string; max: number }> {
  const map = new Map<number, { name: string; max: number }>();

  for (const component of components) {
    const max = getComponentUnitLimit(component.bloodComponentName);

    if (max != null) {
      map.set(component.bloodComponentId, {
        name: component.bloodComponentName,
        max,
      });
    }
  }

  return map;
}

export function normalizeRecipientForm(
  data: RecipientRequestInput,
): RecipientRequestInput {
  return {
    patientName: data.patientName.trim().replace(/\s+/g, " "),
    mobileNumber: data.mobileNumber.replace(/\D/g, "").slice(-10),
    bloodGroupId: data.bloodGroupId,
    bloodComponentId: data.bloodComponentId,
    requiredUnits: data.requiredUnits.replace(/\D/g, ""),
    age: data.age.replace(/\D/g, ""),
    hospitalName: data.hospitalName.trim().replace(/\s+/g, " "),
    address: data.address.trim().replace(/\s+/g, " "),
    district: data.district.trim().replace(/\s+/g, " "),
    city: data.city.trim().replace(/\s+/g, " "),
    pincode: data.pincode.replace(/\D/g, "").slice(0, 6),
  };
}
