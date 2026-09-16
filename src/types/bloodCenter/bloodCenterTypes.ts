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

// Sent to POST /public/blood-centres/register (bloodbuddy.backend.dto.centre.BloodCentreRegistrationRequest).
export interface BloodCentreRegistrationPayload {
  bloodCentreName: string;
  bloodBankCategory: BloodCentreCategory;
  bloodCentreLicenceNumber: string;
  licenceExpiryDate: string;
  email: string;
  mobileNumber: string;
  password: string;
  address: string;
  district: string;
  city: string;
  pincode: string;
}

export interface BloodCentreRegistrationResponse {
  bloodCentreId: number;
  bloodCentreName: string;
  username: string;
  email: string;
  role: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/* ============================================================
   BLOOD AVAILABILITY
============================================================ */

export interface BloodAvailabilityItem {
  id?: string | number;
  bloodGroup: string;
  bloodType: string;
  unitsAvailable: number;
}

// Sent to POST /inventory/add-availability (bloodbuddy.backend.dto.inventory.AddAvailabilityRequest).
export interface AddAvailabilityPayload {
  bloodGroupId: number;
  bloodComponentId: number;
  units: number;
  remarks?: string;
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

/* ============================================================
   FORGOT PASSWORD
============================================================ */

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

/*
 * Kept for compatibility with any existing code that may still
 * import PasswordResetPayload.
 */
export interface PasswordResetPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
