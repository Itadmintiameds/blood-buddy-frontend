"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  User,
  Wrench,
} from "lucide-react";

import type { InventoryAuditResponse } from "@/services/bloodCenter/historyService";
import type { StockMovement } from "@/types/bloodCenter/bloodCenterTypes";

export const movementMeta: Record<
  StockMovement,
  { label: string; icon: typeof ArrowUpRight; className: string }
> = {
  ADD: {
    label: "Added",
    icon: ArrowUpRight,
    className: "bg-[var(--color-success-bg)] text-[var(--color-stat-green)]",
  },
  ISSUE: {
    label: "Issued",
    icon: ArrowDownRight,
    className: "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]",
  },
  DISCARD: {
    label: "Discarded",
    icon: Trash2,
    className: "bg-[var(--danger-50)] text-[var(--danger-700)]",
  },
  CORRECTION: {
    label: "Correction",
    icon: Wrench,
    className: "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]",
  },
};

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InventoryHistoryTimeline({
  entries,
}: {
  entries: InventoryAuditResponse[];
}) {
  return (
    <ol className="space-y-4">
      {entries.map((entry, index) => {
        const meta = movementMeta[entry.stockMovement];
        const Icon = meta.icon;
        const positive = entry.changedUnits > 0;

        return (
          <li
            key={entry.inventoryAuditId}
            className="animate-rise flex gap-3"
            style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.className}`}
            >
              <Icon size={16} strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-text-body)]">
                  {meta.label}
                </span>

                <span
                  className={`text-[13px] font-bold ${
                    positive
                      ? "text-[var(--color-stat-green)]"
                      : "text-[var(--color-primary)]"
                  }`}
                >
                  {positive ? "+" : ""}
                  {entry.changedUnits} units
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {formatTimestamp(entry.createdAt)}
                </span>

                <span className="text-[11px] text-[var(--color-text-quaternary)]">
                  Balance: {entry.remainingUnits}
                </span>

                {entry.createdBy && (
                  <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-placeholder-alt)]">
                    <User size={11} strokeWidth={2} />
                    {entry.createdBy}
                  </span>
                )}
              </div>

              {entry.remarks && (
                <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)]">
                  {entry.remarks}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
