"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Droplets,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  BloodRequestStatus,
  SuperAdminBloodRequestCentre,
  SuperAdminBloodRequestDetail,
  SuperAdminBloodRequestStats,
  SuperAdminBloodRequestSummary,
  SuperAdminDonor,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  closeBloodRequest,
  getBloodRequestLocations,
  getSuperAdminBloodRequestDetail,
  getSuperAdminBloodRequestsPage,
  getSuperAdminBloodRequestStats,
  recordBloodRequestDonation,
  type BloodRequestFilter,
} from "@/services/bloodCenter/superAdmin/bloodRequestService";
import { submitBloodRequest } from "@/services/recipient/recipientRequestService";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import { DEFAULT_PAGE_SIZE, usePagination } from "@/app/hooks/usePagination";
import {
  buildComponentLimits,
  makeRecipientRequestSchema,
  normalizeRecipientForm,
} from "@/schema/recipient/recipientRequestSchema";
import type { RecipientRequestInput } from "@/types/recipient/receipientTypes";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";
import { reactivateDonor } from "@/services/bloodCenter/superAdmin/dashboardService";
import { StatGrid, StatTile } from "@/app/components/ui/StatTile";
import { FormInput } from "@/app/components/ui/FormInput";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import { Pagination } from "@/app/components/ui/Pagination";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";
import {
  DeactivateDonorModal,
  DonorActionButtons,
  DonorStatusBadge,
  LockDonorModal,
} from "./DonorAvailability";

const ALL = "all";

// English sub-line colour for Kannada labels on solid red/primary buttons (the
// default muted grey is unreadable there).
const ON_SOLID_EN_CLASS =
  "mt-0.5 text-[0.68em] font-normal leading-tight text-white/85";

const emptyRecipientForm: RecipientRequestInput = {
  patientName: "",
  mobileNumber: "",
  bloodGroupId: "",
  bloodComponentId: "",
  requiredUnits: "",
  age: "",
  hospitalName: "",
  address: "",
  district: "",
  city: "",
  pincode: "",
};

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

// Donors must wait this many days between donations. The backend is the source
// of truth (it rejects ineligible records with a 400); this is only used to
// disable the button up-front for instant feedback.
const DONATION_GAP_DAYS = 90;

// The date a donor becomes eligible again, or null if they've never donated or
// are already eligible. `lastBloodDonationDate` is a YYYY-MM-DD string.
function getNextEligibleDate(
  lastBloodDonationDate: string | null | undefined,
): Date | null {
  if (!lastBloodDonationDate) {
    return null;
  }

  const last = new Date(lastBloodDonationDate);

  if (Number.isNaN(last.getTime())) {
    return null;
  }

  const next = new Date(last);
  next.setDate(next.getDate() + DONATION_GAP_DAYS);

  return next > new Date() ? next : null;
}

// Donors are recruited only for PRBC and Whole Blood requests. The backend
// omits donor candidates for every other component (Platelets, Frozen Plasma,
// SDP), so matching the component name lets the UI explain the empty list
// rather than show a bare "none found".
function componentRecruitsDonors(
  componentName: string | null | undefined,
): boolean {
  if (!componentName) {
    return false;
  }

  const normalized = componentName.toLowerCase();

  return normalized.includes("prbc") || normalized.includes("whole blood");
}

