// STUB — the backend has no mobile-OTP endpoint for donors (only email OTP
// exists, under /public/blood-centres/send-otp & verify-otp, which doesn't
// fit a mobile-based donor flow). These simulate a network round-trip so the
// UI behaves correctly; swap for real API calls once the backend adds
// donor mobile-OTP verification.

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendDonorOtp(mobileNumber: string): Promise<void> {
  void mobileNumber;
  await delay(500);
}

export async function verifyDonorOtp(otp: string): Promise<boolean> {
  await delay(500);
  return /^\d{6}$/.test(otp);
}
