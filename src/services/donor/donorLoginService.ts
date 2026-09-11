import {
  findDonorInDirectory,
  saveDonorSession,
  type DonorSession,
} from "@/services/donor/donorSessionStorage";

// STUB — the backend has no donor login endpoint yet, so this checks the
// donor against the local directory populated at registration time (see
// donorSessionStorage.ts). Replace with a real POST /public/donors/login
// (or /auth/login) call once the backend supports donor authentication.
export async function loginDonor(
  mobileNumber: string,
  password: string,
): Promise<DonorSession> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const match = findDonorInDirectory(mobileNumber, password);

  if (!match) {
    throw new Error("Invalid mobile number or password.");
  }

  const session: DonorSession = {
    bloodDonorDetailsId: match.bloodDonorDetailsId,
    fullName: match.fullName,
    mobileNumber: match.mobileNumber,
    bloodGroupId: match.bloodGroupId,
    address: match.address,
    district: match.district,
    city: match.city,
    pincode: match.pincode,
    loggedInAt: new Date().toISOString(),
  };

  saveDonorSession(session);

  return session;
}
