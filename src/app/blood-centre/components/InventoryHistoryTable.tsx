"use client";

import { User } from "lucide-react";

import type { InventoryAuditResponse } from "@/services/bloodCenter/historyService";
import { formatTimestamp, movementMeta } from "./InventoryHistoryTimeline";

const COLS =
  "grid-cols-[1.6fr_1.1fr_0.7fr_0.8fr_1.1fr_1.5fr]";

// Dense, scrollable table view of an inventory item's audit trail. Used on the
// full History page (the modal keeps the compact timeline).
export function InventoryHistoryTable({
  entries,
}: {
  entries: InventoryAuditResponse[];
}) {
  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[var(--color-border-light)]">
      <div className="min-w-[700px]">
        {/* Header */}
        <div
          className={`grid ${COLS} items-center border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-quaternary)] sm:text-[11px]`}
        >
          <div>Date &amp; time</div>
          <div>Movement</div>
          <div className="text-center">Change</div>
          <div className="text-center">Balance</div>
          <div>Recorded by</div>
          <div>Remarks</div>
        </div>

        {/* Rows */}
        {entries.map((entry, index) => {
          const meta = movementMeta[entry.stockMovement];
          const Icon = meta.icon;
          const positive = entry.changedUnits > 0;

          return (
            <div
              key={entry.inventoryAuditId}
              className={`animate-rise grid ${COLS} items-center border-b border-[var(--color-border-lighter)] px-4 py-3 text-[12px] text-[var(--color-text-body)] transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)] sm:text-[13px] ${
                index % 2 === 0
                  ? "bg-[var(--color-white)]"
                  : "bg-[var(--color-surface-hover)]"
              }`}
              style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
            >
              <div className="pr-2 text-[var(--color-text-secondary)]">
                {formatTimestamp(entry.createdAt)}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                >
                  <Icon size={13} strokeWidth={2} />
                  {meta.label}
                </span>
              </div>

              <div
                className={`text-center font-bold ${
                  positive
                    ? "text-[var(--color-stat-green)]"
                    : "text-[var(--color-primary)]"
                }`}
              >
                {positive ? "+" : ""}
                {entry.changedUnits}
              </div>

              <div className="text-center font-semibold text-[var(--color-text-body)]">
                {entry.remainingUnits}
              </div>

              <div className="flex min-w-0 items-center gap-1 pr-2 text-[var(--color-text-tertiary)]">
                {entry.createdBy ? (
                  <>
                    <User size={12} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{entry.createdBy}</span>
                  </>
                ) : (
                  <span className="text-[var(--color-text-placeholder-alt)]">—</span>
                )}
              </div>

              <div
                className="truncate pr-1 text-[var(--color-text-secondary)]"
                title={entry.remarks ?? ""}
              >
                {entry.remarks || (
                  <span className="text-[var(--color-text-placeholder-alt)]">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
