// Shared stock-level vocabulary for the Blood Centre screens (overview,
// availability table, history) so "healthy / low / critical" reads the same
// everywhere. All colours resolve to the shared design tokens.

export const LOW_STOCK_THRESHOLD = 3;

export type StockLevel = "healthy" | "low" | "critical";

export function getStockLevel(units: number): StockLevel {
  if (units <= 0) return "critical";
  if (units <= LOW_STOCK_THRESHOLD) return "low";
  return "healthy";
}

// Units-badge colour by stock level.
export function unitBadgeClass(level: StockLevel): string {
  if (level === "critical") {
    return "bg-[var(--color-icon-bg-soft)] text-[var(--color-stat-red)]";
  }

  if (level === "low") {
    return "bg-[var(--danger-50)] text-[var(--danger-700)]";
  }

  return "bg-[var(--color-success-bg)] text-[var(--color-stat-green)]";
}

// Left-edge accent colour for low / critical rows (transparent = healthy).
export function rowAccent(level: StockLevel): string {
  if (level === "critical") return "var(--color-stat-red)";
  if (level === "low") return "var(--color-stat-yellow)";
  return "transparent";
}
