"use client";

import { useEffect, useRef, useState } from "react";
import { History, Loader2, X } from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import {
  getInventoryHistory,
  type InventoryAuditResponse,
} from "@/services/bloodCenter/historyService";
import { useBilingualText } from "@/app/components/common/Bilingual";
import { Pagination } from "@/app/components/ui/Pagination";
import { InventoryHistoryTimeline } from "./InventoryHistoryTimeline";

// The modal is only 460px wide / 85dvh tall, so page the timeline 5 at a time.
const PAGE_SIZE = 5;

// Shows the movement history for a single inventory item (blood group +
// component) in a modal, keyed by its inventoryId.
export function InventoryHistoryModal({
  inventoryId,
  title,
  onClose,
}: {
  inventoryId: number;
  title: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<InventoryAuditResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const closeLabel = useBilingualText("common.close");

  // A compact pager is pinned below the scrolling body.
  const bodyRef = useRef<HTMLDivElement>(null);

  // A different inventory item jumps back to page 1 (done during render so we
  // never fetch a stale page first).
  const [priorInventoryId, setPriorInventoryId] = useState(inventoryId);
  if (inventoryId !== priorInventoryId) {
    setPriorInventoryId(inventoryId);
    setPage(1);
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getInventoryHistory(inventoryId, {
          page: page - 1,
          size: PAGE_SIZE,
        });

        if (!cancelled) {
          setEntries(result.content);
          setTotalElements(result.totalElements);
          setTotalPages(Math.max(1, result.totalPages));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setEntries([]);
          setTotalElements(0);
          setTotalPages(1);
          setError(getApiErrorMessage(fetchError, "Unable to load history."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [inventoryId, page]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-history-title"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] sm:max-h-[85dvh]">
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-center gap-2">
            <History size={16} strokeWidth={2} className="shrink-0 text-[var(--color-primary)]" />
            <div className="min-w-0">
              <h2
                id="inventory-history-title"
                className="truncate text-[14px] font-bold text-[var(--color-text-primary)]"
              >
                History
              </h2>
              <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                {title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] sm:m-0 sm:h-8 sm:w-8"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {loading && (
            <div className="flex min-h-[180px] items-center justify-center">
              <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
            </div>
          )}

          {!loading && error && (
            <p
              role="alert"
              className="flex min-h-[180px] items-center justify-center text-center text-[12px] text-red-500"
            >
              {error}
            </p>
          )}

          {!loading && !error && totalElements === 0 && (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                <History size={22} strokeWidth={1.7} className="text-[var(--color-text-tertiary)]" />
              </div>

              <p className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
                No movements recorded yet
              </p>

              <p className="mt-1 max-w-[300px] text-[11px] text-[var(--color-text-placeholder-alt)]">
                Additions, issues, discards and corrections will appear here.
              </p>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <InventoryHistoryTimeline entries={entries} />
          )}
        </div>

        {!loading && !error && totalElements > 0 && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            compact
            className="shrink-0"
          />
        )}
      </div>
    </div>
  );
}
