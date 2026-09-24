"use client";

import { useEffect, useState } from "react";
import { History, Loader2, X } from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import {
  getInventoryHistory,
  type InventoryAuditResponse,
} from "@/services/bloodCenter/historyService";
import { useBilingualText } from "@/app/components/common/Bilingual";
import { InventoryHistoryTimeline } from "./InventoryHistoryTimeline";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const closeLabel = useBilingualText("common.close");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getInventoryHistory(inventoryId);

        if (!cancelled) {
          setEntries(
            [...result].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
      } catch (fetchError) {
        if (!cancelled) {
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
  }, [inventoryId]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-history-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
          <div className="flex min-w-0 items-center gap-2">
            <History size={16} strokeWidth={2} className="text-[var(--color-primary)]" />
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
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

          {!loading && !error && entries.length === 0 && (
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
      </div>
    </div>
  );
}
