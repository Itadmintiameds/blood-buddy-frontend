export type SuperAdminSection = "blood-bank" | "donor" | "recipient";

export interface BloodAvailability {
  id: number;
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
  units: number;
}
