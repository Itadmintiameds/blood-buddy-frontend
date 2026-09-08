import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";

export function getBloodAvailabilityKey(
  bloodGroup: string,
  bloodType: string,
): string {
  return `${bloodGroup.trim().toUpperCase()}::${bloodType.trim().toUpperCase()}`;
}

export function mergeBloodAvailabilityRows(
  rows: BloodAvailabilityItem[],
): BloodAvailabilityItem[] {
  const merged = new Map<string, BloodAvailabilityItem>();

  for (const row of rows) {
    const bloodGroup = String(row.bloodGroup ?? "").trim();
    const bloodType = String(row.bloodType ?? "").trim();
    const unitsAvailable = Number(row.unitsAvailable);

    if (!bloodGroup || !bloodType || !Number.isFinite(unitsAvailable)) {
      continue;
    }

    const key = getBloodAvailabilityKey(bloodGroup, bloodType);
    const existing = merged.get(key);

    if (existing) {
      existing.unitsAvailable += unitsAvailable;
    } else {
      merged.set(key, {
        ...row,
        bloodGroup,
        bloodType,
        unitsAvailable,
      });
    }
  }

  return Array.from(merged.values());
}
