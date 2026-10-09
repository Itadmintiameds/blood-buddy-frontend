"use client";

import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  deactivateDonor,
  lockDonor,
} from "@/services/bloodCenter/superAdmin/dashboardService";
import { getApiErrorMessage } from "@/services/api/client";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";
import type { SuperAdminDonor } from "@/types/bloodCenter/superAdmin/superAdminTypes";
import type {
  DonorDeactivationReason,
  DonorLockReason,
  DonorUnavailabilityReason,
} from "@/types/donor/donorTypes";

// English sub-line colour for Kannada labels on solid buttons (the default
// muted grey is unreadable there).
export const ON_SOLID_EN_CLASS =
  "mt-0.5 text-[0.68em] font-normal leading-tight text-white/85";

export const LOCK_REASONS: { value: DonorLockReason; tKey: string }[] = [
  { value: "ILLNESS", tKey: "superAdmin.reasonIllness" },
  { value: "OUT_OF_STATION", tKey: "superAdmin.reasonOutOfStation" },
];

export const DEACTIVATION_REASONS: {
  value: DonorDeactivationReason;
  tKey: string;
}[] = [
  { value: "MEDICAL", tKey: "superAdmin.reasonMedical" },
  { value: "DEATH", tKey: "superAdmin.reasonDeath" },
  { value: "RELOCATED", tKey: "superAdmin.reasonRelocated" },
];

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

// Today as YYYY-MM-DD in the viewer's local time (toISOString would give the
// UTC date, which is "tomorrow"/"yesterday" for part of the day).
function getTodayIsoDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

// Human label for an unavailability reason, honouring the active language.
export function useReasonText(reason: DonorUnavailabilityReason | null): string {
  const illness = useBilingualText("superAdmin.reasonIllness");
  const outOfStation = useBilingualText("superAdmin.reasonOutOfStation");
  const medical = useBilingualText("superAdmin.reasonMedical");
  const death = useBilingualText("superAdmin.reasonDeath");
  const relocated = useBilingualText("superAdmin.reasonRelocated");

  if (!reason) {
    return "";
  }

  const map: Record<DonorUnavailabilityReason, string> = {
    ILLNESS: illness,
    OUT_OF_STATION: outOfStation,
    MEDICAL: medical,
    DEATH: death,
    RELOCATED: relocated,
  };

  return map[reason] ?? reason;
}

/* ============================================================
   STATUS BADGE
============================================================ */

// `available` is the source of truth: a lock whose window has passed reads as
// active again even if `status` still says LOCKED. When unavailable, `status`
// drives the specific label (locked-until date / deactivated reason).
export function DonorStatusBadge({ donor }: { donor: SuperAdminDonor }) {
  const lockedUntilText = useBilingualText("superAdmin.donorStatusLockedUntil", {
    date: formatDate(donor.lockedUntil),
  });
  const reasonText = useReasonText(donor.unavailabilityReason);
  const deactivatedText = useBilingualText(
    "superAdmin.donorStatusDeactivatedReason",
    { reason: reasonText },
  );

  const base =
    "inline-flex max-w-full items-center justify-center rounded-md border px-2 py-0.5 text-center text-[10.5px] font-bold leading-tight";

  if (donor.available) {
    return (
      <span
        className={`${base} border-[var(--color-success-bg)] bg-[var(--color-success-bg)] text-[var(--color-success)]`}
      >
        <BilingualInline tKey="superAdmin.donorStatusActive" />
      </span>
    );
  }

  if (donor.status === "LOCKED") {
    return (
      <span
        title={lockedUntilText}
        className={`${base} border-amber-200 bg-amber-50 text-amber-700`}
      >
        {lockedUntilText}
      </span>
    );
  }

  if (donor.status === "DEACTIVATED") {
    return (
      <span
        title={reasonText ? deactivatedText : undefined}
        className={`${base} border-red-200 bg-red-50 text-red-600`}
      >
        {reasonText ? (
          deactivatedText
        ) : (
          <BilingualInline tKey="superAdmin.donorStatusDeactivated" />
        )}
      </span>
    );
  }

  // Unavailable with no specific status — fall back to the neutral label.
  return (
    <span
      className={`${base} border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]`}
    >
      <BilingualInline tKey="superAdmin.donorStatusActive" />
    </span>
  );
}