export function RecipientManagement() {
  const searchPlaceholder = useBilingualText("superAdmin.searchRecipient");
  const clearSearchLabel = useBilingualText("superAdmin.clearSearch");

  // One page of requests (table rows), filtered + sorted server-side.
  const [requests, setRequests] = useState<SuperAdminBloodRequestSummary[]>([]);
  // Aggregate stat-tile figures across all requests, from
  // /admin/blood-requests/stats.
  const [stats, setStats] = useState<SuperAdminBloodRequestStats | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  // Holds the master blood-group id (as a string) or ALL — the paginated API
  // filters on ids, not names.
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>(ALL);
  const [cityFilter, setCityFilter] = useState<string>(ALL);
  // Server-side pagination state (page is 1-based in the UI, 0-based on the API).
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRequestId, setOpenRequestId] = useState<number | null>(null);
  const [logRequestOpen, setLogRequestOpen] = useState(false);
  const [masterGroups, setMasterGroups] = useState<MasterBloodGroup[]>([]);
  const [masterComponents, setMasterComponents] = useState<
    MasterBloodComponent[]
  >([]);

  // Debounce the search box so typing fires one request, not one per keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  // The UI filters mapped to the paginated API's filter shape.
  const apiFilter = useMemo<BloodRequestFilter>(() => {
    const filter: BloodRequestFilter = {};

    if (debouncedSearch.trim()) {
      filter.search = debouncedSearch.trim();
    }
    if (statusFilter !== ALL) {
      filter.statuses = [statusFilter as BloodRequestStatus];
    }
    if (bloodGroupFilter !== ALL) {
      filter.bloodGroupIds = [Number(bloodGroupFilter)];
    }
    if (cityFilter !== ALL) {
      filter.cities = [cityFilter];
    }

    return filter;
  }, [debouncedSearch, statusFilter, bloodGroupFilter, cityFilter]);

  // Any filter (or page-size) change sends us back to page 1. Done during
  // render — not in an effect — so we never fetch a stale page first.
  const filterKey = `${debouncedSearch.trim()}|${statusFilter}|${bloodGroupFilter}|${cityFilter}|${pageSize}`;
  const [priorFilterKey, setPriorFilterKey] = useState(filterKey);

  if (filterKey !== priorFilterKey) {
    setPriorFilterKey(filterKey);
    setPage(1);
  }

  // Load the current page of requests whenever the filter or page changes.
  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        const result = await getSuperAdminBloodRequestsPage(apiFilter, {
          page: page - 1,
          size: pageSize,
          sort: "createdAt,desc",
        });

        if (!cancelled) {
          setRequests(result.content);
          setTotalElements(result.totalElements);
          setTotalPages(Math.max(1, result.totalPages));
        }
      } catch (err) {
        console.error("Failed to load blood requests:", err);

        if (!cancelled) {
          setRequests([]);
          setTotalElements(0);
          setTotalPages(1);
          setError("Unable to load blood requests.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [apiFilter, page, pageSize, reloadToken]);

  // City filter options + stats. Both reload on refresh.
  useEffect(() => {
    let cancelled = false;

    getBloodRequestLocations()
      .then((locations) => {
        if (!cancelled) {
          setCityOptions(locations.cities);
        }
      })
      .catch(() => {
        // Non-critical: the City filter simply won't offer a dropdown.
      });

    getSuperAdminBloodRequestStats()
      .then((value) => {
        if (!cancelled) {
          setStats(value);
        }
      })
      .catch(() => {
        // Non-critical: stat tiles fall back to zero.
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getBloodGroups(), getBloodComponents()])
      .then(([groups, components]) => {
        if (!cancelled) {
          setMasterGroups(groups);
          setMasterComponents(components);
        }
      })
      .catch(() => {
        // Non-critical: the Log Request form still works without prefilled
        // master lists (its own inputs would just have no options yet).
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalRequests = stats?.totalRequests ?? 0;
  const openRequestCount = stats?.openRequests ?? 0;
  const closedRequestCount = stats?.closedRequests ?? 0;
  const closedUnitsCount = stats?.closedUnits ?? 0;

  // {id, name} pairs so the dropdown can show names but filter on ids.
  const bloodGroupOptions = useMemo(
    () =>
      masterGroups.map((group) => ({
        id: String(group.bloodGroupId),
        name: group.bloodGroupName,
      })),
    [masterGroups],
  );

  const isFiltering =
    search.trim().length > 0 ||
    statusFilter !== ALL ||
    bloodGroupFilter !== ALL ||
    cityFilter !== ALL;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(ALL);
    setBloodGroupFilter(ALL);
    setCityFilter(ALL);
  };

  const handleRefresh = () => {
    setSpinning(true);
    clearFilters();
    setReloadToken((token) => token + 1);
    window.setTimeout(() => setSpinning(false), 500);
  };

  // Rows before this page — add to the in-page index for continuous S.No.
  const startIndex = (page - 1) * pageSize;

  // Rendered twice: beside "Log Request" on phones, and in the filter row from
  // `sm` up (display is controlled by the caller so only one is ever visible).
  const renderRefreshButton = (displayClass: string) => (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className={`${displayClass} h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label="Refresh and clear filters"
      title="Refresh &amp; clear filters"
    >
      <RefreshCw
        size={15}
        className={
          spinning ? "animate-spin-once" : loading ? "animate-spin" : ""
        }
      />
    </button>
  );

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <StatGrid cols={4}>
        <StatTile
          icon={Users}
          value={String(totalRequests)}
          label={
            <Bilingual
              tKey="superAdmin.totalRequestsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-red)"
          index={0}
        />

        <StatTile
          icon={AlertCircle}
          value={String(openRequestCount)}
          label={
            <Bilingual
              tKey="superAdmin.openRequestsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-yellow)"
          index={1}
        />

        <StatTile
          icon={CheckCircle2}
          value={String(closedRequestCount)}
          label={
            <Bilingual
              tKey="superAdmin.closedRequestsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-green)"
          index={2}
        />

        <StatTile
          icon={Droplets}
          value={String(closedUnitsCount)}
          label={
            <Bilingual
              tKey="superAdmin.closedUnitsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-blue)"
          index={3}
        />
      </StatGrid>

      {/* Search + filters */}
      <div className="animate-rise space-y-3 rounded-2xl border border-[var(--color-border-lighter)] bg-white p-3 shadow-[0_3px_15px_rgba(0,0,0,0.025)] sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full min-w-0 sm:max-w-[480px] sm:flex-1">
            <Search
              size={18}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-[46px] w-full rounded-xl border border-[var(--color-border-light)] bg-white pl-11 pr-10 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] sm:right-2.5 sm:h-7 sm:w-7"
                aria-label={clearSearchLabel}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Phones: "Log Request" and refresh share a row. From sm the
              wrapper dissolves, so the button sits in the toolbar row as before. */}
          <div className="flex items-center gap-2 sm:contents">
            <button
              type="button"
              onClick={() => setLogRequestOpen(true)}
              className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:ml-auto sm:w-auto sm:flex-none sm:shrink-0 sm:text-[14px]"
            >
              <Plus size={16} className="shrink-0" />
              Log Request
            </button>

            {renderRefreshButton("flex sm:hidden")}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {/* Selects: 2-up grid on phones, with the longest label ("All blood
              groups") on its own row so it isn't clipped; flattened into the
              toolbar row from sm. */}
          <div className="grid grid-cols-2 gap-2 sm:contents">
          <div className="relative min-w-0 max-sm:order-1">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 max-sm:truncate max-sm:pl-2.5 max-sm:pr-6 sm:w-auto ${
                statusFilter !== ALL
                  ? "border-[var(--primary-200)] font-medium"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <option value={ALL}>All statuses</option>
              <option value="CENTRES_FOUND">Matched</option>
              <option value="NO_CENTRES_FOUND">No Centres</option>
              <option value="CLOSED">Closed</option>
              <option value="PARTIALLY_CLOSED">Partially Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
          </div>

          {bloodGroupOptions.length > 0 && (
            <div className="relative min-w-0 max-sm:order-3 max-sm:col-span-2">
              <select
                value={bloodGroupFilter}
                onChange={(event) => setBloodGroupFilter(event.target.value)}
                aria-label="Filter by blood group"
                className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 max-sm:truncate max-sm:pl-2.5 max-sm:pr-6 sm:w-auto ${
                  bloodGroupFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All blood groups</option>
                {bloodGroupOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          {cityOptions.length > 0 && (
            <div className="relative min-w-0 max-sm:order-2">
              <select
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                aria-label="Filter by city"
                className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 max-sm:truncate max-sm:pl-2.5 max-sm:pr-6 sm:w-auto ${
                  cityFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All cities</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}
          </div>

          <div className="flex items-center gap-3 max-sm:contents">
            {renderRefreshButton("hidden sm:flex")}

            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[12px] font-medium text-[var(--color-primary)] transition hover:underline max-sm:h-10 max-sm:rounded-lg max-sm:border max-sm:border-[var(--primary-200)] max-sm:bg-[var(--color-icon-bg-soft)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {!loading && isFiltering && (
        <Bilingual
          tKey="superAdmin.resultsCount"
          params={{ shown: totalElements, total: totalRequests }}
          as="p"
          className="px-1 text-[12px] text-[var(--color-text-placeholder-alt)]"
        />
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span className="min-w-0">{error}</span>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] lg:block">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[11%]" />
            <col className="w-[6%]" />
            <col className="w-[7%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]">
              <TableHeader tKey="superAdmin.sNo" />
              <TableHeader tKey="recipient.patientName" />
              <TableHeader tKey="superAdmin.phoneNumber" />
              <TableHeader tKey="bloodCentre.bloodGroup" />
              <TableHeader tKey="superAdmin.bloodComponent" />
              <TableHeader tKey="bloodCentre.units" />
              <TableHeader tKey="superAdmin.unitsFulfilled" />
              <TableHeader tKey="common.city" />
              <TableHeader tKey="superAdmin.requestedOn" />
              <TableHeader tKey="superAdmin.status" />
              <TableHeader tKey="superAdmin.action" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11}>
                  <LoadingState />
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request, index) => (
                <tr
                  key={request.id}
                  onClick={() => setOpenRequestId(request.id)}
                  className="cursor-pointer border-b border-[var(--color-border-light)] transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)]"
                >
                  <TableCell>{startIndex + index + 1}</TableCell>

                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                        <UserRound
                          size={15}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <span
                        className="truncate font-semibold text-[var(--color-text-body)]"
                        title={request.recipientName}
                      >
                        {request.recipientName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{request.mobileNumber}</TableCell>

                  <TableCell>
                    <BloodGroupBadge value={request.bloodGroup} />
                  </TableCell>

                  <TableCell>
                    <span
                      className="block truncate"
                      title={request.bloodComponent}
                    >
                      {request.bloodComponent}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-[var(--color-text-body)]">
                      {request.units}
                    </span>
                  </TableCell>

                  <TableCell>
                    {request.closedUnits !== null ? (
                      <span className="font-bold text-emerald-600">
                        {request.closedUnits}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-placeholder)]">
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="block truncate">{request.city}</span>
                  </TableCell>

                  <TableCell>{formatDate(request.createdAt)}</TableCell>

                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenRequestId(request.id);
                      }}
                      className="
                        rounded-lg
                        border
                        border-[var(--color-border-lighter)]
                        bg-white
                        px-3
                        py-1.5
                        text-[11px]
                        font-semibold
                        text-[var(--color-primary)]
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-px
                        hover:border-[var(--primary-200)]
                        hover:bg-[var(--color-icon-bg-soft)]
                      "
                    >
                      <BilingualInline tKey="superAdmin.view" />
                    </button>
                  </TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11}>
                  <EmptyState tKey="superAdmin.noBloodRequestsFound" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="space-y-3 sm:space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white">
            <LoadingState />
          </div>
        ) : requests.length > 0 ? (
          requests.map((request, index) => (
            <div
              key={request.id}
              onClick={() => setOpenRequestId(request.id)}
              className="cursor-pointer rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] transition-colors duration-150 active:bg-[var(--color-icon-bg-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                    <UserRound
                      size={19}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <Bilingual
                      tKey="superAdmin.sNoValue"
                      params={{ index: startIndex + index + 1 }}
                      as="p"
                      className="text-[11px] text-[var(--color-text-placeholder)]"
                    />

                    <h3 className="break-words text-[15px] font-bold leading-tight text-[var(--color-text-body)]">
                      {request.recipientName}
                    </h3>
                  </div>
                </div>

                <BloodGroupBadge value={request.bloodGroup} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MobileInfoRow
                  icon={Phone}
                  tKey="superAdmin.phoneNumber"
                  value={request.mobileNumber}
                />
                <MobileInfoRow
                  icon={Droplets}
                  tKey="superAdmin.bloodComponent"
                  value={request.bloodComponent}
                />
                <MobileInfoRow
                  icon={Droplets}
                  tKey="bloodCentre.units"
                  value={String(request.units)}
                />
                {request.closedUnits !== null && (
                  <MobileInfoRow
                    icon={Droplets}
                    tKey="superAdmin.unitsFulfilled"
                    value={String(request.closedUnits)}
                  />
                )}
                <MobileInfoRow
                  icon={MapPin}
                  tKey="common.city"
                  value={request.city}
                />
                <MobileInfoRow
                  icon={CalendarDays}
                  tKey="superAdmin.requestedOn"
                  value={formatDate(request.createdAt)}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <StatusBadge status={request.status} />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenRequestId(request.id);
                  }}
                  className="
                    ml-auto
                    min-h-10
                    rounded-lg
                    border
                    border-[var(--color-border-lighter)]
                    bg-white
                    px-3.5
                    py-2
                    text-[12px]
                    font-semibold
                    text-[var(--color-primary)]
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-[var(--primary-200)]
                    hover:bg-[var(--color-icon-bg-soft)]
                  "
                >
                  <BilingualInline tKey="superAdmin.viewDetails" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white">
            <EmptyState tKey="superAdmin.noBloodRequestsFound" />
          </div>
        )}
      </div>

      {!loading && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="mt-4"
        />
      )}

      {openRequestId !== null && (
        <BloodRequestDetailModal
          bloodRequestId={openRequestId}
          onClose={() => setOpenRequestId(null)}
          onChanged={(updated) => {
            setRequests((current) =>
              current.map((request) =>
                request.id === updated.id
                  ? { ...request, status: updated.status }
                  : request,
              ),
            );
          }}
        />
      )}

      {logRequestOpen && (
        <LogRequestModal
          bloodGroups={masterGroups}
          bloodComponents={masterComponents}
          onClose={() => setLogRequestOpen(false)}
          onSaved={() => {
            setLogRequestOpen(false);
            setReloadToken((token) => token + 1);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   LOG REQUEST MODAL — logs a request on behalf of a caller via the same
   public endpoint the recipient self-service form uses
   (POST /public/blood-requests).
============================================================ */

function LogRequestModal({
  bloodGroups,
  bloodComponents,
  onClose,
  onSaved,
}: {
  bloodGroups: MasterBloodGroup[];
  bloodComponents: MasterBloodComponent[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const enterFullName = useBilingualText("recipient.enterPatientName");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const enterAge = useBilingualText("recipient.enterAge");
  const enterHospitalAddress = useBilingualText(
    "recipient.enterHospitalAddress",
  );
  const enterHospitalDistrict = useBilingualText(
    "recipient.enterHospitalDistrict",
  );
  const enterHospitalCity = useBilingualText("recipient.enterHospitalCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState("");

  // Per-component unit ceilings (PRBC 6, Whole Blood 3, Platelets/Frozen Plasma
  // 12, SDP none) — same rule the recipient self-service form enforces.
  const componentLimits = useMemo(
    () => buildComponentLimits(bloodComponents),
    [bloodComponents],
  );

  const schema = useMemo(
    () => makeRecipientRequestSchema(componentLimits),
    [componentLimits],
  );

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RecipientRequestInput>({
    resolver: zodResolver(schema) as Resolver<RecipientRequestInput>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: emptyRecipientForm,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");

    const normalized = normalizeRecipientForm(values);

    try {
      await submitBloodRequest({
        recipientName: normalized.patientName,
        mobileNumber: normalized.mobileNumber,
        bloodGroupId: Number(normalized.bloodGroupId),
        bloodComponentId: Number(normalized.bloodComponentId),
        requiredUnits: Number(normalized.requiredUnits),
        age: Number(normalized.age),
        hospitalName: normalized.hospitalName || undefined,
        address: normalized.address || undefined,
        city: normalized.city,
        district: normalized.district,
        pincode: normalized.pincode,
      });

      onSaved();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to log this request."));
    }
  });

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-request-title"
    >
      <div
        className={`motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden sm:max-h-[90dvh] rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                <Droplets size={17} className="text-[var(--color-primary)]" />
              </div>

              <div className="min-w-0">
                <h2
                  id="log-request-title"
                  className="text-[14px] font-bold text-[var(--color-text-primary)]"
                >
                  Log Request
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                  Submit a blood request on a caller&apos;s behalf
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:m-0 sm:h-8 sm:w-8"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:grid-cols-2 sm:px-5 sm:py-5">
            <div className="sm:col-span-2">
              <FormInput
                icon={UserRound}
                label="Patient Name"
                required
                placeholder={enterFullName}
                error={errors.patientName?.message}
                {...register("patientName")}
              />
            </div>

            <FormInput
              icon={Phone}
              label="Mobile Number"
              required
              inputMode="numeric"
              maxLength={10}
              placeholder={enter10DigitMobile}
              error={errors.mobileNumber?.message}
              {...register("mobileNumber")}
            />

            <FormInput
              icon={CalendarDays}
              label="Age"
              required
              inputMode="numeric"
              maxLength={3}
              placeholder={enterAge}
              error={errors.age?.message}
              {...register("age")}
            />

            <div>
              <label
                htmlFor="log-request-blood-group"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              >
                Blood Group<span className="text-red-500"> *</span>
              </label>

              <div className="relative">
                <select
                  id="log-request-blood-group"
                  aria-invalid={errors.bloodGroupId ? true : undefined}
                  aria-describedby={
                    errors.bloodGroupId
                      ? "log-request-blood-group-error"
                      : undefined
                  }
                  {...register("bloodGroupId", { valueAsNumber: true })}
                  className={`h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 ${
                    errors.bloodGroupId
                      ? "border-red-400"
                      : "border-[var(--color-border)]"
                  } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group.bloodGroupId} value={group.bloodGroupId}>
                      {group.bloodGroupName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
                />
              </div>

              {errors.bloodGroupId && (
                <p
                  id="log-request-blood-group-error"
                  role="alert"
                  className="mt-1 text-[12px] text-red-500"
                >
                  {errors.bloodGroupId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="log-request-blood-type"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              >
                Blood Component<span className="text-red-500"> *</span>
              </label>

              <div className="relative">
                <select
                  id="log-request-blood-type"
                  aria-invalid={errors.bloodComponentId ? true : undefined}
                  aria-describedby={
                    errors.bloodComponentId
                      ? "log-request-blood-type-error"
                      : undefined
                  }
                  {...register("bloodComponentId", {
                    valueAsNumber: true,
                    onChange: () => {
                      // Re-check the units ceiling against the new component,
                      // but only once units have been entered.
                      if (getValues("requiredUnits")) {
                        void trigger("requiredUnits");
                      }
                    },
                  })}
                  className={`h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 ${
                    errors.bloodComponentId
                      ? "border-red-400"
                      : "border-[var(--color-border)]"
                  } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`}
                >
                  <option value="">Select blood component</option>
                  {bloodComponents.map((component) => (
                    <option
                      key={component.bloodComponentId}
                      value={component.bloodComponentId}
                    >
                      {component.bloodComponentName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
                />
              </div>

              {errors.bloodComponentId && (
                <p
                  id="log-request-blood-type-error"
                  role="alert"
                  className="mt-1 text-[12px] text-red-500"
                >
                  {errors.bloodComponentId.message}
                </p>
              )}
            </div>

            <FormInput
              icon={Droplets}
              label="Units Required"
              required
              inputMode="numeric"
              placeholder="e.g. 2"
              error={errors.requiredUnits?.message}
              {...register("requiredUnits")}
            />

            <FormInput
              icon={MapPin}
              label="Hospital Name (optional)"
              error={errors.hospitalName?.message}
              {...register("hospitalName")}
            />

            <div className="sm:col-span-2">
              <FormInput
                icon={MapPin}
                label="Hospital Address (optional)"
                placeholder={enterHospitalAddress}
                error={errors.address?.message}
                {...register("address")}
              />
            </div>

            <FormInput
              icon={MapPin}
              label="Hospital District"
              required
              placeholder={enterHospitalDistrict}
              error={errors.district?.message}
              {...register("district")}
            />

            <FormInput
              icon={MapPin}
              label="Hospital City"
              required
              placeholder={enterHospitalCity}
              error={errors.city?.message}
              {...register("city")}
            />

            <FormInput
              icon={MapPin}
              label="Pincode"
              required
              inputMode="numeric"
              maxLength={6}
              placeholder={enter6DigitPinCode}
              error={errors.pincode?.message}
              {...register("pincode")}
            />

            {submitError && (
              <p role="alert" className="sm:col-span-2 text-[12px] text-red-500">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-3 sm:px-5 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[40px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BilingualInline tKey="common.cancel" />
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all hover:bg-[var(--color-dashboard-cta-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 size={14} className="animate-spin shrink-0" />
              )}
              {isSubmitting ? (
                <BilingualInline
                  tKey="common.saving"
                  enClassName={ON_SOLID_EN_CLASS}
                />
              ) : (
                "Log Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL MODAL
============================================================ */

function BloodRequestDetailModal({
  bloodRequestId,
  onClose,
  onChanged,
}: {
  bloodRequestId: number;
  onClose: () => void;
  onChanged: (detail: SuperAdminBloodRequestDetail) => void;
}) {
  const [detail, setDetail] = useState<SuperAdminBloodRequestDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [recordingDonorId, setRecordingDonorId] = useState<number | null>(null);
  const [confirmDonorId, setConfirmDonorId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeRemarks, setCloseRemarks] = useState("");
  const [closeUnits, setCloseUnits] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  // Donor availability actions, invoked from the candidate list.
  const [donorToLock, setDonorToLock] = useState<SuperAdminDonor | null>(null);
  const [donorToDeactivate, setDonorToDeactivate] =
    useState<SuperAdminDonor | null>(null);
  const [donorToReactivate, setDonorToReactivate] =
    useState<SuperAdminDonor | null>(null);
  const [reactivatingDonor, setReactivatingDonor] = useState(false);
  const [successMessageKey, setSuccessMessageKey] = useState<string | null>(
    null,
  );
  const closeLabel = useBilingualText("common.close");
  const remarksPlaceholder = useBilingualText("bloodCentre.remarksOptional");
  const unitsFulfilledPlaceholder = useBilingualText(
    "superAdmin.unitsFulfilledPlaceholder",
  );
  const unitsExceedError = useBilingualText("superAdmin.unitsFulfilledExceeds", {
    required: detail?.units ?? 0,
  });
  // Live check so the error shows at the field as the user types, not only on
  // submit. Floored to match what handleClose actually sends.
  const closeUnitsExceeds =
    closeUnits.trim() !== "" &&
    Number.isFinite(Number(closeUnits)) &&
    Math.floor(Number(closeUnits)) > (detail?.units ?? 0);
  // Fewer units fulfilled than required — the backend will mark the request
  // Partially Closed. We don't send a status; this is just an advance hint.
  const closeUnitsPartial =
    closeUnits.trim() !== "" &&
    Number.isFinite(Number(closeUnits)) &&
    Math.floor(Number(closeUnits)) < (detail?.units ?? 0);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      try {
        setLoading(true);
        setError("");

        const data = await getSuperAdminBloodRequestDetail(bloodRequestId);

        if (!cancelled) {
          setDetail(data);
        }
      } catch (err) {
        console.error("Failed to load blood request detail:", err);

        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "Unable to load this blood request."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [bloodRequestId]);

  const isOpen =
    detail?.status === "CENTRES_FOUND" || detail?.status === "NO_CENTRES_FOUND";
  // Both fully and partially closed requests carry fulfilled units to show.
  const isClosed =
    detail?.status === "CLOSED" || detail?.status === "PARTIALLY_CLOSED";

  const age = detail?.age ?? null;
  const ageText = useBilingualText("superAdmin.ageYears", { age: age ?? "" });

  // Donor candidates are only sent for PRBC and Whole Blood requests.
  const recruitsDonors = componentRecruitsDonors(detail?.bloodComponent);

  // Approximate units fulfilled, captured when the request was closed. Null for
  // requests closed before this field existed.
  const closedUnits = detail?.closedUnits ?? null;
  const unitsClosedText = useBilingualText("superAdmin.unitsClosedValue", {
    closed: closedUnits ?? 0,
    required: detail?.units ?? 0,
  });

  // Candidates who already donated for this request are left out; the backend
  // already right-sizes the list (6 for PRBC, 3 for Whole Blood) so the rest
  // are shown as sent.
  const pendingCandidates = useMemo(() => {
    if (!detail) return [];

    const donatedIds = new Set(detail.donatedBy.map((donor) => donor.id));
    return detail.donorCandidates.filter((donor) => !donatedIds.has(donor.id));
  }, [detail]);

  const handleRecordDonation = async (donorId: number) => {
    setConfirmDonorId(null);
    setRecordingDonorId(donorId);
    setActionError("");

    try {
      const updated = await recordBloodRequestDonation(bloodRequestId, donorId);

      setDetail(updated);
      onChanged(updated);
      setSuccessMessageKey("superAdmin.donationRecordedSuccess");
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "Unable to record this donation."),
      );
    } finally {
      setRecordingDonorId(null);
    }
  };

  // Replace a donor (by id) wherever they appear in the loaded detail, so a
  // lock/deactivate/reactivate reflects immediately without a refetch.
  const applyDonorUpdate = (updated: SuperAdminDonor) => {
    setDetail((current) => {
      if (!current) {
        return current;
      }

      const replace = (list: SuperAdminDonor[]) =>
        list.map((donor) => (donor.id === updated.id ? updated : donor));

      return {
        ...current,
        donatedBy: replace(current.donatedBy),
        donorCandidates: replace(current.donorCandidates),
      };
    });
  };

  const handleDonorReactivate = async () => {
    if (!donorToReactivate) {
      return;
    }

    setReactivatingDonor(true);
    setActionError("");

    try {
      const updated = await reactivateDonor(donorToReactivate.id);
      applyDonorUpdate(updated);
      setDonorToReactivate(null);
      setSuccessMessageKey("superAdmin.donorReactivatedSuccess");
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "Unable to reactivate this donor."),
      );
      setDonorToReactivate(null);
    } finally {
      setReactivatingDonor(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    setActionError("");

    // Optional, approximate — send only a valid non-negative whole number.
    const trimmedUnits = closeUnits.trim();
    const parsedUnits = Number(trimmedUnits);
    const unitsToSend =
      trimmedUnits !== "" && Number.isFinite(parsedUnits) && parsedUnits >= 0
        ? Math.floor(parsedUnits)
        : undefined;

    // Fulfilled units can't exceed what was requested.
    if (unitsToSend !== undefined && unitsToSend > (detail?.units ?? 0)) {
      setActionError(unitsExceedError);
      setClosing(false);
      return;
    }

    try {
      const updated = await closeBloodRequest(
        bloodRequestId,
        closeRemarks.trim() || undefined,
        unitsToSend,
      );

      setDetail(updated);
      onChanged(updated);
      setShowCloseForm(false);
      setConfirmCloseOpen(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to close this request."));
    } finally {
      setClosing(false);
    }
  };

  const confirmDonorName = detail?.donorCandidates.find(
    (donor) => donor.id === confirmDonorId,
  )?.donorName;

  return (
    <>
    <div
      className="
        motion-scrim
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        py-4
        backdrop-blur-md
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="blood-request-title"
    >
      <div
        className="
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[640px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
          sm:max-h-[90dvh]
        "
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0">
            <Bilingual
              tKey="superAdmin.bloodRequestDetails"
              as="h2"
              id="blood-request-title"
              className="text-[15px] font-bold text-[var(--color-text-primary)]"
            />

            <Bilingual
              tKey="superAdmin.requestNumber"
              params={{ id: bloodRequestId }}
              as="p"
              className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]"
            />
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {loading && <LoadingState />}

          {!loading && error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span className="min-w-0">{error}</span>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="space-y-5">
              {/* SUMMARY */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 max-w-full">
                  <h3 className="break-words text-[16px] font-bold text-[var(--color-text-body)] sm:truncate">
                    {detail.recipientName}
                  </h3>
                  <p className="mt-0.5 break-words text-[12px] text-[var(--color-text-placeholder-alt)]">
                    {detail.mobileNumber}
                  </p>
                </div>

                <StatusBadge status={detail.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoTile
                  tKey="bloodCentre.bloodGroup"
                  value={detail.bloodGroup}
                />
                <InfoTile tKey="superAdmin.bloodComponent" value={detail.bloodComponent} />
                <InfoTile tKey="recipient.unitsRequired" value={String(detail.units)} />
                <InfoTile
                  tKey="superAdmin.age"
                  value={age !== null ? ageText : "—"}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoTile tKey="superAdmin.hospital" value={detail.hospitalName || "—"} />
                <InfoTile
                  tKey="superAdmin.hospitalAddress"
                  value={
                    [detail.address, detail.city, detail.district, detail.pincode]
                      .filter(
                        (part, index, all) =>
                          Boolean(part) && all.indexOf(part) === index,
                      )
                      .join(", ") || "—"
                  }
                />
              </div>

              {(isClosed || detail.remarks) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {isClosed && (
                    <InfoTile
                      tKey="superAdmin.unitsClosed"
                      value={closedUnits !== null ? unitsClosedText : "—"}
                    />
                  )}
                  {detail.remarks && (
                    <div className={isClosed ? "min-w-0" : "min-w-0 sm:col-span-2"}>
                      <InfoTile tKey="superAdmin.remarks" value={detail.remarks} />
                    </div>
                  )}
                </div>
              )}

              {actionError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="min-w-0">{actionError}</span>
                </div>
              )}

              {/* MATCHED CENTRES */}
              <Section
                tKey="superAdmin.matchedCentres"
                params={{ count: detail.matchedCentres.length }}
              >
                <MatchedCentresList centres={detail.matchedCentres} />
              </Section>

              {/* DONATED BY */}
              {detail.donatedBy.length > 0 && (
                <Section
                  tKey="superAdmin.donatedBy"
                  params={{ count: detail.donatedBy.length }}
                >
                  <DonatedByList donors={detail.donatedBy} />
                </Section>
              )}

              {/* DONOR CANDIDATES — only recruited for PRBC and Whole Blood */}
              {recruitsDonors ? (
                <Section
                  tKey="superAdmin.donorCandidates"
                  params={{ count: pendingCandidates.length }}
                >
                  <DonorCandidatesList
                    donors={pendingCandidates}
                    isOpen={isOpen}
                    recordingDonorId={recordingDonorId}
                    onRecord={setConfirmDonorId}
                    onLock={setDonorToLock}
                    onDeactivate={setDonorToDeactivate}
                    onReactivate={setDonorToReactivate}
                  />
                </Section>
              ) : (
                <Section tKey="superAdmin.donorCandidatesTitle">
                  <Bilingual
                    tKey="superAdmin.donorsNotRecruitedForComponent"
                    params={{ component: detail.bloodComponent }}
                    as="p"
                    className="text-[12px] text-[var(--color-text-placeholder-alt)]"
                  />
                </Section>
              )}

              {/* CLOSE REQUEST */}
              {isOpen && (
                <Section tKey="superAdmin.closeRequest">
                  {!showCloseForm ? (
                    <button
                      type="button"
                      onClick={() => setShowCloseForm(true)}
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-[var(--color-border)]
                        bg-white
                        px-4
                        py-2.5
                        sm:min-h-0
                        sm:justify-start
                        text-[12px]
                        font-semibold
                        text-[var(--color-text-quaternary)]
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >
                      <XCircle size={15} className="shrink-0" />
                      <BilingualInline tKey="superAdmin.closeThisRequest" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <label className="block space-y-1.5">
                        <Bilingual
                          tKey="superAdmin.unitsFulfilled"
                          as="span"
                          className="block text-[12px] font-semibold text-[var(--color-text-quaternary)]"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={detail.units}
                          step={1}
                          value={closeUnits}
                          onChange={(event) =>
                            setCloseUnits(event.target.value)
                          }
                          placeholder={unitsFulfilledPlaceholder}
                          disabled={closing}
                          onWheel={(event) => event.currentTarget.blur()}
                          aria-invalid={closeUnitsExceeds ? true : undefined}
                          className={`
                            w-full
                            rounded-lg
                            border
                            bg-white
                            px-3
                            py-2.5
                            text-[13px]
                            text-[var(--color-text-body)]
                            outline-none
                            transition
                            placeholder:text-[var(--color-text-placeholder)]
                            focus:ring-2
                            ${
                              closeUnitsExceeds
                                ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                                : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                            }
                          `}
                        />
                        {closeUnitsExceeds && (
                          <span className="block text-[12px] font-medium text-red-600">
                            {unitsExceedError}
                          </span>
                        )}
                        {!closeUnitsExceeds && closeUnitsPartial && (
                          <Bilingual
                            tKey="superAdmin.partiallyClosedHint"
                            as="span"
                            className="block text-[12px] font-medium text-amber-600"
                          />
                        )}
                      </label>

                      <textarea
                        value={closeRemarks}
                        onChange={(event) =>
                          setCloseRemarks(event.target.value)
                        }
                        placeholder={remarksPlaceholder}
                        rows={2}
                        disabled={closing}
                        className="
                          w-full
                          resize-none
                          rounded-lg
                          border
                          border-[var(--color-border)]
                          bg-white
                          px-3
                          py-2.5
                          text-[13px]
                          text-[var(--color-text-body)]
                          outline-none
                          transition
                          placeholder:text-[var(--color-text-placeholder)]
                          focus:border-[var(--color-primary)]
                          focus:ring-2
                          focus:ring-[var(--color-primary)]/10
                        "
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCloseForm(false)}
                          disabled={closing}
                          className="min-h-11 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[12px] sm:min-h-[38px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <BilingualInline tKey="common.cancel" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmCloseOpen(true)}
                          disabled={closing || closeUnitsExceeds}
                          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 sm:min-h-[38px] text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.22)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {closing && (
                            <Loader2 size={13} className="animate-spin shrink-0" />
                          )}
                          {closing ? (
                            <BilingualInline
                              tKey="superAdmin.closing"
                              enClassName={ON_SOLID_EN_CLASS}
                            />
                          ) : (
                            <BilingualInline
                              tKey="superAdmin.confirmClose"
                              enClassName={ON_SOLID_EN_CLASS}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      <ConfirmDialog
        open={confirmCloseOpen}
        title="Close this request?"
        description="This marks the blood request as closed. This can't be undone from here."
        confirmLabel={
          <BilingualInline
            tKey="superAdmin.confirmClose"
            enClassName={ON_SOLID_EN_CLASS}
          />
        }
        danger
        loading={closing}
        onConfirm={handleClose}
        onCancel={() => setConfirmCloseOpen(false)}
      />

      <ConfirmDialog
        open={confirmDonorId !== null}
        title="Record this donation?"
        description={
          confirmDonorName
            ? `This marks ${confirmDonorName} as having donated for this request.`
            : "This marks the selected donor as having donated for this request."
        }
        confirmLabel={
          <BilingualInline
            tKey="superAdmin.recordDonation"
            enClassName={ON_SOLID_EN_CLASS}
          />
        }
        loading={recordingDonorId !== null}
        onConfirm={() => {
          if (confirmDonorId !== null) {
            handleRecordDonation(confirmDonorId);
          }
        }}
        onCancel={() => setConfirmDonorId(null)}
      />

      {donorToLock && (
        <LockDonorModal
          donor={donorToLock}
          onClose={() => setDonorToLock(null)}
          onSaved={(updated) => {
            applyDonorUpdate(updated);
            setDonorToLock(null);
            setSuccessMessageKey("superAdmin.donorLockedSuccess");
          }}
        />
      )}

      {donorToDeactivate && (
        <DeactivateDonorModal
          donor={donorToDeactivate}
          onClose={() => setDonorToDeactivate(null)}
          onSaved={(updated) => {
            applyDonorUpdate(updated);
            setDonorToDeactivate(null);
            setSuccessMessageKey("superAdmin.donorDeactivatedSuccess");
          }}
        />
      )}

      <ConfirmDialog
        open={donorToReactivate !== null}
        title={<BilingualInline tKey="superAdmin.confirmReactivateTitle" />}
        description={<BilingualInline tKey="superAdmin.confirmReactivateDesc" />}
        confirmLabel={
          <BilingualInline
            tKey="superAdmin.reactivateDonor"
            enClassName={ON_SOLID_EN_CLASS}
          />
        }
        loading={reactivatingDonor}
        onConfirm={handleDonorReactivate}
        onCancel={() => setDonorToReactivate(null)}
      />

      <SuccessModal
        open={successMessageKey !== null}
        title={
          successMessageKey ? (
            <BilingualInline tKey={successMessageKey} />
          ) : (
            ""
          )
        }
        onConfirm={() => setSuccessMessageKey(null)}
      />
    </>
  );
}

const MODAL_LIST_PAGE_SIZE = 5;

function MatchedCentresList({
  centres,
}: {
  centres: SuperAdminBloodRequestCentre[];
}) {
  const { page, pageSize, totalItems, totalPages, pageItems, setPage } =
    usePagination(centres, { pageSize: MODAL_LIST_PAGE_SIZE });

  if (centres.length === 0) {
    return (
      <Bilingual
        tKey="superAdmin.noCentresMatched"
        as="p"
        className="text-[12px] text-[var(--color-text-placeholder-alt)]"
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {pageItems.map((centre) => (
          <div
            key={centre.id}
            className="rounded-lg border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-3.5 py-2.5"
          >
            <p className="break-words text-[13px] font-bold text-[var(--color-text-body)] sm:text-[12px]">
              {centre.bloodBankName}
            </p>
            <p className="mt-0.5 break-words text-[12px] text-[var(--color-text-placeholder-alt)] sm:text-[11px]">
              {centre.address} · {centre.city} · {centre.phoneNumber}
            </p>
          </div>
        ))}
      </div>

      {totalItems > pageSize && (
        <Pagination
          compact
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-lg"
        />
      )}
    </>
  );
}

function DonatedByList({ donors }: { donors: SuperAdminDonor[] }) {
  const { page, pageSize, totalItems, totalPages, pageItems, setPage } =
    usePagination(donors, { pageSize: MODAL_LIST_PAGE_SIZE });

  return (
    <>
      <div className="space-y-2">
        {pageItems.map((donor, index) => (
          // A donor can donate multiple units to one request, so donor.id is
          // not unique here — pair it with the row index for a stable key.
          <div
            key={`${donor.id}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-success-bg)] bg-[var(--color-success-bg)] px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="break-words text-[13px] font-bold text-[var(--color-text-body)] sm:truncate sm:text-[12px]">
                {donor.donorName}
              </p>
              <p className="text-[12px] text-[var(--color-text-placeholder-alt)] sm:text-[11px]">
                {donor.mobileNumber} · {donor.bloodGroup}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)] sm:text-[11px]">
                <BilingualInline tKey="superAdmin.lastBloodDonation" />
                : {formatDate(donor.lastBloodDonationDate)}
              </p>
            </div>

            <CheckCircle2
              size={17}
              className="shrink-0 text-[var(--color-success)]"
            />
          </div>
        ))}
      </div>

      {totalItems > pageSize && (
        <Pagination
          compact
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-lg"
        />
      )}
    </>
  );
}

