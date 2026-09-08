import { sendOtp } from "./otpSendService";

export async function resendOtp(mobileNumber: string) {
  return sendOtp({ mobileNumber });
}
