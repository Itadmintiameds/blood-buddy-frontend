// STUB — same situation as donorOtpService.ts: no mobile-OTP endpoint exists
// for recipients on the backend yet. Simulates the round-trip so the UI
// flow behaves correctly; swap for real API calls once the backend adds it.

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendRecipientOtp(mobileNumber: string): Promise<void> {
  void mobileNumber;
  await delay(500);
}

export async function verifyRecipientOtp(otp: string): Promise<boolean> {
  await delay(500);
  return /^\d{6}$/.test(otp);
}
