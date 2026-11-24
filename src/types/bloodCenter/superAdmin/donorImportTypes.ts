// Shapes of the super-admin donor CSV import API (/donors/import), matching
// bloodbuddy.backend.dto.donor.DonorImport* on the backend.

export type DonorImportStatus = "PENDING" | "CONFIRMED" | "DISCARDED";

export type DonorImportRowStatus =
  | "VALID"
  | "ERROR"
  | "DUPLICATE_IN_DB"
  | "DUPLICATE_IN_FILE";

// DonorImportBatchResponse — one uploaded file. The review counts are kept up
// to date as rows are edited/excluded; inserted/skipped are set on confirm.
export interface DonorImportBatch {
  batchId: number;
  fileName: string | null;
  status: DonorImportStatus;
  totalRows: number;
  /** VALID and not excluded: what confirm would import right now. */
  readyRows: number;
  errorRows: number;
  duplicateRows: number;
  excludedRows: number;
  insertedRows: number | null;
  skippedRows: number | null;
  consentVersion: string | null;
  uploadedBy: string | null;
  uploadedAt: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
}

// The editable values of a staged row — free text, exactly as uploaded or as
// corrected by the super admin (the backend re-validates on save).
export interface DonorImportRowValues {
  fullName: string;
  mobileNumber: string;
  alternativeMobileNumber: string;
  bloodGroup: string;
  dob: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  lastBloodDonationDate: string;
  remarks: string;
}

// DonorImportRowResponse — a staged row in the review table. Rows exist only
// while the import is PENDING; confirm and discard delete them.
export interface DonorImportRow
  extends Partial<Record<keyof DonorImportRowValues, string | null>> {
  rowId: number;
  /** Spreadsheet row number (the header is row 1). */
  rowNumber: number;
  status: DonorImportRowStatus;
  errors: string[];
  existingDonorId: number | null;
  duplicateOfRow: number | null;
  excluded: boolean;
}

export interface DonorImportRowQuery {
  /** Rows with any of these statuses. */
  statuses?: DonorImportRowStatus[];
  excluded?: boolean;
  /** Case-insensitive match on the row's values; a plain number also matches the row number. */
  search?: string;
}

export interface DonorImportConfirmInput {
  consentConfirmed: boolean;
  consentVersion: string;
}
