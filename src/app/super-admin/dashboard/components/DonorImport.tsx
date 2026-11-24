"use client";

import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Upload,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";

import {
  confirmDonorImport,
  discardDonorImport,
  downloadDonorImportErrors,
  downloadDonorImportTemplate,
  getDonorImportBatch,
  getDonorImportRows,
  getPendingDonorImport,
  setDonorImportRowExcluded,
  updateDonorImportRow,
  uploadDonorImport,
} from "@/services/bloodCenter/superAdmin/donorImportService";
import { getDonorConsentForm } from "@/services/donor/donorRegistrationService";
import { getBloodGroups } from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import { useNavigationGuard } from "@/contexts/NavigationGuardContext";
import { useConsentForm } from "@/app/hooks/useConsentForm";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import { AppButton } from "@/app/components/ui/AppButton";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { ConsentCheckbox } from "@/app/components/ui/ConsentCheckbox";
import { FormInput } from "@/app/components/ui/FormInput";
import { Pagination } from "@/app/components/ui/Pagination";
import { StatGrid, StatTile } from "@/app/components/ui/StatTile";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";
import type { MasterBloodGroup } from "@/types/master.types";
import type {
  DonorImportBatch,
  DonorImportRow,
  DonorImportRowQuery,
  DonorImportRowValues,
} from "@/types/bloodCenter/superAdmin/donorImportTypes";

// Mirrors the backend limits (DonorImportService.MAX_ROWS, multipart max 5 MB).
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ROW_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const ON_SOLID_EN_CLASS = "mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80";

type Phase = "loading" | "upload" | "review" | "done";

type RowFilter = "all" | "ready" | "errors" | "duplicates" | "excluded";

// Each review tile doubles as a filter on the row table. Excluded rows are
// only listed under "Excluded" so the other tiles match their counts.
const ROW_FILTER_QUERIES: Record<RowFilter, DonorImportRowQuery> = {
  all: {},
  ready: { statuses: ["VALID"], excluded: false },
  errors: { statuses: ["ERROR"], excluded: false },
  duplicates: {
    statuses: ["DUPLICATE_IN_DB", "DUPLICATE_IN_FILE"],
    excluded: false,
  },
  excluded: { excluded: true },
};

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * The super-admin donor import, in three steps: upload a CSV (nothing is saved
 * to the donor list yet), review the staged rows — fix or exclude them — and
 * confirm. While an import is under review, leaving this screen asks to
 * discard it (see NavigationGuardContext); an import left behind by closing
 * the tab is offered again via the "unfinished import" banner.
 */
