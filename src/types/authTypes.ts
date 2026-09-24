export type UserRole =
  | "SUPERADMIN"
  | "BLOOD_CENTRE"
  | "BLOOD_BANK"
  | "USER"
  | null;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  role?: string | null;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  email?: string;
  role?: string | null;
}

export interface SuperAdminLoginResponse {
  loginSuccessful: string;
  id: number;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

export interface BloodCentreLoginResponse {
  message: string;
  email: string;
}

export interface SuperAdminRegistrationRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  retypePassword: string;
  role: "SUPERADMIN";
}

export interface SuperAdminRegistrationResponse {
  message: string;
}

export type AuthUserType = "SUPER_ADMIN" | "BLOOD_CENTRE";

export interface SuperAdminSession {
  userType: "SUPER_ADMIN";
  isLoggedIn: true;
  id: number;
  name: string;
  email: string;
  role: "SUPERADMIN";
  accessToken: string;
  loggedInAt: string;
}

export interface BloodCentreSession {
  userType: "BLOOD_CENTRE";
  isLoggedIn: true;
  id: number;
  email: string;
  accessToken: string;
  loggedInAt: string;
}

export type AuthSession = SuperAdminSession | BloodCentreSession;
