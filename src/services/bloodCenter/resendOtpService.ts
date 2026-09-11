import { sendOtp } from "./otpSendService";

export async function resendOtp(email: string) {
  return sendOtp({ email });
}
