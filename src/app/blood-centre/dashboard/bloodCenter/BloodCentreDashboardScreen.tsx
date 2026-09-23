"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  Droplets,
  Loader2,
  Package,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { LogoutButton } from "@/app/components/common/LogoutButton";
import { getBloodCentreSession } from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/services/api/client";
import {
  adjustStock,
  getAvailability,
} from "@/services/bloodCenter/bloodCenter.service";
import type {
  BloodAvailabilityItem,
  StockMovement,
} from "@/types/bloodCenter/bloodCenterTypes";
import { mergeBloodAvailabilityRows } from "@/utils/bloodAvailability";
import { routes } from "@/config/routes";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export function BloodCentreDashboardScreen() {
  const [rows, setRows] = useState<BloodAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustingRow, setAdjustingRow] = useState<BloodAvailabilityItem | null>(
    null,
  );
  // Bumped to re-run the fetch effect below (e.g. after an adjustment saves)
  // without duplicating the mounted-guarded fetch logic outside the effect.
  const [reloadToken, setReloadToken] = useState(0);

  const session = getBloodCentreSession();
  const unitsWordText = useBilingualText("bloodCentre.units");

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoading(true);
      setError("");

      try {
        const data = await getAvailability();

        if (!cancelled) {
          setRows(mergeBloodAvailabilityRows(data));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              fetchError,
              "Unable to load blood availability.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const totalGroupsListed = new Set(
    rows.map((row) => row.bloodGroup.trim().toUpperCase()),
  ).size;
  const totalUnits = rows.reduce((sum, row) => sum + row.unitsAvailable, 0);
  const lowStockCount = rows.filter((row) => row.unitsAvailable <= 3).length;

  return (
    <ScreenShell>
      <BrandHeader />

      <section
        className="
          w-full
          bg-[var(--color-surface-alt)]
          px-4
          pb-8
          pt-6
          sm:px-5
          md:px-8
          md:pb-12
          md:pt-9
        "
      >
        <div className="mx-auto w-full max-w-[720px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Bilingual
                tKey="bloodCentre.dashboard"
                as="h1"
                className="
                  text-[17px]
                  font-semibold
                  text-[var(--color-text-primary)]
                  sm:text-[19px]
                  md:text-[22px]
                "
              />

              <Bilingual
                tKey="bloodCentre.welcomeUser"
                params={{ suffix: session?.email ? `, ${session?.email}` : "" }}
                as="p"
                className="
                  mt-1
                  text-[12px]
                  text-[var(--color-text-muted)]
                  sm:text-[13px]
                "
              />
            </div>

            <LogoutButton />
          </div>

          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-2.5
              sm:gap-3.5
              md:mt-7
              md:gap-4
            "
          >
            <Stat
              icon={Droplets}
              value={String(totalGroupsListed)}
              label={<Bilingual tKey="bloodCentre.bloodGroupsListed" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />}
              color="var(--color-stat-red)"
            />

            <Stat
              icon={Package}
              value={String(totalUnits)}
              label={<Bilingual tKey="bloodCentre.totalUnitsAvailable" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />}
              color="var(--color-stat-green)"
            />

            <Stat
              icon={AlertTriangle}
              value={String(lowStockCount)}
              label={<Bilingual tKey="bloodCentre.lowStockAlerts" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />}
              color="var(--color-stat-yellow)"
            />
          </div>

          {/* BLOOD AVAILABILITY OVERVIEW */}
          <div
            className="
              mt-6
              overflow-hidden
              rounded-xl
              border
              border-[var(--color-border-table)]
              bg-white
              shadow-[0_2px_12px_rgba(0,0,0,0.03)]
              md:mt-7
            "
          >
            <Bilingual
              tKey="bloodCentre.bloodAvailability"
              as="div"
              className="
                bg-white
                px-4
                py-3
                text-[13px]
                font-semibold
                text-[var(--color-text-primary)]
                md:px-5
                md:py-3.5
                md:text-[14px]
              "
            />

            <div
              className="
                grid
                grid-cols-[1fr_1.3fr_0.9fr_48px]
                items-center
                border-t
                border-[var(--color-border-light)]
                bg-[var(--color-surface-alt)]
                px-4
                py-2.5
                text-[12px]
                font-semibold
                uppercase
                tracking-wide
                text-[var(--color-text-secondary)]
                md:px-5
                md:py-3
              "
            >
              <Bilingual tKey="bloodCentre.bloodGroup" as="div" className="text-left" />
              <Bilingual tKey="bloodCentre.bloodType" as="div" className="text-center" />
              <Bilingual tKey="bloodCentre.bloodUnits" as="div" className="text-right" />
              <Bilingual tKey="bloodCentre.adjust" as="div" className="text-right" />
            </div>

            {loading && (
              <Bilingual
                tKey="bloodCentre.loadingAvailability"
                as="div"
                className="px-4 py-6 text-center text-[13px] text-[var(--color-text-muted)]"
              />
            )}

            {!loading && error && (
              <div
                role="alert"
                className="px-4 py-6 text-center text-[13px] text-red-500"
              >
                {error}
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <Bilingual
                tKey="bloodCentre.noAvailabilityYet"
                as="div"
                className="px-4 py-6 text-center text-[13px] text-[var(--color-text-muted)]"
              />
            )}

            {!loading &&
              !error &&
              rows.map((row, index) => (
                <div
                  key={`${row.bloodGroup}-${row.bloodType}`}
                  className="
                    grid
                    min-h-[44px]
                    grid-cols-[1fr_1.3fr_0.9fr_48px]
                    items-center
                    border-t
                    border-[var(--color-border-light)]
                    px-4
                    text-[12px]
                    text-[var(--color-text-body)]
                    md:min-h-[48px]
                    md:px-5
                    md:text-[13px]
                  "
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--color-surface-alt)"
                        : "var(--color-white)",
                  }}
                >
                  <div className="flex min-w-0 items-center justify-start">
                    <Droplets
                      size={13}
                      strokeWidth={1.8}
                      className="mr-2 shrink-0 text-[var(--color-stat-red)] sm:mr-2.5 md:mr-3"
                    />
                    <span className="truncate font-medium">
                      {row.bloodGroup}
                    </span>
                  </div>

                  <div className="min-w-0 text-center font-medium text-[var(--color-text-quaternary)]">
                    <span className="break-words">{row.bloodType}</span>
                  </div>

                  <div className="text-right font-medium text-[var(--color-text-body)]">
                    {row.unitsAvailable} {unitsWordText}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAdjustingRow(row)}
                      disabled={row.bloodGroupId === undefined || row.bloodComponentId === undefined}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[var(--color-border-lighter)]
                        bg-white
                        text-[var(--color-text-muted)]
                        transition-all
                        duration-200
                        hover:border-[#ffcccc]
                        hover:bg-[var(--color-icon-bg-soft)]
                        hover:text-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      aria-label={`Adjust ${row.bloodGroup} ${row.bloodType} stock`}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ADD AVAILABILITY BUTTON */}
          <Link
            href={routes.addAvailability}
            className="
              mt-8
              flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-[var(--color-primary)]
              px-4
              py-2
              text-[14px]
              font-semibold
              text-white
              shadow-[0_4px_14px_rgba(255,59,63,0.22)]
              transition-all
              duration-200
              hover:-translate-y-px
              hover:bg-[var(--color-dashboard-cta-hover)]
              active:translate-y-0
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
              md:mx-auto
              md:mt-9
              md:w-[300px]
            "
          >
            <Plus size={16} className="shrink-0" />
            <BilingualInline
              tKey="bloodCentre.addAvailability"
              enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
            />
          </Link>
        </div>
      </section>

      {adjustingRow && (
        <AdjustStockModal
          row={adjustingRow}
          onClose={() => setAdjustingRow(null)}
          onSaved={() => {
            setAdjustingRow(null);
            setReloadToken((token) => token + 1);
          }}
        />
      )}
    </ScreenShell>
  );
}