// The "Record Donation" action for a single candidate. Disabled while another
// record is in flight, or when the donor is still inside the 90-day gap — the
// backend enforces the gap too (a 400), this is just instant feedback.
function RecordDonationButton({
  donor,
  recording,
  disabled,
  onRecord,
}: {
  donor: SuperAdminDonor;
  recording: boolean;
  disabled: boolean;
  onRecord: (donorId: number) => void;
}) {
  const notEligible = getNextEligibleDate(donor.lastBloodDonationDate) !== null;

  return (
    <button
      type="button"
      onClick={() => onRecord(donor.id)}
      disabled={disabled || notEligible}
      className="
        flex
        min-h-10
        flex-1
        shrink-0
        items-center
        justify-center
        gap-1.5
        rounded-lg
        bg-[var(--color-primary)]
        px-3
        py-1.5
        sm:min-h-0
        sm:flex-none
        text-[11px]
        font-semibold
        text-white
        shadow-[0_4px_12px_rgba(255,59,63,0.18)]
        transition-all
        hover:bg-[var(--color-dashboard-cta-hover)]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {recording && <Loader2 size={12} className="animate-spin shrink-0" />}
      <BilingualInline
        tKey="superAdmin.recordDonation"
        enClassName={ON_SOLID_EN_CLASS}
      />
    </button>
  );
}

