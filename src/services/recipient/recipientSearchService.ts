import type {
  NearbyBloodBank,
  NearbyDonor,
} from "@/types/recipient/receipientTypes";

// STUB — the backend has no search-by-pincode endpoint for blood banks or
// donors yet (no GET /public/search/blood-banks or /public/search/donors).
// This returns fixed sample data so the search screen is fully navigable;
// replace both functions with real API calls once the backend adds search.

const SAMPLE_BLOOD_BANKS: NearbyBloodBank[] = [
  {
    id: 1,
    name: "Chandrakala Blood Bank",
    bloodGroup: "O+",
    unitsAvailable: 10,
    address: "123 Main Street, City",
    mobileNumber: "9876543210",
    pincode: "570001",
  },
  {
    id: 2,
    name: "Dipak Blood Bank",
    bloodGroup: "A+",
    unitsAvailable: 5,
    address: "123 Main Street, City",
    mobileNumber: "9876543211",
    pincode: "570001",
  },
  {
    id: 3,
    name: "St. Joseph's Blood Centre",
    bloodGroup: "B+",
    unitsAvailable: 7,
    address: "Bannimantap, City",
    mobileNumber: "9876543212",
    pincode: "570015",
  },
];

const SAMPLE_DONORS: NearbyDonor[] = [
  {
    id: 1,
    fullName: "Amit Sharma",
    bloodGroup: "O+",
    mobileNumber: "9876543210",
    pincode: "570001",
    available: true,
  },
  {
    id: 2,
    fullName: "Rahul Sharma",
    bloodGroup: "A+",
    mobileNumber: "9876543211",
    pincode: "570001",
    available: true,
  },
  {
    id: 3,
    fullName: "Priya Menon",
    bloodGroup: "B+",
    mobileNumber: "9876543212",
    pincode: "570015",
    available: false,
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The pincode isn't actually used to filter — it's sample data standing in
// for a real search, and filtering fake records against whatever pincode the
// recipient happens to type (e.g. their own request's pincode, which the
// search screen pre-fills) would just show "no results" every time. Once the
// backend adds real search-by-pincode endpoints, wire the pincode through
// for real instead of dropping it.
export async function searchNearbyBloodBanks(
  pincode: string,
): Promise<NearbyBloodBank[]> {
  void pincode;
  await delay(400);
  return SAMPLE_BLOOD_BANKS;
}

export async function searchNearbyDonors(
  pincode: string,
): Promise<NearbyDonor[]> {
  void pincode;
  await delay(400);
  return SAMPLE_DONORS;
}