export function DonorImport({
  onExit,
}: {
  /** `imported` is true when donors were added, so the list can reload. */
  onExit: (imported: boolean) => void;
}) {
  const { setGuard, requestNavigation } = useNavigationGuard();
  const [phase, setPhase] = useState<Phase>("loading");
  const [batch, setBatch] = useState<DonorImportBatch | null>(null);
  const [result, setResult] = useState<DonorImportBatch | null>(null);
  const [pageError, setPageError] = useState("");

  // Resume this admin's unfinished import, if any.
  useEffect(() => {
    let cancelled = false;

    getPendingDonorImport()
      .then((pending) => {
        if (cancelled) return;
        setBatch(pending);
        setPhase(pending ? "review" : "upload");
      })
      .catch((err) => {
        if (cancelled) return;
        setPageError(
          getApiErrorMessage(err, "Unable to check for an unfinished import."),
        );
        setPhase("upload");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Guard the dashboard while an import is under review.
  useEffect(() => {
    if (phase !== "review" || !batch) {
      setGuard(null);
      return;
    }

    const batchId = batch.batchId;
    setGuard({
      title: <BilingualInline tKey="donorImport.leaveTitle" />,
      description: (
        <BilingualInline
          tKey="donorImport.leaveDesc"
          params={{ file: batch.fileName ?? "CSV", count: batch.readyRows }}
        />
      ),
      onDiscard: async () => {
        await discardDonorImport(batchId);
      },
    });
  }, [phase, batch, setGuard]);

  useEffect(() => () => setGuard(null), [setGuard]);

  const handleBack = () => {
    requestNavigation(() => onExit(phase === "done"));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="animate-rise flex flex-col gap-3 rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
            <FileSpreadsheet size={19} className="text-[var(--color-primary)]" />
          </div>

          <div className="min-w-0">
            <Bilingual
              tKey="donorImport.title"
              as="h2"
              className="text-[15px] font-bold text-[var(--color-text-primary)] sm:text-[16px]"
            />
            <Bilingual
              tKey="donorImport.subtitle"
              as="p"
              className="mt-0.5 text-[12px] leading-5 text-[var(--color-text-placeholder-alt)]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:h-10"
        >
          <ArrowLeft size={15} className="shrink-0" />
          <BilingualInline tKey="donorImport.backToDonors" />
        </button>
      </div>

      {pageError && <ErrorBanner message={pageError} />}

      {phase === "loading" && (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[var(--color-border-lighter)] bg-white">
          <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
        </div>
      )}

      {phase === "upload" && (
        <UploadStep
          onUploaded={(uploaded) => {
            setPageError("");
            setBatch(uploaded);
            setPhase("review");
          }}
        />
      )}

      {phase === "review" && batch && (
        <ReviewStep
          batch={batch}
          onBatchChange={setBatch}
          onCancelled={() => {
            setBatch(null);
            setPhase("upload");
          }}
          onConfirmed={(confirmed) => {
            setResult(confirmed);
            setBatch(null);
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && result && (
        <DoneStep
          result={result}
          onViewDonors={() => onExit(true)}
          onImportAnother={() => {
            setResult(null);
            setPhase("upload");
          }}
        />
      )}
    </div>
  );
}

// ---- Step 1: upload ----

function UploadStep({
  onUploaded,
}: {
  onUploaded: (batch: DonorImportBatch) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;

    if (!picked.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported. In Excel use File → Save As → CSV.");
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      setError("The file is larger than 5 MB. Split it into smaller files.");
      return;
    }

    setError("");
    setFile(picked);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      saveBlob(await downloadDonorImportTemplate(), "donor-import-template.csv");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to download the template."));
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      onUploaded(await uploadDonorImport(file));
    } catch (err) {
      // 409: an import is already under review (e.g. opened in another tab) —
      // take the admin to it instead of failing.
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const pending = await getPendingDonorImport().catch(() => null);
        if (pending) {
          onUploaded(pending);
          return;
        }
      }
      setError(getApiErrorMessage(err, "Unable to upload the file."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-rise grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] sm:p-5">
        <StepLabel number={1} tKey="donorImport.step1" />
        <Bilingual
          tKey="donorImport.step1Desc"
          as="p"
          className="mt-2 text-[12px] leading-5 text-[var(--color-text-tertiary)]"
        />

        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={downloading}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] px-4 text-[13px] font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          <BilingualInline tKey="donorImport.downloadTemplate" />
        </button>

        <ul className="mt-4 space-y-1.5 text-[12px] leading-5 text-[var(--color-text-tertiary)]">
          <li>
            • <BilingualInline tKey="donorImport.ruleRequired" />
          </li>
          <li>
            • <BilingualInline tKey="donorImport.ruleDates" />
          </li>
          <li>
            • <BilingualInline tKey="donorImport.ruleDuplicates" />
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] sm:p-5">
        <StepLabel number={2} tKey="donorImport.step2" />

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-4 flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragOver
              ? "border-[var(--color-primary)] bg-[var(--color-icon-bg-soft)]"
              : "border-[var(--color-border-light)] hover:border-[var(--primary-200)] hover:bg-[var(--color-surface-alt)]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              pickFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {file ? (
            <>
              <FileText size={26} className="text-[var(--color-primary)]" />
              <p className="max-w-full truncate text-[13px] font-semibold text-[var(--color-text-body)]">
                {file.name}
              </p>
              <p className="text-[11px] text-[var(--color-text-placeholder-alt)]">
                {(file.size / 1024).toFixed(1)} KB ·{" "}
                <BilingualInline tKey="donorImport.chooseAnother" />
              </p>
            </>
          ) : (
            <>
              <Upload size={26} className="text-[var(--color-text-placeholder-alt)]" />
              <Bilingual
                tKey="donorImport.dropHint"
                as="p"
                className="text-[13px] font-medium text-[var(--color-text-secondary)]"
              />
              <Bilingual
                tKey="donorImport.fileLimits"
                as="p"
                className="text-[11px] text-[var(--color-text-placeholder-alt)]"
              />
            </>
          )}
        </label>

        {error && <ErrorBanner message={error} className="mt-3" />}

        <AppButton
          type="button"
          onClick={handleUpload}
          loading={uploading}
          disabled={!file}
          className="mt-4"
        >
          <Upload size={16} className="shrink-0" />
          <BilingualInline tKey="donorImport.uploadAndCheck" enClassName={ON_SOLID_EN_CLASS} />
        </AppButton>
      </div>
    </div>
  );
}

// ---- Step 2: review ----

function ReviewStep({
  batch,
  onBatchChange,
  onCancelled,
  onConfirmed,
}: {
  batch: DonorImportBatch;
  onBatchChange: (batch: DonorImportBatch) => void;
  onCancelled: () => void;
  onConfirmed: (batch: DonorImportBatch) => void;
}) {
  const batchId = batch.batchId;
  const [filter, setFilter] = useState<RowFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchPlaceholder = useBilingualText("donorImport.searchRows");
  const clearSearchLabel = useBilingualText("superAdmin.clearSearch");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [rows, setRows] = useState<DonorImportRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [busyRowId, setBusyRowId] = useState<number | null>(null);
  const [rowToEdit, setRowToEdit] = useState<DonorImportRow | null>(null);
  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [downloadingErrors, setDownloadingErrors] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Debounce the search box so typing fires one request, not one per keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  // A new filter, search or page size starts again from page 1 (set during
  // render so a stale page is never fetched first).
  const filterKey = `${filter}|${debouncedSearch}|${pageSize}`;
  const [priorFilterKey, setPriorFilterKey] = useState(filterKey);
  if (filterKey !== priorFilterKey) {
    setPriorFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    getBloodGroups()
      .then(setBloodGroups)
      .catch((err) => console.error("Load blood groups error:", err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await getDonorImportRows(
          batchId,
          { ...ROW_FILTER_QUERIES[filter], search: debouncedSearch || undefined },
          page - 1,
          pageSize,
        );
        if (cancelled) return;

        // Excluding/fixing rows can empty the last page of a filter.
        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }

        setRows(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setError(getApiErrorMessage(err, "Unable to load the rows."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [batchId, filter, debouncedSearch, page, pageSize, reloadToken]);

  // After a row changes, the whole batch is re-validated on the server:
  // reload both the counts and the current page.
  const refresh = async () => {
    setReloadToken((token) => token + 1);
    try {
      onBatchChange(await getDonorImportBatch(batchId));
    } catch (err) {
      console.error("Refresh import batch error:", err);
    }
  };

  const handleToggleExcluded = async (row: DonorImportRow) => {
    setBusyRowId(row.rowId);
    setError("");
    try {
      await setDonorImportRowExcluded(batchId, row.rowId, !row.excluded);
      await refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update this row."));
    } finally {
      setBusyRowId(null);
    }
  };

  const handleDownloadErrors = async () => {
    setDownloadingErrors(true);
    try {
      saveBlob(
        await downloadDonorImportErrors(batchId),
        `donor-import-${batchId}-errors.csv`,
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to download the error rows."));
    } finally {
      setDownloadingErrors(false);
    }
  };

  const handleCancelImport = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await discardDonorImport(batchId);
      setCancelOpen(false);
      onCancelled();
    } catch (err) {
      setCancelError(getApiErrorMessage(err, "Unable to cancel the import."));
    } finally {
      setCancelling(false);
    }
  };

  const tiles: {
    id: RowFilter;
    tKey: string;
    value: number;
    color: string;
    icon: typeof Users;
  }[] = [
    { id: "all", tKey: "donorImport.totalRows", value: batch.totalRows, color: "var(--color-stat-blue)", icon: Users },
    { id: "ready", tKey: "donorImport.readyRows", value: batch.readyRows, color: "var(--color-stat-green)", icon: CheckCircle2 },
    { id: "errors", tKey: "donorImport.errorRows", value: batch.errorRows, color: "var(--color-stat-red)", icon: XCircle },
    { id: "duplicates", tKey: "donorImport.duplicateRows", value: batch.duplicateRows, color: "var(--color-stat-yellow)", icon: Copy },
    { id: "excluded", tKey: "donorImport.excludedRows", value: batch.excludedRows, color: "var(--color-stat-gray)", icon: EyeOff },
  ];

  return (
    <>
      <div className="animate-rise flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--color-text-tertiary)]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <BilingualInline tKey="donorImport.inReview" />
        </span>
        <span className="font-semibold text-[var(--color-text-body)]">
          {batch.fileName ?? "CSV"}
        </span>
        <span>
          <BilingualInline
            tKey="donorImport.uploadedOn"
            params={{ date: formatDateTime(batch.uploadedAt) }}
          />
        </span>
      </div>

      <StatGrid cols={5}>
        {tiles.map((tile, index) => (
          <StatTile
            key={tile.id}
            icon={tile.icon}
            value={String(tile.value)}
            label={<Bilingual tKey={tile.tKey} as="span" enClassName={ON_SOLID_EN_CLASS} />}
            color={tile.color}
            index={index}
            active={filter === tile.id}
            onClick={() => setFilter(tile.id)}
          />
        ))}
      </StatGrid>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="animate-rise overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border-lighter)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Bilingual
            tKey={`donorImport.filterTitle.${filter}`}
            as="h3"
            className="text-[13px] font-bold text-[var(--color-text-primary)]"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[300px]">
              <Search
                size={16}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full text-ellipsis rounded-lg border border-[var(--color-border-light)] bg-white pl-9 pr-10 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 sm:h-9"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] sm:h-7 sm:w-7"
                  aria-label={clearSearchLabel}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {batch.errorRows > 0 && (
              <button
                type="button"
                onClick={handleDownloadErrors}
                disabled={downloadingErrors}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-[12px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60 sm:h-9"
              >
                {downloadingErrors ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <BilingualInline tKey="donorImport.downloadErrors" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center px-5 py-10 text-center">
            <Bilingual
              tKey={debouncedSearch ? "donorImport.noSearchResults" : "donorImport.noRows"}
              as="p"
              className="text-[13px] font-semibold text-[var(--color-text-secondary)]"
            />
          </div>
        ) : (
          <>
            {/* Tablet / desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]">
                    <HeaderCell tKey="donorImport.colRow" />
                    <HeaderCell tKey="donorImport.colDonor" />
                    <HeaderCell tKey="common.mobileNumber" />
                    <HeaderCell tKey="bloodCentre.bloodGroup" />
                    <HeaderCell tKey="donorImport.colLocation" />
                    <HeaderCell tKey="superAdmin.status" />
                    <HeaderCell tKey="donorImport.colIssues" />
                    <HeaderCell tKey="superAdmin.action" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.rowId}
                      className={`border-b border-[var(--color-border-light)] align-top last:border-b-0 ${
                        row.excluded ? "bg-[var(--color-surface-alt)] opacity-70" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-[12px] font-semibold text-[var(--color-text-tertiary)]">
                        {row.rowNumber}
                      </td>
                      <td className="max-w-[180px] px-3 py-3 text-[13px] font-semibold text-[var(--color-text-body)]">
                        <span className="block truncate" title={row.fullName ?? ""}>
                          {row.fullName || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[var(--color-text-quaternary)]">
                        {row.mobileNumber || "—"}
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[var(--color-text-quaternary)]">
                        {row.bloodGroup || "—"}
                      </td>
                      <td className="max-w-[180px] px-3 py-3 text-[12px] text-[var(--color-text-quaternary)]">
                        {[row.city, row.district, row.pincode].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <RowStatusBadge row={row} />
                      </td>
                      <td className="max-w-[260px] px-3 py-3">
                        <RowIssues row={row} />
                      </td>
                      <td className="px-3 py-3">
                        <RowActions
                          row={row}
                          busy={busyRowId === row.rowId}
                          onEdit={() => setRowToEdit(row)}
                          onToggleExcluded={() => handleToggleExcluded(row)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone cards */}
            <div className="divide-y divide-[var(--color-border-light)] md:hidden">
              {rows.map((row) => (
                <div
                  key={row.rowId}
                  className={`space-y-2 p-3.5 ${row.excluded ? "bg-[var(--color-surface-alt)] opacity-70" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--color-text-body)]">
                        <span className="mr-1.5 text-[var(--color-text-placeholder-alt)]">
                          #{row.rowNumber}
                        </span>
                        {row.fullName || "—"}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
                        {[row.mobileNumber, row.bloodGroup, row.city].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <RowStatusBadge row={row} />
                  </div>
                  <RowIssues row={row} />
                  <RowActions
                    row={row}
                    busy={busyRowId === row.rowId}
                    onEdit={() => setRowToEdit(row)}
                    onToggleExcluded={() => handleToggleExcluded(row)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && totalElements > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={ROW_PAGE_SIZE_OPTIONS}
        />
      )}

      {/* Cancel / Confirm — pinned to the bottom of the scroll area */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--color-border-lighter)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 2xl:-mx-12 2xl:px-12">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setCancelError("");
              setCancelOpen(true);
            }}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:border-red-400 hover:text-red-600"
          >
            <X size={15} />
            <BilingualInline tKey="donorImport.cancelImport" />
          </button>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            {batch.readyRows === 0 && (
              <Bilingual
                tKey="donorImport.nothingReady"
                as="p"
                className="text-center text-[12px] text-[var(--color-text-tertiary)]"
              />
            )}
            <AppButton
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={batch.readyRows === 0}
              className="sm:w-auto sm:px-6"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <BilingualInline
                tKey="donorImport.confirmImport"
                params={{ count: batch.readyRows }}
                enClassName={ON_SOLID_EN_CLASS}
              />
            </AppButton>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        danger
        title={<BilingualInline tKey="donorImport.cancelImportTitle" />}
        description={
          <>
            <BilingualInline tKey="donorImport.cancelImportDesc" />
            {cancelError && (
              <span className="mt-2 block font-medium text-red-600">{cancelError}</span>
            )}
          </>
        }
        cancelLabel={<BilingualInline tKey="donorImport.keepReviewing" />}
        confirmLabel={
          <BilingualInline tKey="donorImport.discardImport" enClassName="text-white/80" />
        }
        loading={cancelling}
        onConfirm={handleCancelImport}
        onCancel={() => setCancelOpen(false)}
      />

      {rowToEdit && (
        <RowEditModal
          batchId={batchId}
          row={rowToEdit}
          bloodGroups={bloodGroups}
          onClose={() => setRowToEdit(null)}
          onSaved={refresh}
        />
      )}

      {confirmOpen && (
        <ConfirmImportModal
          batch={batch}
          onClose={() => setConfirmOpen(false)}
          onFailed={refresh}
          onConfirmed={(confirmed) => {
            setConfirmOpen(false);
            onConfirmed(confirmed);
          }}
        />
      )}
    </>
  );
}

function RowStatusBadge({ row }: { row: DonorImportRow }) {
  const { tKey, className } = row.excluded
    ? { tKey: "donorImport.statusExcluded", className: "bg-slate-100 text-slate-600" }
    : row.status === "VALID"
      ? { tKey: "donorImport.statusReady", className: "bg-[var(--color-success-bg)] text-[var(--color-success)]" }
      : row.status === "ERROR"
        ? { tKey: "donorImport.statusError", className: "bg-red-50 text-red-600" }
        : row.status === "DUPLICATE_IN_DB"
          ? { tKey: "donorImport.statusExisting", className: "bg-amber-50 text-amber-700" }
          : { tKey: "donorImport.statusRepeated", className: "bg-amber-50 text-amber-700" };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      <BilingualInline tKey={tKey} />
    </span>
  );
}

function RowIssues({ row }: { row: DonorImportRow }) {
  if (row.errors.length === 0) {
    return <span className="text-[12px] text-[var(--color-text-placeholder-alt)]">—</span>;
  }

  const tone = row.status === "ERROR" ? "text-red-600" : "text-amber-700";

  return (
    <ul className={`space-y-0.5 text-[12px] leading-5 ${tone}`}>
      {row.errors.map((message) => (
        <li key={message} className="flex gap-1.5">
          <AlertCircle size={12} className="mt-1 shrink-0" />
          <span className="break-words">{message}</span>
        </li>
      ))}
    </ul>
  );
}

function RowActions({
  row,
  busy,
  onEdit,
  onToggleExcluded,
}: {
  row: DonorImportRow;
  busy: boolean;
  onEdit: () => void;
  onToggleExcluded: () => void;
}) {
  const buttonClass =
    "flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border-light)] bg-white px-2.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--primary-200)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={onEdit} disabled={busy} className={buttonClass}>
        <Pencil size={13} />
        <BilingualInline tKey="donorImport.edit" />
      </button>
      <button type="button" onClick={onToggleExcluded} disabled={busy} className={buttonClass}>
        {busy ? (
          <Loader2 size={13} className="animate-spin" />
        ) : row.excluded ? (
          <RotateCcw size={13} />
        ) : (
          <EyeOff size={13} />
        )}
        <BilingualInline tKey={row.excluded ? "donorImport.include" : "donorImport.exclude"} />
      </button>
    </div>
  );
}

// ---- Row edit ----

const EDIT_FIELDS: {
  key: keyof DonorImportRowValues;
  tKey: string;
  icon: typeof Phone;
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
}[] = [
  { key: "fullName", tKey: "common.fullName", icon: UserRound, required: true, wide: true },
  { key: "mobileNumber", tKey: "common.mobileNumber", icon: Phone, required: true },
  { key: "alternativeMobileNumber", tKey: "superAdmin.alternateMobileNo", icon: Phone },
  { key: "dob", tKey: "donor.dateOfBirth", icon: CalendarDays, placeholder: "YYYY-MM-DD" },
  { key: "lastBloodDonationDate", tKey: "superAdmin.lastBloodDonationDate", icon: CalendarDays, placeholder: "YYYY-MM-DD" },
  { key: "address", tKey: "common.address", icon: MapPin, wide: true },
  { key: "city", tKey: "common.city", icon: MapPin, required: true },
  { key: "district", tKey: "common.district", icon: MapPin },
  { key: "pincode", tKey: "superAdmin.pincode", icon: MapPin },
  { key: "remarks", tKey: "superAdmin.remarks", icon: FileText, wide: true },
];

function toValues(row: DonorImportRow): DonorImportRowValues {
  return {
    fullName: row.fullName ?? "",
    mobileNumber: row.mobileNumber ?? "",
    alternativeMobileNumber: row.alternativeMobileNumber ?? "",
    bloodGroup: row.bloodGroup ?? "",
    dob: row.dob ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    district: row.district ?? "",
    pincode: row.pincode ?? "",
    lastBloodDonationDate: row.lastBloodDonationDate ?? "",
    remarks: row.remarks ?? "",
  };
}

function RowEditModal({
  batchId,
  row,
  bloodGroups,
  onClose,
  onSaved,
}: {
  batchId: number;
  row: DonorImportRow;
  bloodGroups: MasterBloodGroup[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const [values, setValues] = useState<DonorImportRowValues>(() => toValues(row));
  const [rowErrors, setRowErrors] = useState<string[]>(row.errors);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const groupNames = bloodGroups.map((group) => group.bloodGroupName);
  const unknownGroup =
    values.bloodGroup && !groupNames.includes(values.bloodGroup) ? values.bloodGroup : null;

  const setValue = (key: keyof DonorImportRowValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateDonorImportRow(batchId, row.rowId, values);
      onSaved();
      // Keep the dialog open while the row still has problems, showing the
      // re-validated messages; close once it's ready (or a duplicate).
      if (updated.status === "ERROR") {
        setRowErrors(updated.errors);
      } else {
        onClose();
      }
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Unable to save this row."));
    } finally {
      setSaving(false);
    }
  };

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-row-edit-title"
    >
      <div
        className={`motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 sm:max-h-[90dvh] ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
              <Pencil size={16} className="text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <Bilingual
                tKey="donorImport.editRowTitle"
                params={{ row: row.rowNumber }}
                as="h2"
                id="import-row-edit-title"
                className="text-[14px] font-bold text-[var(--color-text-primary)]"
              />
              <Bilingual
                tKey="donorImport.editRowHint"
                as="p"
                className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={closeLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50 sm:h-8 sm:w-8"
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {rowErrors.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <ul className="space-y-1 text-[12px] leading-5 text-red-700">
                {rowErrors.map((message) => (
                  <li key={message} className="flex gap-1.5">
                    <AlertCircle size={13} className="mt-1 shrink-0" />
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {EDIT_FIELDS.slice(0, 3).map((field) => (
              <EditField key={field.key} field={field} value={values[field.key]} onChange={setValue} />
            ))}

            <div>
              <label
                htmlFor="import-row-blood-group"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              >
                <BilingualInline tKey="bloodCentre.bloodGroup" />
                <span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <select
                  id="import-row-blood-group"
                  value={values.bloodGroup}
                  onChange={(event) => setValue("bloodGroup", event.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[var(--color-border)] bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                >
                  <option value="">—</option>
                  {unknownGroup && <option value={unknownGroup}>{unknownGroup}</option>}
                  {groupNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
              </div>
            </div>

            {EDIT_FIELDS.slice(3).map((field) => (
              <EditField key={field.key} field={field} value={values[field.key]} onChange={setValue} />
            ))}
          </div>

          {saveError && <ErrorBanner message={saveError} className="mt-4" />}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--color-border-lighter)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50 sm:min-h-10"
          >
            <BilingualInline tKey="common.cancel" />
          </button>
          <AppButton type="button" onClick={handleSave} loading={saving} className="sm:w-auto sm:px-6">
            <BilingualInline tKey="common.save" enClassName={ON_SOLID_EN_CLASS} />
          </AppButton>
        </div>
      </div>
    </div>
  );
}

function EditField({
  field,
  value,
  onChange,
}: {
  field: (typeof EDIT_FIELDS)[number];
  value: string;
  onChange: (key: keyof DonorImportRowValues, value: string) => void;
}) {
  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <FormInput
        id={`import-row-${field.key}`}
        icon={field.icon}
        label={<BilingualInline tKey={field.tKey} />}
        required={field.required}
        placeholder={field.placeholder}
        maxLength={255}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    </div>
  );
}

// ---- Step 3: confirm ----

function ConfirmImportModal({
  batch,
  onClose,
  onConfirmed,
  onFailed,
}: {
  batch: DonorImportBatch;
  onClose: () => void;
  onConfirmed: (batch: DonorImportBatch) => void;
  /** Confirm re-checks every row; after a failure the review counts may have changed. */
  onFailed: () => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const { consent, loading: consentLoading, reload } = useConsentForm(getDonorConsentForm);
  const [attested, setAttested] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!consent || !attested) return;

    setConfirming(true);
    setError("");
    try {
      onConfirmed(
        await confirmDonorImport(batch.batchId, {
          consentConfirmed: true,
          consentVersion: consent.version,
        }),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to import the donors."));
      onFailed();
      // The consent wording may have changed meanwhile: show the new text and
      // ask again.
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const latest = await reload();
        if (latest && latest.version !== consent.version) {
          setAttested(false);
        }
      }
    } finally {
      setConfirming(false);
    }
  };

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-import-title"
    >
      <div
        className={`motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 sm:max-h-[90dvh] ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <Bilingual
            tKey="donorImport.confirmTitle"
            as="h2"
            id="confirm-import-title"
            className="text-[16px] font-bold text-[var(--color-text-primary)]"
          />
          <Bilingual
            tKey="donorImport.confirmDesc"
            params={{ count: batch.readyRows }}
            as="p"
            className="mt-1.5 text-[13px] leading-5 text-[var(--color-text-tertiary)]"
          />

          <div className="mt-4">
            <ConsentCheckbox
              id="import-consent"
              statementKey="donorImport.consentStatement"
              consent={consent}
              consentLoading={consentLoading}
              onRetry={reload}
              checked={attested}
              onChange={(event) => setAttested(event.target.checked)}
            />
          </div>

          {error && <ErrorBanner message={error} className="mt-3" />}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--color-border-lighter)] px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50 sm:min-h-10"
          >
            <BilingualInline tKey="donorImport.keepReviewing" />
          </button>
          <AppButton
            type="button"
            onClick={handleConfirm}
            loading={confirming}
            disabled={!consent || !attested}
            className="sm:w-auto sm:px-6"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <BilingualInline
              tKey="donorImport.importNow"
              params={{ count: batch.readyRows }}
              enClassName={ON_SOLID_EN_CLASS}
            />
          </AppButton>
        </div>
      </div>
    </div>
  );
}

// ---- Done ----

function DoneStep({
  result,
  onViewDonors,
  onImportAnother,
}: {
  result: DonorImportBatch;
  onViewDonors: () => void;
  onImportAnother: () => void;
}) {
  return (
    <div className="animate-rise rounded-2xl border border-[var(--color-border-lighter)] bg-white px-4 py-8 text-center shadow-[0_3px_15px_rgba(0,0,0,0.025)] sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
        <CheckCircle2 size={28} className="text-[var(--color-success)]" />
      </div>

      <Bilingual
        tKey="donorImport.doneTitle"
        as="h2"
        className="mt-4 text-[17px] font-bold text-[var(--color-text-primary)]"
      />
      <p className="mt-1 text-[12px] text-[var(--color-text-placeholder-alt)]">
        {result.fileName ?? "CSV"}
      </p>

      <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-2 gap-3">
        <SummaryNumber value={result.insertedRows ?? 0} tKey="donorImport.insertedRows" tone="text-[var(--color-success)]" />
        <SummaryNumber value={result.skippedRows ?? 0} tKey="donorImport.skippedRows" tone="text-[var(--color-text-secondary)]" />
      </div>

      {/* Counts are re-checked at confirm, so they can differ slightly from the review. */}
      <Bilingual
        tKey="donorImport.doneNote"
        as="p"
        className="mx-auto mt-4 max-w-[460px] text-[12px] leading-5 text-[var(--color-text-tertiary)]"
      />

      <div className="mx-auto mt-6 flex max-w-[420px] flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onImportAnother}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <Upload size={15} />
          <BilingualInline tKey="donorImport.importAnother" />
        </button>
        <AppButton type="button" onClick={onViewDonors} className="flex-1">
          <Users size={16} className="shrink-0" />
          <BilingualInline tKey="donorImport.viewDonors" enClassName={ON_SOLID_EN_CLASS} />
        </AppButton>
      </div>
    </div>
  );
}

function SummaryNumber({ value, tKey, tone }: { value: number; tKey: string; tone: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-3 py-4">
      <p className={`text-[26px] font-bold leading-none ${tone}`}>{value}</p>
      <Bilingual
        tKey={tKey}
        as="p"
        className="mt-1.5 text-[12px] font-medium text-[var(--color-text-tertiary)]"
      />
    </div>
  );
}

// ---- Unfinished-import banner (shown on the donor list) ----

/**
 * Offers to resume an import left under review — e.g. after the tab was closed
 * or refreshed, which the leave-page prompt can't stop.
 */
export function PendingImportBanner({ onContinue }: { onContinue: () => void }) {
  const [pending, setPending] = useState<DonorImportBatch | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPendingDonorImport()
      .then((batch) => {
        if (!cancelled) setPending(batch);
      })
      .catch((err) => console.error("Load pending import error:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!pending) {
    return null;
  }

  return (
    <div className="animate-rise flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <FileSpreadsheet size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0">
          <Bilingual
            tKey="donorImport.pendingBannerTitle"
            as="p"
            className="text-[13px] font-semibold text-amber-800"
          />
          <Bilingual
            tKey="donorImport.pendingBannerDesc"
            params={{
              file: pending.fileName ?? "CSV",
              count: pending.totalRows,
              date: formatDateTime(pending.uploadedAt),
            }}
            as="p"
            className="mt-0.5 break-words text-[12px] text-amber-700"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-amber-600 px-4 text-[13px] font-semibold text-white transition hover:bg-amber-700"
      >
        <BilingualInline tKey="donorImport.continueReview" enClassName="text-white/80" />
      </button>
    </div>
  );
}

// ---- Shared bits ----

function StepLabel({ number, tKey }: { number: number; tKey: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[12px] font-bold text-white">
        {number}
      </span>
      <Bilingual
        tKey={tKey}
        as="h3"
        className="text-[14px] font-bold text-[var(--color-text-primary)]"
      />
    </div>
  );
}

function HeaderCell({ tKey }: { tKey: string }) {
  return (
    <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)]">
      <Bilingual
        tKey={tKey}
        as="span"
        enClassName="mt-0.5 block text-[0.75em] font-normal leading-tight opacity-70"
      />
    </th>
  );
}

function ErrorBanner({
  message,
  className = "",
  onDismiss,
}: {
  message: ReactNode;
  className?: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-5 text-red-700 ${className}`}
    >
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1 break-words">{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 text-red-500 hover:text-red-700">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
