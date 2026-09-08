export const BLOOD_TYPES = [
  "PRBC",
  "Platelets",
  "RDP",
  "FFP",
  "Whole blood",
  "Cryoprecipitate",
  "Single Donor Platelet",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

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

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const BLOOD_CATEGORIES = [
  "Government",
  "Private",
  "Charitable",
  "Redcross",
] as const;

export type BloodCategory = (typeof BLOOD_CATEGORIES)[number];

export interface Availability {
  id?: number;
  bloodGroup: string;
  bloodType: string;
  bloodCategory?: string;
  unitsAvailable: number;

  bloodCentreName?: string;
  address?: string;
  city?: string;
  mobileNumber?: string;
}

export interface AddAvailabilityPayload {
  bloodGroup: string;
  bloodType: string;
  unitsAvailable: number;
}
