export type SuperAdminSection = "blood-bank" | "donor" | "recipient";

export interface BloodAvailability {
  id: number;
  bloodGroupId: number;
  bloodComponentId: number;
  bloodGroup: string;
  bloodType: string;
  units: number;
}

export interface SuperAdminBloodBank {
  id: number;
  bloodBankName: string;
  category: string;
  address: string;
  city: string;
  phoneNumber: string;
  availability: BloodAvailability[];
}

export interface UpdateBloodUnitsInput {
  bloodBankId: number;
  availabilityId: number;
  bloodGroupId: number;
  bloodComponentId: number;
  previousUnits: number;
  units: number;
}

export interface SuperAdminDonor {
  id: number;
  donorName: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  bloodGroupId: number;
  bloodGroup: string;
  dateOfBirth: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate: string | null;
  createdAt: string;
}
