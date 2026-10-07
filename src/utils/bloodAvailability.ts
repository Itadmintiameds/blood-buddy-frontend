import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";

export function getBloodAvailabilityKey(
  bloodGroup: string,
  bloodComponent: string,
): string {
  return `${bloodGroup.trim().toUpperCase()}::${bloodComponent.trim().toUpperCase()}`;
}

export function mergeBloodAvailabilityRows(
  rows: BloodAvailabilityItem[],
): BloodAvailabilityItem[] {
  const merged = new Map<string, BloodAvailabilityItem>();

  for (const row of rows) {
    const bloodGroup = String(row.bloodGroup ?? "").trim();
    const bloodComponent = String(row.bloodComponent ?? "").trim();
    const unitsAvailable = Number(row.unitsAvailable);

    if (!bloodGroup || !bloodComponent || !Number.isFinite(unitsAvailable)) {
      continue;
    }

    const key = getBloodAvailabilityKey(bloodGroup, bloodComponent);
    const existing = merged.get(key);

    if (existing) {
      existing.unitsAvailable += unitsAvailable;
    } else {
      merged.set(key, {
        ...row,
        bloodGroup,
        bloodComponent,
        unitsAvailable,
      });
    }
  }

  return Array.from(merged.values());
}
