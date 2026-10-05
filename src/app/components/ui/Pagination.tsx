"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useBilingualText } from "@/app/components/common/Bilingual";
import { PAGE_SIZE_OPTIONS } from "@/app/hooks/usePagination";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Omit to hide the rows-per-page selector. */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: readonly number[];
  /**
   * Narrow variant for tight panels (e.g. the 320px blood-bank list): drops the
   * numbered buttons and the rows-per-page selector, keeping "‹ Page 2 of 5 ›".
   */
  compact?: boolean;
  className?: string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

// 1 … 4 5 6 … 12 — always the first, last and the current page ±1.
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < totalPages - 1) items.push("ellipsis-end");

  items.push(totalPages);

  return items;
}

const navButtonClass =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white px-2 text-[12px] sm:h-8 sm:min-w-8 font-semibold text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border-light)] disabled:hover:bg-white disabled:hover:text-[var(--color-text-secondary)]";

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  compact = false,
  className = "",
}: PaginationProps) {
  const previousLabel = useBilingualText("common.previous");
  const nextLabel = useBilingualText("common.next");
  const rowsPerPageLabel = useBilingualText("common.rowsPerPage");

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const showingText = useBilingualText("common.showingRange", {
    from,
    to,
    total: totalItems,
  });
  const pageOfText = useBilingualText("common.pageOf", {
    page,
    total: totalPages,
  });

  if (totalItems === 0) {
    return null;
  }

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  if (compact) {
    return (
      <nav
        aria-label="Pagination"
        className={`flex items-center justify-between gap-2 border-t border-[var(--color-border-lighter)] bg-white px-3 py-2.5 ${className}`}
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoBack}
          aria-label={previousLabel}
          className={navButtonClass}
        >
          <ChevronLeft size={15} />
        </button>

        <span className="min-w-0 truncate text-center text-[11px] font-medium text-[var(--color-text-tertiary)]">
          {pageOfText}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoForward}
          aria-label={nextLabel}
          className={navButtonClass}
        >
          <ChevronRight size={15} />
        </button>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 rounded-xl border border-[var(--color-border-lighter)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          {showingText}
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
            <span>{rowsPerPageLabel}</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 cursor-pointer rounded-lg border border-[var(--color-border-light)] bg-white px-2 text-[12px] font-medium text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoBack}
          aria-label={previousLabel}
          className={navButtonClass}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Numbered buttons need room; phones get "Page 2 of 6" instead. */}
        <span className="px-2 text-[12px] font-medium text-[var(--color-text-secondary)] sm:hidden">
          {pageOfText}
        </span>

        <div className="hidden items-center gap-1.5 sm:flex">
          {getPageItems(page, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={
                  item === page
                    ? "flex h-8 min-w-8 items-center justify-center rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] px-2 text-[12px] font-semibold text-white shadow-[0_3px_10px_rgba(255,59,63,0.22)]"
                    : navButtonClass
                }
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                aria-hidden="true"
                className="flex h-8 min-w-6 items-center justify-center text-[12px] text-[var(--color-text-placeholder-alt)]"
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoForward}
          aria-label={nextLabel}
          className={navButtonClass}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}
