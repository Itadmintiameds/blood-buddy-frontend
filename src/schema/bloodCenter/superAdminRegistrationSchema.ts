import { z } from "zod";

export const superAdminRegistrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .regex(/^[A-Za-z\s.'-]+$/, "Name can contain only letters"),

    email: z.string().trim().email("Enter a valid email address"),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/\d/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
      .refine((value) => !/\s/.test(value), "Password cannot contain spaces"),

    retypePassword: z.string(),

    role: z.literal("SUPERADMIN"),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords do not match",
    path: ["retypePassword"],
  });

export type SuperAdminRegistrationForm = z.infer<
  typeof superAdminRegistrationSchema
>;