// Full-width note under a candidate card explaining why "Record Donation" is
// disabled — the donor donated within the 90-day gap. A disabled button
// swallows hover, so a title tooltip would never show; this states it plainly.
function DonorEligibilityNote({ donor }: { donor: SuperAdminDonor }) {
  const nextEligible = getNextEligibleDate(donor.lastBloodDonationDate);
  const label = useBilingualText("superAdmin.notEligibleUntil", {
    date: nextEligible ? formatDate(nextEligible.toISOString()) : "",
  });

  if (!nextEligible) {
    return null;
  }

  return (
    <p className="mt-2 text-[11px] font-medium leading-tight text-amber-600">
      {label}
    </p>
  );
}

// Lists every donor the backend sent for this request. The backend already
// caps the list to the request's component (6 for PRBC, 3 for Whole Blood), so
// the frontend shows all of them — paginated for tidiness, nothing hidden.
function DonorCandidatesList({
  donors,
  isOpen,
  recordingDonorId,
  onRecord,
  onLock,
  onDeactivate,
  onReactivate,
}: {
  donors: SuperAdminDonor[];
  isOpen: boolean;
  recordingDonorId: number | null;
  onRecord: (donorId: number) => void;
  onLock: (donor: SuperAdminDonor) => void;
  onDeactivate: (donor: SuperAdminDonor) => void;
  onReactivate: (donor: SuperAdminDonor) => void;
}) {
  const { page, pageSize, totalItems, totalPages, pageItems, setPage } =
    usePagination(donors, { pageSize: MODAL_LIST_PAGE_SIZE });

  if (donors.length === 0) {
    return (
      <Bilingual
        tKey="superAdmin.noMatchingDonorCandidates"
        as="p"
        className="text-[12px] text-[var(--color-text-placeholder-alt)]"
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {pageItems.map((donor) => (
          <div
            key={donor.id}
            className="rounded-lg border border-[var(--color-border-lighter)] bg-white px-3.5 py-2.5"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words text-[13px] font-bold text-[var(--color-text-body)] sm:truncate sm:text-[12px]">
                  {donor.donorName}
                </p>
                {!donor.available && <DonorStatusBadge donor={donor} />}
              </div>
              <p className="break-words text-[12px] text-[var(--color-text-placeholder-alt)] sm:text-[11px]">
                {donor.mobileNumber} · {donor.bloodGroup} ·{" "}
                {donor.city}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)] sm:text-[11px]">
                <BilingualInline tKey="superAdmin.lastBloodDonation" />
                : {formatDate(donor.lastBloodDonationDate)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
              {isOpen && (
                <RecordDonationButton
                  donor={donor}
                  recording={recordingDonorId === donor.id}
                  disabled={recordingDonorId !== null}
                  onRecord={onRecord}
                />
              )}

              <DonorActionButtons
                donor={donor}
                labeled
                onLock={() => onLock(donor)}
                onDeactivate={() => onDeactivate(donor)}
                onReactivate={() => onReactivate(donor)}
              />
            </div>
            </div>

            {isOpen && <DonorEligibilityNote donor={donor} />}
          </div>
        ))}
      </div>

      {totalItems > pageSize && (
        <Pagination
          compact
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-lg"
        />
      )}
    </>
  );
}

