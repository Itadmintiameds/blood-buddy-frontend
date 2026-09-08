export type BloodCentreCategory =
  | "Government"
  | "Private"
  | "Charitable"
  | "Redcross";

export interface BloodCentreRegistrationInput {
  bloodCentreName: string;
  licenseNumber: string;
  category: BloodCentreCategory | "";
  dateOfExpiry: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  address: string;
  district: string;
  city: string;
  pinCode: string;
}

export interface BloodCentreRegistrationPayload {
  bloodCentreName: string;
  licenseNumber: string;
  category: BloodCentreCategory;
  dateOfExpiry: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  address: string;
  district: string;
  city: string;
  pincode: string;
}

export interface RegistrationResponse {
  success?: boolean;
  message?: string;
  otpRequired?: boolean;
  data?: object;
}

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface SendOtpResponse {
  success?: boolean;
  message?: string;
  data?: object;
}

export interface OtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface OtpResponse {
  message?: string;
  success?: boolean;
}

export interface OtpVerificationResponse {
  success?: boolean;
  verified?: boolean;
  message?: string;
  data?: object;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  email: string;
  data?: object;
}

export interface AvailabilityPayload {
  bloodGroup: string;
  units: number;
}

/* ============================================================
   BLOOD AVAILABILITY
============================================================ */

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
  "Bombay Group",
] as const;

export const BLOOD_TYPES = [
  "PRBC",
  "Platelets",
  "RDP (Random Donor Platelets)",
  "FFP (Fresh Frozen Plasma)",
  "Whole Blood",
  "Cryoprecipitate",
  "Single Donor Platelet",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type BloodType = (typeof BLOOD_TYPES)[number];

export interface BloodAvailabilityPayload {
  bloodGroup: BloodGroup;
  bloodType: BloodType;
  units: number;
}

export interface BloodAvailabilityItem {
  id?: string | number;
  bloodGroup: string;
  bloodType: string;
  unitsAvailable: number;
}

export interface BloodAvailabilityResponse {
  message?: string;
  success?: boolean;
  data?: BloodAvailabilityItem;
}

export interface AddAvailabilityPayload {
  bloodGroup: BloodGroup;
  bloodType: BloodType;
  unitsAvailable: number;
}

export interface ApiTextResponse {
  success?: boolean;
  message?: string;
}

export interface PasswordResetPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
