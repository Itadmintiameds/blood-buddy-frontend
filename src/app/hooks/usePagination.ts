"use client";

import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

interface UsePaginationOptions {
  pageSize?: number;
  /**
   * Any string that changes whenever the page should jump back to 1 — pass the
   * active search/filter values so a new filter never leaves you on page 7 of a
   * list that now has 2 pages.
   */
  resetKey?: string;
}

/**
 * Client-side pagination over an already-loaded list. The list screens filter
 * across the whole dataset in the browser, so paging has to happen after
 * filtering (a server page would only ever filter its own 10 rows).
 */
export function usePagination<T>(
  items: readonly T[],
  { pageSize: initialPageSize = DEFAULT_PAGE_SIZE, resetKey = "" }: UsePaginationOptions = {},
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [priorResetKey, setPriorResetKey] = useState(resetKey);

  // Adjusted during render (not in an effect) so the filtered list never
  // paints one frame on a stale page.
  if (resetKey !== priorResetKey) {
    setPriorResetKey(resetKey);
    setPage(1);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // The list can shrink underneath us (refresh, stock update) — clamp rather
  // than strand the user on a page that no longer exists.
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    /** Rows before this page — add to the in-page index for continuous S.No numbering. */
    startIndex: (currentPage - 1) * pageSize,
    setPage,
    setPageSize,
  };
}