function Section({
  tKey,
  params,
  children,
}: {
  tKey: string;
  params?: Record<string, string | number>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Bilingual
        tKey={tKey}
        params={params}
        as="p"
        className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
      />
      {children}
    </div>
  );
}

function InfoTile({ tKey, value }: { tKey: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--color-border-lighter)] p-3">
      <Bilingual
        tKey={tKey}
        as="p"
        className="text-[11px] text-[var(--color-text-placeholder-alt)]"
      />
      <p className="mt-1 break-words text-[13px] font-bold text-[var(--color-text-body)] sm:text-[12px]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: BloodRequestStatus }) {
  const styles: Record<BloodRequestStatus, string> = {
    CENTRES_FOUND:
      "border-[var(--color-success-bg)] bg-[var(--color-success-bg)] text-[var(--color-success)]",
    NO_CENTRES_FOUND: "border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-700)]",
    CLOSED:
      "border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]",
    PARTIALLY_CLOSED: "border-amber-200 bg-amber-50 text-amber-700",
    CANCELLED: "border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]",
  };

  const tKeys: Record<BloodRequestStatus, string> = {
    CENTRES_FOUND: "superAdmin.statusMatched",
    NO_CENTRES_FOUND: "superAdmin.statusNoCentres",
    CLOSED: "superAdmin.statusClosed",
    PARTIALLY_CLOSED: "superAdmin.statusPartiallyClosed",
    CANCELLED: "superAdmin.statusCancelled",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}
    >
      <BilingualInline tKey={tKeys[status]} />
    </span>
  );
}

