import { z } from "zod";

export const otpVerifySchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
});