/* ============================================================
   ROW ACTIONS
============================================================ */

const ACTION_TONE: Record<"amber" | "red" | "green", string> = {
  amber: "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600",
  red: "hover:border-red-200 hover:bg-red-50 hover:text-red-600",
  green: "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600",
};

function IconAction({
  icon: Icon,
  labelKey,
  tone,
  onClick,
}: {
  icon: typeof Lock;
  labelKey: string;
  tone: keyof typeof ACTION_TONE;
  onClick: (event: React.MouseEvent) => void;
}) {
  const label = useBilingualText(labelKey);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-muted)] shadow-sm transition-all duration-200 hover:-translate-y-px ${ACTION_TONE[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
}

function LabeledAction({
  icon: Icon,
  tKey,
  tone,
  onClick,
}: {
  icon: typeof Lock;
  tKey: string;
  tone: keyof typeof ACTION_TONE;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--color-border-lighter)] bg-white px-3 py-2 text-[12px] font-semibold text-[var(--color-text-muted)] shadow-sm transition-all duration-200 ${ACTION_TONE[tone]}`}
    >
      <Icon size={14} className="shrink-0" />
      <BilingualInline tKey={tKey} />
    </button>
  );
}

// Lock / Deactivate / Reactivate, shown by lifecycle status. `labeled` renders
// text buttons for the card/list views; otherwise compact icon buttons for the
// table.
export function DonorActionButtons({
  donor,
  labeled = false,
  onLock,
  onDeactivate,
  onReactivate,
}: {
  donor: SuperAdminDonor;
  labeled?: boolean;
  onLock: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  const canLock = donor.status === "ACTIVE";
  const canReactivate =
    donor.status === "LOCKED" || donor.status === "DEACTIVATED";
  const canDeactivate = donor.status !== "DEACTIVATED";

  const stop =
    (handler: () => void) => (event: React.MouseEvent) => {
      event.stopPropagation();
      handler();
    };

  const Action = labeled ? LabeledAction : IconAction;
  // IconAction keys its label off `labelKey`, LabeledAction off `tKey`; pass
  // both so either renders correctly.
  const actionProps = (
    tKey: string,
    tone: keyof typeof ACTION_TONE,
    onClick: (event: React.MouseEvent) => void,
  ) => ({ tKey, labelKey: tKey, tone, onClick });

  return (
    <div
      className={
        labeled
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-wrap items-center gap-1.5"
      }
    >
      {canLock && (
        <Action
          icon={Lock}
          {...actionProps("superAdmin.lockDonor", "amber", stop(onLock))}
        />
      )}

      {canReactivate && (
        <Action
          icon={UserCheck}
          {...actionProps(
            "superAdmin.reactivateDonor",
            "green",
            stop(onReactivate),
          )}
        />
      )}

      {canDeactivate && (
        <Action
          icon={UserX}
          {...actionProps(
            "superAdmin.deactivateDonor",
            "red",
            stop(onDeactivate),
          )}
        />
      )}
    </div>
  );
}

// A single <option> whose label honours the active language. Pulled out so the
// reason <select>s can use the useBilingualText hook per option.
function ReasonOption({ value, tKey }: { value: string; tKey: string }) {
  const label = useBilingualText(tKey);
  return <option value={value}>{label}</option>;
}

/* ============================================================
   LOCK DONOR MODAL — a temporary, auto-expiring unavailability.
============================================================ */

export function LockDonorModal({
  donor,
  onClose,
  onSaved,
}: {
  donor: SuperAdminDonor;
  onClose: () => void;
  onSaved: (updated: SuperAdminDonor) => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const remarksPlaceholder = useBilingualText("bloodCentre.remarksOptional");
  const selectReason = useBilingualText("superAdmin.selectReason");
  const [todayIso] = useState(getTodayIsoDate);

  const reasonRequired = useBilingualText("superAdmin.reasonRequired");
  const lockedUntilRequired = useBilingualText("superAdmin.lockedUntilRequired");
  const dateInPast = useBilingualText("superAdmin.dateInPast");
  const lockUntilBeforeFrom = useBilingualText("superAdmin.lockUntilBeforeFrom");

  const [reason, setReason] = useState<DonorLockReason | "">("");
  const [lockedFrom, setLockedFrom] = useState(todayIso);
  const [lockedUntil, setLockedUntil] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const effectiveFrom = lockedFrom || todayIso;
  // ISO YYYY-MM-DD strings compare correctly lexicographically.
  const rangeInvalid = lockedUntil !== "" && lockedUntil < effectiveFrom;

  const handleSubmit = async () => {
    setSubmitError("");
    setFieldError("");

    if (!reason) {
      setFieldError(reasonRequired);
      return;
    }
    if (!lockedUntil) {
      setFieldError(lockedUntilRequired);
      return;
    }
    if (effectiveFrom < todayIso || lockedUntil < todayIso) {
      setFieldError(dateInPast);
      return;
    }
    if (lockedUntil < effectiveFrom) {
      setFieldError(lockUntilBeforeFrom);
      return;
    }

    setSubmitting(true);

    try {
      const updated = await lockDonor(donor.id, {
        reason,
        lockedFrom: effectiveFrom,
        lockedUntil,
        remarks: remarks.trim() || undefined,
      });
      onSaved(updated);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to lock this donor."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`motion-scrim fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-donor-title"
    >
      <div
        className={`motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 sm:max-h-[90dvh] ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Lock size={17} className="text-amber-600" />
            </div>

            <div className="min-w-0">
              <h2
                id="lock-donor-title"
                className="text-[14px] font-bold text-[var(--color-text-primary)]"
              >
                <BilingualInline tKey="superAdmin.lockDonorTitle" />
              </h2>
              <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-placeholder-alt)]">
                {donor.donorName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:m-0 sm:h-8 sm:w-8"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <Bilingual
            tKey="superAdmin.lockDonorSubtitle"
            as="p"
            className="text-[12px] text-[var(--color-text-placeholder-alt)]"
          />

          <div>
            <Bilingual
              tKey="superAdmin.reason"
              as="label"
              htmlFor="lock-reason"
              className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            />

            <div className="relative">
              <select
                id="lock-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as DonorLockReason | "")
                }
                disabled={submitting}
                className="h-11 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">{selectReason}</option>
                {LOCK_REASONS.map((option) => (
                  <ReasonOption key={option.value} {...option} />
                ))}
              </select>

              <ChevronDown
                size={16}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Bilingual
                tKey="superAdmin.lockedFrom"
                as="label"
                htmlFor="lock-from"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              />
              <input
                id="lock-from"
                type="date"
                value={lockedFrom}
                min={todayIso}
                disabled={submitting}
                onChange={(event) => setLockedFrom(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[14px] text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div>
              <label
                htmlFor="lock-until"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              >
                <BilingualInline tKey="superAdmin.lockedUntil" />
                <span className="text-red-500"> *</span>
              </label>
              <input
                id="lock-until"
                type="date"
                value={lockedUntil}
                min={effectiveFrom}
                disabled={submitting}
                aria-invalid={rangeInvalid ? true : undefined}
                onChange={(event) => setLockedUntil(event.target.value)}
                className={`h-11 w-full rounded-lg border bg-white px-3 text-[14px] text-[var(--color-text-body)] outline-none transition focus:ring-2 ${
                  rangeInvalid
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/15"
                    : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                }`}
              />
            </div>
          </div>

          <div>
            <Bilingual
              tKey="superAdmin.remarks"
              as="label"
              htmlFor="lock-remarks"
              className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            />
            <textarea
              id="lock-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder={remarksPlaceholder}
              rows={2}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {(fieldError || submitError) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600"
            >
              <AlertCircle size={16} className="mt-px shrink-0" />
              <span className="min-w-0">{fieldError || submitError}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold sm:min-h-[40px] sm:text-[11px] text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rangeInvalid}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-[13px] font-semibold sm:min-h-[40px] sm:text-[11px] text-white shadow-[0_5px_15px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin shrink-0" />}
            {submitting ? (
              <BilingualInline
                tKey="superAdmin.locking"
                enClassName={ON_SOLID_EN_CLASS}
              />
            ) : (
              <BilingualInline
                tKey="superAdmin.lockDonor"
                enClassName={ON_SOLID_EN_CLASS}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DEACTIVATE DONOR MODAL — a permanent removal, gated by a confirm dialog.
============================================================ */

export function DeactivateDonorModal({
  donor,
  onClose,
  onSaved,
}: {
  donor: SuperAdminDonor;
  onClose: () => void;
  onSaved: (updated: SuperAdminDonor) => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const remarksPlaceholder = useBilingualText("bloodCentre.remarksOptional");
  const selectReason = useBilingualText("superAdmin.selectReason");
  const reasonRequired = useBilingualText("superAdmin.reasonRequired");

  const [reason, setReason] = useState<DonorDeactivationReason | "">("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = () => {
    setSubmitError("");
    setFieldError("");

    if (!reason) {
      setFieldError(reasonRequired);
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const updated = await deactivateDonor(donor.id, {
        reason: reason as DonorDeactivationReason,
        remarks: remarks.trim() || undefined,
      });
      setConfirmOpen(false);
      onSaved(updated);
    } catch (err) {
      setConfirmOpen(false);
      setSubmitError(
        getApiErrorMessage(err, "Unable to deactivate this donor."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!rendered) {
    return null;
  }

  return (
    <>
      <div
        className={`motion-scrim fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-md transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-donor-title"
      >
        <div
          className={`motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 sm:max-h-[90dvh] ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }`}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <UserX size={17} className="text-red-600" />
              </div>

              <div className="min-w-0">
                <h2
                  id="deactivate-donor-title"
                  className="text-[14px] font-bold text-[var(--color-text-primary)]"
                >
                  <BilingualInline tKey="superAdmin.deactivateDonorTitle" />
                </h2>
                <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-placeholder-alt)]">
                  {donor.donorName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:m-0 sm:h-8 sm:w-8"
              aria-label={closeLabel}
            >
              <X size={17} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
            <Bilingual
              tKey="superAdmin.deactivateDonorSubtitle"
              as="p"
              className="text-[12px] text-[var(--color-text-placeholder-alt)]"
            />

            <div>
              <Bilingual
                tKey="superAdmin.reason"
                as="label"
                htmlFor="deactivate-reason"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              />

              <div className="relative">
                <select
                  id="deactivate-reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value as DonorDeactivationReason | "",
                    )
                  }
                  disabled={submitting}
                  className="h-11 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="">{selectReason}</option>
                  {DEACTIVATION_REASONS.map((option) => (
                    <ReasonOption key={option.value} {...option} />
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
                />
              </div>
            </div>

            <div>
              <Bilingual
                tKey="superAdmin.remarks"
                as="label"
                htmlFor="deactivate-remarks"
                className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
              />
              <textarea
                id="deactivate-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder={remarksPlaceholder}
                rows={2}
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {(fieldError || submitError) && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600"
              >
                <AlertCircle size={16} className="mt-px shrink-0" />
                <span className="min-w-0">{fieldError || submitError}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-3 sm:px-5 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold sm:min-h-[40px] sm:text-[11px] text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BilingualInline tKey="common.cancel" />
            </button>

            <button
              type="button"
              onClick={openConfirm}
              disabled={submitting}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-[13px] font-semibold sm:min-h-[40px] sm:text-[11px] text-white shadow-[0_5px_15px_rgba(239,68,68,0.22)] transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BilingualInline
                tKey="superAdmin.deactivateDonor"
                enClassName={ON_SOLID_EN_CLASS}
              />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={<BilingualInline tKey="superAdmin.confirmDeactivateTitle" />}
        description={<BilingualInline tKey="superAdmin.confirmDeactivateDesc" />}
        confirmLabel={
          <BilingualInline
            tKey="superAdmin.deactivateDonor"
            enClassName={ON_SOLID_EN_CLASS}
          />
        }
        danger
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
