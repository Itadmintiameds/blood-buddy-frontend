/** Return only the 10-digit Indian mobile number used by registration. */
export function normalizeIndianMobile10(value: string): string {
  return value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

/** Return +91XXXXXXXXXX used by OTP send/verify APIs. */
export function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return value.trim();
}
