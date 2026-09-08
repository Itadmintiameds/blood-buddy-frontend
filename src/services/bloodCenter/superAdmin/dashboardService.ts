// SUPER ADMIN BLOOD BANK SERVICE
// The current backend API details provided do not include:
// GET  all blood banks
// PUT/PATCH update blood availability
//
// Therefore these methods currently return local/demo data.
//
// Replace these implementations with Axios API calls when
// the Super Admin backend endpoints are available.

import {
  SuperAdminBloodBank,
  UpdateBloodUnitsInput,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";

const demoBloodBanks: SuperAdminBloodBank[] = [
  {
    id: 1,
    bloodBankName: "TiaMeds Blood Centre",
    category: "Private",
    address: "JP Nagar",
    city: "Bangalore",
    phoneNumber: "8688941920",
    availability: [
      {
        id: 101,
        bloodGroup: "O+",
        bloodType: "PRBC",
        units: 10,
      },
      {
        id: 102,
        bloodGroup: "A+",
        bloodType: "Platelets",
        units: 7,
      },
      {
        id: 103,
        bloodGroup: "O-",
        bloodType: "Whole Blood",
        units: 15,
      },
    ],
  },

  {
    id: 2,
    bloodBankName: "KPR Blood Centre",
    category: "Government",
    address: "JP Nagar",
    city: "Mysuru",
    phoneNumber: "8609851919",
    availability: [
      {
        id: 201,
        bloodGroup: "B+",
        bloodType: "PRBC",
        units: 15,
      },
      {
        id: 202,
        bloodGroup: "B+",
        bloodType: "Platelets",
        units: 20,
      },
      {
        id: 203,
        bloodGroup: "AB+",
        bloodType: "FFP",
        units: 18,
      },
      {
        id: 204,
        bloodGroup: "A+",
        bloodType: "RDP",
        units: 16,
      },
      {
        id: 205,
        bloodGroup: "Blood Bombay",
        bloodType: "Whole Blood",
        units: 25,
      },
    ],
  },

  {
    id: 3,
    bloodBankName: "Royal Blood Centre",
    category: "Redcross",
    address: "5th Phase JP Nagar",
    city: "Bangalore",
    phoneNumber: "9678519128",
    availability: [
      {
        id: 301,
        bloodGroup: "A+",
        bloodType: "PRBC",
        units: 12,
      },
      {
        id: 302,
        bloodGroup: "O+",
        bloodType: "Single Donor Platelet",
        units: 8,
      },
    ],
  },
];

// GET ALL BLOOD BANKS
export async function getSuperAdminBloodBanks(): Promise<
  SuperAdminBloodBank[]
> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return structuredClone(demoBloodBanks);
}

// UPDATE BLOOD UNITS
export async function updateSuperAdminBloodUnits(
  payload: UpdateBloodUnitsInput,
): Promise<{
  success: boolean;
  message: string;
}> {
  console.log("Update Blood Units:", payload);

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: "Blood units updated successfully",
  };
}
