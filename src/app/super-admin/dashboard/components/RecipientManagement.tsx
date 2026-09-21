"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Droplets,
  Loader2,
  MapPin,
  Phone,
  Search,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { getApiErrorMessage } from "@/services/api/client";

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
  const [requests, setRequests] = useState<SuperAdminBloodRequestSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRequestId, setOpenRequestId] = useState<number | null>(null);

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
  }, []);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return requests;
    }

    return requests.filter((request) => {
      return (
        request?.recipientName.toLowerCase().includes(query) ||
        request?.mobileNumber.includes(query) ||
        request?.bloodGroup.toLowerCase().includes(query) ||
        request?.bloodType.toLowerCase().includes(query) ||
        request?.city.toLowerCase().includes(query)
      );
    });
  }, [requests, search]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <p className="text-[12px] font-medium text-[var(--color-text-placeholder-alt)]">
          Management
        </p>

        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.01em] text-[var(--color-text-primary)]">
          Blood Requests
        </h2>

        <p className="mt-1 text-[13px] text-[var(--color-text-placeholder-alt)]">
          Review recipient blood requests, matched centres, and record
          donations.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]">
        <div className="relative w-full max-w-[480px]">
          <Search
            size={18}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipient..."
            className="h-[46px] w-full rounded-xl border border-[var(--color-border-light)] bg-white pl-11 pr-4 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
          />
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
              <TableHeader>S.No</TableHeader>
              <TableHeader>Patient Name</TableHeader>
              <TableHeader>Phone Number</TableHeader>
              <TableHeader>Blood Group</TableHeader>
              <TableHeader>Units</TableHeader>
              <TableHeader>City</TableHeader>
              <TableHeader>Requested On</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Action</TableHeader>
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
                  className="border-b border-[var(--color-border-light)] transition-colors duration-200 last:border-b-0 hover:bg-[#fff9f9]"
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
                      onClick={() => setOpenRequestId(request.id)}
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
                        hover:border-[#ffcccc]
                        hover:bg-[var(--color-icon-bg-soft)]
                      "
                    >
                      View
                    </button>
                  </TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No blood requests found" />
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
              className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]"
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
                    <p className="text-[11px] text-[var(--color-text-placeholder)]">
                      S.No {index + 1}
                    </p>

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
                  label="Phone Number"
                  value={request.mobileNumber}
                />
                <MobileInfoRow
                  icon={Droplets}
                  label="Units"
                  value={String(request.units)}
                />
                <MobileInfoRow
                  icon={MapPin}
                  label="City"
                  value={request.city}
                />
                <MobileInfoRow
                  icon={CalendarDays}
                  label="Requested On"
                  value={formatDate(request.createdAt)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge status={request.status} />

                <button
                  type="button"
                  onClick={() => setOpenRequestId(request.id)}
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
                    hover:border-[#ffcccc]
                    hover:bg-[var(--color-icon-bg-soft)]
                  "
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white">
            <EmptyState message="No blood requests found" />
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
  const [closing, setClosing] = useState(false);
  const [closeRemarks, setCloseRemarks] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);

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
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to close this request."));
    } finally {
      setClosing(false);
    }
  };

  return (
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
            <h2
              id="blood-request-title"
              className="text-[15px] font-bold text-[var(--color-text-primary)]"
            >
              Blood Request Details
            </h2>

            <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
              Request #{bloodRequestId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
            aria-label="Close"
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
                <InfoTile label="Blood Group" value={detail.bloodGroup} />
                <InfoTile label="Blood Component" value={detail.bloodType} />
                <InfoTile label="Units Required" value={String(detail.units)} />
                <InfoTile
                  label="Date of Birth"
                  value={formatDate(detail.dateOfBirth)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoTile label="Hospital" value={detail.hospitalName || "—"} />
                <InfoTile
                  label="Address"
                  value={
                    [
                      detail.address,
                      detail.city,
                      detail.district,
                      detail.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
              </div>

              {detail.remarks && (
                <InfoTile label="Remarks" value={detail.remarks} />
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
                title={`Matched Centres (${detail.matchedCentres.length})`}
              >
                {detail.matchedCentres.length === 0 ? (
                  <p className="text-[12px] text-[var(--color-text-placeholder-alt)]">
                    No centres matched this request.
                  </p>
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
                <Section title={`Donated By (${detail.donatedBy.length})`}>
                  <div className="space-y-2">
                    {detail.donatedBy.map((donor) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#c9e8d1] bg-[var(--color-success-bg)] px-3.5 py-2.5"
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
                title={`Donor Candidates (${detail.donorCandidates.length})`}
              >
                {detail.donorCandidates.length === 0 ? (
                  <p className="text-[12px] text-[var(--color-text-placeholder-alt)]">
                    No matching donor candidates found.
                  </p>
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
                            onClick={() => handleRecordDonation(donor.id)}
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
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            Record Donation
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* CLOSE REQUEST */}
              {isOpen && (
                <Section title="Close Request">
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
                      <XCircle size={15} />
                      Close this request
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={closeRemarks}
                        onChange={(event) =>
                          setCloseRemarks(event.target.value)
                        }
                        placeholder="Remarks (optional)"
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
                          className="h-[38px] flex-1 rounded-lg border border-[var(--color-border)] bg-white text-[12px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={closing}
                          className="flex h-[38px] flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.22)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {closing && (
                            <Loader2 size={13} className="animate-spin" />
                          )}
                          {closing ? "Closing..." : "Confirm Close"}
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
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--color-border-lighter)] p-3">
      <p className="text-[11px] text-[var(--color-text-placeholder-alt)]">
        {label}
      </p>
      <p className="mt-1 break-words text-[12px] font-bold text-[var(--color-text-body)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: BloodRequestStatus }) {
  const styles: Record<BloodRequestStatus, string> = {
    CENTRES_FOUND:
      "border-[#c9e8d1] bg-[var(--color-success-bg)] text-[var(--color-success)]",
    NO_CENTRES_FOUND: "border-[#f5e2b8] bg-[#fff8e8] text-[#b8860b]",
    CLOSED:
      "border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]",
    CANCELLED: "border-[#ffd5d5] bg-[#fff5f5] text-[var(--color-primary)]",
  };

  const labels: Record<BloodRequestStatus, string> = {
    CENTRES_FOUND: "Matched",
    NO_CENTRES_FOUND: "No Centres",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)]">
      {children}
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
    <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-[#ffd5d5] bg-[#fff5f5] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
      {value}
    </span>
  );
}

function MobileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
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
        <p className="text-[11px] font-semibold text-[var(--color-text-placeholder)]">
          {label}
        </p>

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

      <p className="mt-3 text-[12px] text-[var(--color-text-placeholder-alt)]">
        Loading...
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-5 py-10 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3f3]">
          <Users size={20} className="text-[var(--color-primary)]" />
        </div>

        <p className="mt-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">
          {message}
        </p>

        <p className="mt-1 text-[11px] text-[var(--color-text-placeholder)]">
          Blood requests will appear here.
        </p>
      </div>
    </div>
  );
}
