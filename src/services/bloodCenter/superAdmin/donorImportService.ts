import { api } from "@/services/api/client";
import type { ApiEnvelope, PagedResponse } from "@/types/api.types";
import type {
  DonorImportBatch,
  DonorImportConfirmInput,
  DonorImportRow,
  DonorImportRowQuery,
  DonorImportRowValues,
} from "@/types/bloodCenter/superAdmin/donorImportTypes";

// Super-admin donor CSV import (bloodbuddy.backend.controller.DonorImportController).
// Upload stages every row for review; nothing reaches the donor list until
// confirm. Each super admin can have only one PENDING import at a time.

// Upload and confirm handle up to 5,000 rows, so they get more than the
// client's default 20s timeout.
const LONG_TIMEOUT_MS = 120_000;

// GET /donors/import/template — CSV with the expected headers and an example row.
export async function downloadDonorImportTemplate(): Promise<Blob> {
  const { data } = await api.get<Blob>("/donors/import/template", {
    responseType: "blob",
  });
  return data;
}

// POST /donors/import — stages and validates the file as a new PENDING batch.
// 409 when this admin already has an import in review.
export async function uploadDonorImport(file: File): Promise<DonorImportBatch> {
  const form = new FormData();
  form.append("file", file);

  // multipart/form-data (not the client's JSON default) so axios sends the
  // FormData as-is; the browser fills in the boundary.
  const { data } = await api.post<ApiEnvelope<DonorImportBatch>>(
    "/donors/import",
    form,
    {
      timeout: LONG_TIMEOUT_MS,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data;
}

// GET /donors/import/pending — this admin's unfinished import, or null.
export async function getPendingDonorImport(): Promise<DonorImportBatch | null> {
  const { data } = await api.get<ApiEnvelope<DonorImportBatch | undefined>>(
    "/donors/import/pending",
  );
  return data.data ?? null;
}

// GET /donors/import/{batchId} — refreshed counts for one batch.
export async function getDonorImportBatch(
  batchId: number,
): Promise<DonorImportBatch> {
  const { data } = await api.get<ApiEnvelope<DonorImportBatch>>(
    `/donors/import/${batchId}`,
  );
  return data.data;
}

// GET /donors/import/{batchId}/rows — the review table, ordered by row number.
export async function getDonorImportRows(
  batchId: number,
  query: DonorImportRowQuery,
  page: number,
  size: number,
): Promise<PagedResponse<DonorImportRow>> {
  // URLSearchParams so several statuses serialise as `status=a&status=b`,
  // which Spring binds to a List.
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", "rowNo,asc");
  query.statuses?.forEach((status) => params.append("status", status));
  if (query.excluded !== undefined) {
    params.set("excluded", String(query.excluded));
  }
  if (query.search) {
    params.set("search", query.search);
  }

  const { data } = await api.get<ApiEnvelope<PagedResponse<DonorImportRow>>>(
    `/donors/import/${batchId}/rows`,
    { params },
  );
  return data.data;
}

// PUT /donors/import/{batchId}/rows/{rowId} — save corrected values; the
// whole batch is re-validated.
export async function updateDonorImportRow(
  batchId: number,
  rowId: number,
  values: DonorImportRowValues,
): Promise<DonorImportRow> {
  const { data } = await api.put<ApiEnvelope<DonorImportRow>>(
    `/donors/import/${batchId}/rows/${rowId}`,
    values,
  );
  return data.data;
}

// PATCH /donors/import/{batchId}/rows/{rowId}/exclude | include
export async function setDonorImportRowExcluded(
  batchId: number,
  rowId: number,
  excluded: boolean,
): Promise<DonorImportRow> {
  const { data } = await api.patch<ApiEnvelope<DonorImportRow>>(
    `/donors/import/${batchId}/rows/${rowId}/${excluded ? "exclude" : "include"}`,
  );
  return data.data;
}

// GET /donors/import/{batchId}/errors — CSV of the rows that still have errors.
export async function downloadDonorImportErrors(batchId: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/donors/import/${batchId}/errors`, {
    responseType: "blob",
  });
  return data;
}

// POST /donors/import/{batchId}/confirm — copies the ready rows into the donor
// list. The admin attests offline consent against the active consent version.
export async function confirmDonorImport(
  batchId: number,
  input: DonorImportConfirmInput,
): Promise<DonorImportBatch> {
  const { data } = await api.post<ApiEnvelope<DonorImportBatch>>(
    `/donors/import/${batchId}/confirm`,
    input,
    { timeout: LONG_TIMEOUT_MS },
  );
  return data.data;
}

// PATCH /donors/import/{batchId}/discard — cancels the import and deletes its rows.
export async function discardDonorImport(
  batchId: number,
): Promise<DonorImportBatch> {
  const { data } = await api.patch<ApiEnvelope<DonorImportBatch>>(
    `/donors/import/${batchId}/discard`,
  );
  return data.data;
}
