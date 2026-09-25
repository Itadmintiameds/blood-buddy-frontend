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
  SuperAdminBloodRequestDetail,
  SuperAdminBloodRequestSummary,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  closeBloodRequest,
  getSuperAdminBloodRequestDetail,
  getSuperAdminBloodRequests,
  recordBloodRequestDonation,
} from "@/services/bloodCenter/superAdmin/bloodRequestService";
import { submitBloodRequest } from "@/services/recipient/recipientRequestService";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  recipientRequestSchema,
  normalizeRecipientForm,
} from "@/schema/recipient/recipientRequestSchema";
import type { RecipientRequestInput } from "@/types/recipient/receipientTypes";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";
import { StatTile } from "@/app/components/ui/StatTile";
import { FormInput } from "@/app/components/ui/FormInput";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

const ALL = "all";

const emptyRecipientForm: RecipientRequestInput = {
  patientName: "",
  mobileNumber: "",
  bloodGroupId: "",
  bloodComponentId: "",
  requiredUnits: "",
  dob: "",
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

export function RecipientManagement() {
  const searchPlaceholder = useBilingualText("superAdmin.searchRecipient");

  const [requests, setRequests] = useState<SuperAdminBloodRequestSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>(ALL);
  const [cityFilter, setCityFilter] = useState<string>(ALL);
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

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const data = await getSuperAdminBloodRequests();

        if (!cancelled) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load blood requests:", err);

        if (!cancelled) {
          setRequests([]);
          setError("Unable to load blood requests.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

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

  const totalRequests = requests.length;

  const openRequestCount = requests.filter(
    (request) =>
      request.status === "CENTRES_FOUND" || request.status === "NO_CENTRES_FOUND",
  ).length;

  const closedRequestCount = requests.filter(
    (request) => request.status === "CLOSED" || request.status === "CANCELLED",
  ).length;

  const bloodGroupOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((request) => request.bloodGroup).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [requests],
  );

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(requests.map((request) => request.city).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [requests],
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

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesQuery =
        !query ||
        request?.recipientName.toLowerCase().includes(query) ||
        request?.mobileNumber.includes(query) ||
        request?.bloodGroup.toLowerCase().includes(query) ||
        request?.bloodType.toLowerCase().includes(query) ||
        request?.city.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === ALL || request.status === statusFilter;

      const matchesBloodGroup =
        bloodGroupFilter === ALL || request.bloodGroup === bloodGroupFilter;

      const matchesCity = cityFilter === ALL || request.city === cityFilter;

      return matchesQuery && matchesStatus && matchesBloodGroup && matchesCity;
    });
  }, [requests, search, statusFilter, bloodGroupFilter, cityFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="relative w-full sm:max-w-[360px]">
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
              className="h-[46px] w-full rounded-xl border border-[var(--color-border-light)] bg-white pl-11 pr-4 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto ${
                statusFilter !== ALL
                  ? "border-[var(--primary-200)] font-medium"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <option value={ALL}>All statuses</option>
              <option value="CENTRES_FOUND">Matched</option>
              <option value="NO_CENTRES_FOUND">No Centres</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
          </div>

          {bloodGroupOptions.length > 0 && (
            <div className="relative">
              <select
                value={bloodGroupFilter}
                onChange={(event) => setBloodGroupFilter(event.target.value)}
                aria-label="Filter by blood group"
                className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto ${
                  bloodGroupFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All blood groups</option>
                {bloodGroupOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          {cityOptions.length > 0 && (
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                aria-label="Filter by city"
                className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto ${
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
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
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

          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-medium text-[var(--color-primary)] transition hover:underline"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setLogRequestOpen(true)}
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:ml-auto sm:w-auto sm:text-[14px]"
          >
            <Plus size={16} className="shrink-0" />
            Log Request
          </button>
        </div>
      </div>

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
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[14%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]">
              <TableHeader tKey="superAdmin.sNo" />
              <TableHeader tKey="recipient.patientName" />
              <TableHeader tKey="superAdmin.phoneNumber" />
              <TableHeader tKey="bloodCentre.bloodGroup" />
              <TableHeader tKey="bloodCentre.units" />
              <TableHeader tKey="common.city" />
              <TableHeader tKey="superAdmin.requestedOn" />
              <TableHeader tKey="superAdmin.status" />
              <TableHeader tKey="superAdmin.action" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <LoadingState />
                </td>
              </tr>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <tr
                  key={request.id}
                  onClick={() => setOpenRequestId(request.id)}
                  className="cursor-pointer border-b border-[var(--color-border-light)] transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)]"
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                        <UserRound
                          size={15}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <span className="truncate font-semibold text-[var(--color-text-body)]">
                        {request.recipientName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{request.mobileNumber}</TableCell>

                  <TableCell>
                    <BloodGroupBadge value={request.bloodGroup} />
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-[var(--color-text-body)]">
                      {request.units}
                    </span>
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
                <td colSpan={9}>
                  <EmptyState tKey="superAdmin.noBloodRequestsFound" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white">
            <LoadingState />
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((request, index) => (
            <div
              key={request.id}
              onClick={() => setOpenRequestId(request.id)}
              className="cursor-pointer rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] transition-colors duration-150 active:bg-[var(--color-icon-bg-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                    <UserRound
                      size={19}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <Bilingual
                      tKey="superAdmin.sNoValue"
                      params={{ index: index + 1 }}
                      as="p"
                      className="text-[11px] text-[var(--color-text-placeholder)]"
                    />

                    <h3 className="truncate text-[15px] font-bold text-[var(--color-text-body)]">
                      {request.recipientName}
                    </h3>
                  </div>
                </div>

                <BloodGroupBadge value={request.bloodGroup} />
              </div>

              <div className="mt-5 space-y-3">
                <MobileInfoRow
                  icon={Phone}
                  tKey="superAdmin.phoneNumber"
                  value={request.mobileNumber}
                />
                <MobileInfoRow
                  icon={Droplets}
                  tKey="bloodCentre.units"
                  value={String(request.units)}
                />
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

              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge status={request.status} />

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
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecipientRequestInput>({
    resolver: zodResolver(
      recipientRequestSchema,
    ) as Resolver<RecipientRequestInput>,
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
        dob: normalized.dob,
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
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-request-title"
    >
      <div
        className={`motion-surface flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
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
              label="Date of Birth"
              required
              type="date"
              error={errors.dob?.message}
              {...register("dob")}
            />

            <div>
              <label className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]">
                Blood Group<span className="text-red-500"> *</span>
              </label>

              <div className="relative">
                <select
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
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.bloodGroupId.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]">
                Blood Type<span className="text-red-500"> *</span>
              </label>

              <div className="relative">
                <select
                  {...register("bloodComponentId", { valueAsNumber: true })}
                  className={`h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 ${
                    errors.bloodComponentId
                      ? "border-red-400"
                      : "border-[var(--color-border)]"
                  } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`}
                >
                  <option value="">Select blood type</option>
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
                <p className="mt-1 text-[12px] text-red-500">
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
                label="Address (optional)"
                placeholder={enterAddress}
                error={errors.address?.message}
                {...register("address")}
              />
            </div>

            <FormInput
              icon={MapPin}
              label="District"
              required
              placeholder={enterDistrict}
              error={errors.district?.message}
              {...register("district")}
            />

            <FormInput
              icon={MapPin}
              label="City"
              required
              placeholder={enterCity}
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

          <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-5 py-4">
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
                <BilingualInline tKey="common.saving" />
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
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const closeLabel = useBilingualText("common.close");
  const remarksPlaceholder = useBilingualText("bloodCentre.remarksOptional");

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

  const handleRecordDonation = async (donorId: number) => {
    setConfirmDonorId(null);
    setRecordingDonorId(donorId);
    setActionError("");

    try {
      const updated = await recordBloodRequestDonation(bloodRequestId, donorId);

      setDetail(updated);
      onChanged(updated);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "Unable to record this donation."),
      );
    } finally {
      setRecordingDonorId(null);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    setActionError("");

    try {
      const updated = await closeBloodRequest(
        bloodRequestId,
        closeRemarks.trim() || undefined,
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
      onClick={(event) => {
        if (event.target === event.currentTarget && !closing) {
          onClose();
        }
      }}
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
          max-h-[90vh]
          w-full
          max-w-[640px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
        "
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
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
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-bold text-[var(--color-text-body)]">
                    {detail.recipientName}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                    {detail.mobileNumber}
                  </p>
                </div>

                <StatusBadge status={detail.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoTile tKey="bloodCentre.bloodGroup" value={detail.bloodGroup} />
                <InfoTile tKey="superAdmin.bloodComponent" value={detail.bloodType} />
                <InfoTile tKey="recipient.unitsRequired" value={String(detail.units)} />
                <InfoTile
                  tKey="donor.dateOfBirth"
                  value={formatDate(detail.dateOfBirth)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoTile tKey="superAdmin.hospital" value={detail.hospitalName || "—"} />
                <InfoTile
                  tKey="common.address"
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

              {detail.remarks && (
                <InfoTile tKey="superAdmin.remarks" value={detail.remarks} />
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
                {detail.matchedCentres.length === 0 ? (
                  <Bilingual
                    tKey="superAdmin.noCentresMatched"
                    as="p"
                    className="text-[12px] text-[var(--color-text-placeholder-alt)]"
                  />
                ) : (
                  <div className="space-y-2">
                    {detail.matchedCentres.map((centre) => (
                      <div
                        key={centre.id}
                        className="rounded-lg border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-3.5 py-2.5"
                      >
                        <p className="text-[12px] font-bold text-[var(--color-text-body)]">
                          {centre.bloodBankName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-placeholder-alt)]">
                          {centre.address} · {centre.city} ·{" "}
                          {centre.phoneNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* DONATED BY */}
              {detail.donatedBy.length > 0 && (
                <Section
                  tKey="superAdmin.donatedBy"
                  params={{ count: detail.donatedBy.length }}
                >
                  <div className="space-y-2">
                    {detail.donatedBy.map((donor) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-success-bg)] bg-[var(--color-success-bg)] px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[var(--color-text-body)]">
                            {donor.donorName}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-placeholder-alt)]">
                            {donor.mobileNumber} · {donor.bloodGroup}
                          </p>
                        </div>

                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-[var(--color-success)]"
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* DONOR CANDIDATES */}
              <Section
                tKey="superAdmin.donorCandidates"
                params={{ count: detail.donorCandidates.length }}
              >
                {detail.donorCandidates.length === 0 ? (
                  <Bilingual
                    tKey="superAdmin.noMatchingDonorCandidates"
                    as="p"
                    className="text-[12px] text-[var(--color-text-placeholder-alt)]"
                  />
                ) : (
                  <div className="space-y-2">
                    {detail.donorCandidates.map((donor) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-lighter)] bg-white px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[var(--color-text-body)]">
                            {donor.donorName}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-placeholder-alt)]">
                            {donor.mobileNumber} · {donor.bloodGroup} ·{" "}
                            {donor.city}
                          </p>
                        </div>

                        {isOpen && (
                          <button
                            type="button"
                            onClick={() => setConfirmDonorId(donor.id)}
                            disabled={recordingDonorId !== null}
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-1.5
                              rounded-lg
                              bg-[var(--color-primary)]
                              px-3
                              py-1.5
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
                            {recordingDonorId === donor.id && (
                              <Loader2 size={12} className="animate-spin shrink-0" />
                            )}
                            <BilingualInline tKey="superAdmin.recordDonation" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* CLOSE REQUEST */}
              {isOpen && (
                <Section tKey="superAdmin.closeRequest">
                  {!showCloseForm ? (
                    <button
                      type="button"
                      onClick={() => setShowCloseForm(true)}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-[var(--color-border)]
                        bg-white
                        px-4
                        py-2.5
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
                          className="min-h-[38px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <BilingualInline tKey="common.cancel" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmCloseOpen(true)}
                          disabled={closing}
                          className="flex min-h-[38px] flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.22)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {closing && (
                            <Loader2 size={13} className="animate-spin shrink-0" />
                          )}
                          {closing ? (
                            <BilingualInline tKey="superAdmin.closing" />
                          ) : (
                            <BilingualInline tKey="superAdmin.confirmClose" />
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
          <BilingualInline tKey="superAdmin.confirmClose" />
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
        confirmLabel={<BilingualInline tKey="superAdmin.recordDonation" />}
        loading={recordingDonorId !== null}
        onConfirm={() => {
          if (confirmDonorId !== null) {
            handleRecordDonation(confirmDonorId);
          }
        }}
        onCancel={() => setConfirmDonorId(null)}
      />
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
      <p className="mt-1 break-words text-[12px] font-bold text-[var(--color-text-body)]">
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
    CANCELLED: "border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]",
  };

  const tKeys: Record<BloodRequestStatus, string> = {
    CENTRES_FOUND: "superAdmin.statusMatched",
    NO_CENTRES_FOUND: "superAdmin.statusNoCentres",
    CLOSED: "superAdmin.statusClosed",
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
    <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
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
    <div className="flex items-start gap-3 rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
      <Icon
        size={15}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
      />

      <div className="min-w-0 flex-1">
        <Bilingual
          tKey={tKey}
          as="p"
          className="text-[11px] font-semibold text-[var(--color-text-placeholder)]"
        />

        <p className="mt-0.5 break-words text-[12px] font-medium text-[var(--color-text-secondary)]">
          {value}
        </p>
      </div>
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