//  ADJUST STOCK MODAL

function AdjustStockModal({
  row,
  onClose,
  onSaved,
}: {
  row: BloodAvailabilityItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [movement, setMovement] = useState<StockMovement>("ISSUE");
  const [units, setUnits] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const isCorrection = movement === "CORRECTION";
  const closeLabel = useBilingualText("common.close");
  const movementIssueText = useBilingualText("bloodCentre.movementIssue");
  const movementDiscardText = useBilingualText("bloodCentre.movementDiscard");
  const movementCorrectionText = useBilingualText(
    "bloodCentre.movementCorrection",
  );
  const egNumberPlaceholder = useBilingualText("bloodCentre.egNumberPlaceholder");
  const unitsAvailableSuffix = useBilingualText("bloodCentre.unitsAvailableSuffix");

  const submit = async () => {
    if (row.bloodGroupId === undefined || row.bloodComponentId === undefined) {
      setFormError("Unable to identify this stock entry. Please refresh and try again.");
      return;
    }

    if (!units.trim()) {
      setFormError("Enter units.");
      return;
    }

    const parsedUnits = Number(units);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 0) {
      setFormError("Enter a valid whole number.");
      return;
    }

    const changedUnits = isCorrection
      ? parsedUnits - row.unitsAvailable
      : -Math.abs(parsedUnits);

    if (changedUnits === 0) {
      setFormError("No change to apply.");
      return;
    }

    if (!isCorrection && Math.abs(changedUnits) > row.unitsAvailable) {
      setFormError(`Only ${row.unitsAvailable} units are available to ${movement.toLowerCase()}.`);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await adjustStock({
        bloodGroupId: row.bloodGroupId,
        bloodComponentId: row.bloodComponentId,
        movement,
        changedUnits,
        remarks: remarks.trim() || undefined,
      });

      onSaved();
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, "Unable to adjust stock. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
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
      aria-labelledby="adjust-stock-title"
    >
      <div
        className="
          w-full
          max-w-[420px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-[var(--color-border-lighter)]
            px-5
            py-5
          "
        >
          <div className="min-w-0">
            <Bilingual
              tKey="bloodCentre.adjustStock"
              as="h2"
              id="adjust-stock-title"
              className="text-[14px] font-bold text-[var(--color-text-primary)]"
            />

            <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
              {row.bloodGroup} · {row.bloodType} · {row.unitsAvailable}{" "}
              {unitsAvailableSuffix}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[var(--color-text-placeholder-alt)]
              transition
              hover:bg-[var(--color-surface-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5">
          <Bilingual
            tKey="bloodCentre.movement"
            as="label"
            htmlFor="movement"
            className="block text-[13px] font-medium text-[var(--color-text-body)]"
          />

          <div className="relative mt-2">
            <select
              id="movement"
              value={movement}
              disabled={saving}
              onChange={(event) => {
                setMovement(event.target.value as StockMovement);
                setFormError("");
              }}
              className="
                h-11
                w-full
                appearance-none
                rounded-lg
                border
                border-[var(--color-border)]
                bg-white
                px-3
                pr-10
                text-[14px]
                text-[var(--color-text-body)]
                outline-none
                transition-all
                duration-200
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            >
              <option value="ISSUE">{movementIssueText}</option>
              <option value="DISCARD">{movementDiscardText}</option>
              <option value="CORRECTION">{movementCorrectionText}</option>
            </select>

            <ChevronDown
              size={17}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
            />
          </div>

          <Bilingual
            tKey={isCorrection ? "bloodCentre.newTotalUnits" : "bloodCentre.units"}
            as="label"
            htmlFor="adjustUnits"
            className="mt-4 block text-[13px] font-medium text-[var(--color-text-body)]"
          />

          <input
            id="adjustUnits"
            type="text"
            inputMode="numeric"
            value={units}
            maxLength={4}
            disabled={saving}
            onChange={(event) => {
              setUnits(event.target.value.replace(/\D/g, "").slice(0, 4));
              setFormError("");
            }}
            placeholder={isCorrection ? egNumberPlaceholder : "Units to " + movement.toLowerCase()}
            className="
              mt-2
              h-11
              w-full
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-3
              text-[14px]
              text-[var(--color-text-body)]
              outline-none
              transition-all
              duration-200
              placeholder:text-[var(--color-text-placeholder)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary)]/20
            "
          />

          <Bilingual
            tKey="bloodCentre.remarksOptional"
            as="label"
            htmlFor="remarks"
            className="mt-4 block text-[13px] font-medium text-[var(--color-text-body)]"
          />

          <textarea
            id="remarks"
            value={remarks}
            disabled={saving}
            onChange={(event) => setRemarks(event.target.value)}
            rows={2}
            className="
              mt-2
              w-full
              resize-none
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-3
              py-2.5
              text-[14px]
              text-[var(--color-text-body)]
              outline-none
              transition-all
              duration-200
              placeholder:text-[var(--color-text-placeholder)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary)]/20
            "
          />

          {formError && (
            <p role="alert" className="mt-3 text-[12px] text-red-500">
              {formError}
            </p>
          )}
        </div>

        <div
          className="
            flex
            gap-2
            border-t
            border-[var(--color-border-lighter)]
            bg-[var(--color-surface-alt)]
            px-5
            py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              min-h-[40px]
              flex-1
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-3
              py-1.5
              text-[13px]
              font-semibold
              text-[var(--color-text-quaternary)]
              transition
              hover:bg-[var(--color-surface-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="
              flex
              min-h-[40px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[var(--color-primary)]
              px-3
              py-1.5
              text-[13px]
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(255,59,63,0.18)]
              transition-all
              hover:bg-[var(--color-dashboard-cta-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && <Loader2 size={14} className="animate-spin shrink-0" />}
            {saving ? (
              <BilingualInline tKey="common.saving" />
            ) : (
              <BilingualInline
                tKey="bloodCentre.apply"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

//  STAT CARD

function Stat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Droplets;
  value: string;
  label: ReactNode;
  color: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[88px]
        flex-col
        items-center
        justify-center
        gap-1
        rounded-xl
        px-2
        py-3.5
        text-center
        text-white
        shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        transition-transform
        duration-200
        hover:-translate-y-px
        sm:min-h-[96px]
        md:min-h-[104px]
      "
      style={{
        backgroundColor: color,
      }}
    >
      <Icon size={18} strokeWidth={1.8} className="sm:h-5 sm:w-5" />

      <div
        className="
          text-[18px]
          font-bold
          leading-6
          sm:text-[20px]
          md:text-[22px]
        "
      >
        {value}
      </div>

      <div
        className="
          text-[11px]
          font-medium
          leading-4
          opacity-90
          sm:text-[12px]
        "
      >
        {label}
      </div>
    </div>
  );
}