function TableHeader({ tKey }: { tKey: string }) {
  return (
    <th className="px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)]">
      <Bilingual
        tKey={tKey}
        as="span"
        enClassName="mt-0.5 block text-[0.75em] font-normal leading-tight opacity-70"
      />
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-4 text-left text-[11px] font-medium leading-5 text-[var(--color-text-quaternary)]">
      {children}
    </td>
  );
}

function BloodGroupBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[42px] shrink-0 items-center justify-center rounded-full border border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
      {value}
    </span>
  );
}

function MobileInfoRow({
  icon: Icon,
  tKey,
  value,
}: {
  icon: typeof Phone;
  tKey: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
      <div className="flex items-start gap-1.5">
        <Icon
          size={13}
          strokeWidth={1.7}
          className="mt-px shrink-0 text-[var(--color-primary)]"
        />

        <Bilingual
          tKey={tKey}
          as="p"
          className="min-w-0 flex-1 text-[11px] font-semibold leading-[14px] text-[var(--color-text-placeholder)]"
        />
      </div>

      <p className="mt-1 break-words text-[13px] font-medium text-[var(--color-text-secondary)]">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 py-10 text-center">
      <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />

      <Bilingual
        tKey="bloodCentre.loadingOptions"
        as="p"
        className="mt-3 text-[12px] text-[var(--color-text-placeholder-alt)]"
      />
    </div>
  );
}

function EmptyState({ tKey }: { tKey: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-5 py-10 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
          <Users size={20} className="text-[var(--color-primary)]" />
        </div>

        <Bilingual
          tKey={tKey}
          as="p"
          className="mt-3 text-[13px] font-semibold text-[var(--color-text-secondary)]"
        />

        <Bilingual
          tKey="superAdmin.bloodRequestsWillAppear"
          as="p"
          className="mt-1 text-[11px] text-[var(--color-text-placeholder)]"
        />
      </div>
    </div>
  );
}
