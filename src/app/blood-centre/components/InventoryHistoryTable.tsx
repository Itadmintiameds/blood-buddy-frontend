"use client";

import { User } from "lucide-react";

import type { InventoryAuditResponse } from "@/services/bloodCenter/historyService";
import { Pagination } from "@/app/components/ui/Pagination";
import { usePagination } from "@/app/hooks/usePagination";
import { formatTimestamp, movementMeta } from "./InventoryHistoryTimeline";

const COLS =
  "grid-cols-[1.3fr_1fr_0.55fr_0.55fr_1.3fr_1.9fr]";

// Dense, scrollable table view of an inventory item's audit trail. Used on the
// full History page (the modal keeps the compact timeline). Narrower than lg it
// renders the same entries as cards instead.
export function InventoryHistoryTable({
  entries,
}: {
  entries: InventoryAuditResponse[];
}) {
  // Every row shares the same inventory item, so show the group + component once
  // as a heading rather than repeating them in each row.
  const heading = entries[0];

  // Page over the full (already newest-first) list; a different inventory item
  // jumps back to page 1.
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    setPage,
    setPageSize,
  } = usePagination(entries, {
    pageSize: 10,
    resetKey: String(heading?.inventoryId ?? ""),
  });

  return (
    <div>
      {heading && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-icon-bg-soft)] px-3 py-1 text-[13px] font-bold text-[var(--color-primary)]">
            {heading.bloodGroupName}
          </span>
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            {heading.bloodComponentName}
          </span>
        </div>
      )}

      {/* Below lg the six columns can't fit, so each movement becomes a card. */}
      <ol className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:hidden">
        {pageItems.map((entry, index) => {
          const meta = movementMeta[entry.stockMovement];
          const Icon = meta.icon;
          const positive = entry.changedUnits > 0;

          return (
            <li
              key={entry.inventoryAuditId}
              className="animate-rise min-w-0 rounded-xl border border-[var(--color-border-light)] bg-white p-3.5"
              style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${meta.className}`}
                >
                  <Icon size={13} strokeWidth={2} />
                  {meta.label}
                </span>

                <span
                  className={`text-[16px] font-bold ${
                    positive
                      ? "text-[var(--color-stat-green)]"
                      : "text-[var(--color-primary)]"
                  }`}
                >
                  {positive ? "+" : ""}
                  {entry.changedUnits}
                  <span className="ml-1 text-[12px] font-medium text-[var(--color-text-muted)]">
                    units
                  </span>
                </span>
              </div>

              <p className="mt-2.5 text-[13px] text-[var(--color-text-secondary)]">
                {formatTimestamp(entry.createdAt)}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                <span className="font-medium text-[var(--color-text-body)]">
                  Balance: {entry.remainingUnits}
                </span>

                {entry.createdBy && (
                  <span className="flex min-w-0 items-center gap-1 break-all text-[12px] text-[var(--color-text-tertiary)]">
                    <User size={12} strokeWidth={2} className="shrink-0" />
                    {entry.createdBy}
                  </span>
                )}
              </div>

              {entry.remarks && (
                <p className="mt-2.5 break-words rounded-lg bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
                  {entry.remarks}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="hidden overflow-x-auto overflow-y-hidden rounded-xl border border-[var(--color-border-light)] lg:block">
        <div className="min-w-[760px]">
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
          {pageItems.map((entry, index) => {
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

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        className="mt-4"
      />
    </div>
  );
}
