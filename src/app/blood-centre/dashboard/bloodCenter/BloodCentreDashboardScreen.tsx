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
  const [adjustingRow, setAdjustingRow] =
    useState<BloodAvailabilityItem | null>(null);
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
      <div className="flex min-h-screen w-full flex-col bg-[#f7f7f8]">
        {/* HEADER */}
        <div className="shrink-0">
          <BrandHeader />
        </div>

        {/* DASHBOARD */}
        <main className="flex-1">
          <section className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1180px]">
              {/* DASHBOARD HEADER */}
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  rounded-2xl
                  border
                  border-[#e8e8e8]
                  bg-white
                  px-5
                  py-5
                  shadow-[0_4px_18px_rgba(0,0,0,0.035)]
                  sm:px-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  lg:px-7
                  lg:py-6
                "
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#fff0f0]
                      "
                    >
                      <Droplets
                        size={22}
                        strokeWidth={1.8}
                        className="text-[#ff3b3f]"
                      />
                    </div>

                    <div className="min-w-0">
                      <Bilingual
                        tKey="bloodCentre.dashboard"
                        as="h1"
                        className="
                          text-[20px]
                          font-bold
                          leading-6
                          tracking-[-0.2px]
                          text-[#222]
                          sm:text-[22px]
                          lg:text-[24px]
                        "
                      />

                      <Bilingual
                        tKey="bloodCentre.welcomeUser"
                        params={{
                          suffix: session?.email ? `, ${session.email}` : "",
                        }}
                        as="p"
                        className="
                          mt-1
                          truncate
                          text-[12px]
                          text-[#777]
                          sm:text-[13px]
                        "
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <LogoutButton />
                </div>
              </div>

              {/* STAT CARDS */}
              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-3
                  sm:gap-4
                  lg:mt-6
                "
              >
                <Stat
                  icon={Droplets}
                  value={String(totalGroupsListed)}
                  label={
                    <Bilingual
                      tKey="bloodCentre.bloodGroupsListed"
                      as="span"
                      enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
                    />
                  }
                  color="#FF3B3B"
                />

                <Stat
                  icon={Package}
                  value={String(totalUnits)}
                  label={
                    <Bilingual
                      tKey="bloodCentre.totalUnitsAvailable"
                      as="span"
                      enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
                    />
                  }
                  color="#378200"
                />

                <Stat
                  icon={AlertTriangle}
                  value={String(lowStockCount)}
                  label={
                    <Bilingual
                      tKey="bloodCentre.lowStockAlerts"
                      as="span"
                      enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
                    />
                  }
                  color="#FDC000"
                />
              </div>

              {/* AVAILABILITY SECTION */}
              <div
                className="
                  mt-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#e5e5e5]
                  bg-white
                  shadow-[0_5px_22px_rgba(0,0,0,0.045)]
                  lg:mt-6
                "
              >
                {/* Section Header */}
                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-[#ededed]
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                    sm:py-5
                  "
                >
                  <div>
                    <Bilingual
                      tKey="bloodCentre.bloodAvailability"
                      as="h2"
                      className="
                        text-[16px]
                        font-bold
                        text-[#222]
                        sm:text-[17px]
                      "
                    />

                    <p className="mt-1 text-[11px] text-[#888] sm:text-[12px]">
                      Current blood stock available at your centre
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      w-fit
                      items-center
                      gap-1.5
                      rounded-full
                      bg-[#fff3f3]
                      px-3
                      py-1.5
                      text-[10px]
                      font-medium
                      text-[#ff3b3f]
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3f]" />
                    Live Availability
                  </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-hidden">
                  {/* Table Header */}
                  <div
                    className="
                      grid
                      grid-cols-[1fr_1.4fr_0.9fr_52px]
                      items-center
                      border-b
                      border-[#e9e9e9]
                      bg-[#f8f8f9]
                      px-4
                      py-3
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.04em]
                      text-[#666]
                      sm:grid-cols-[1fr_1.5fr_1fr_58px]
                      sm:px-6
                      sm:py-3.5
                      sm:text-[11px]
                    "
                  >
                    <Bilingual
                      tKey="bloodCentre.bloodGroup"
                      as="div"
                      className="text-left"
                    />
                    <Bilingual
                      tKey="bloodCentre.bloodType"
                      as="div"
                      className="text-center"
                    />
                    <Bilingual
                      tKey="bloodCentre.bloodUnits"
                      as="div"
                      className="text-right"
                    />
                    <Bilingual
                      tKey="bloodCentre.adjust"
                      as="div"
                      className="text-right"
                    />
                  </div>

                  {loading && (
                    <div
                      className="
                        flex
                        min-h-[190px]
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        px-4
                      "
                    >
                      <Loader2
                        size={22}
                        className="animate-spin text-[#ff3b3f]"
                      />

                      <Bilingual
                        tKey="bloodCentre.loadingAvailability"
                        as="p"
                        className="text-[12px] text-[#888]"
                      />
                    </div>
                  )}

                  {!loading && error && (
                    <div
                      role="alert"
                      className="
                        flex
                        min-h-[190px]
                        items-center
                        justify-center
                        px-5
                        text-center
                        text-[12px]
                        leading-5
                        text-red-500
                      "
                    >
                      {error}
                    </div>
                  )}

                  {!loading && !error && rows.length === 0 && (
                    <div
                      className="
                        flex
                        min-h-[190px]
                        flex-col
                        items-center
                        justify-center
                        px-5
                        text-center
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          bg-[#fff2f2]
                        "
                      >
                        <Droplets
                          size={20}
                          className="text-[#ff3b3f]"
                          strokeWidth={1.7}
                        />
                      </div>

                      <Bilingual
                        tKey="bloodCentre.noAvailabilityYet"
                        as="p"
                        className="mt-3 text-[13px] font-medium text-[#555]"
                      />

                      <p className="mt-1 text-[11px] text-[#999]">
                        Add blood availability to see the current stock here.
                      </p>
                    </div>
                  )}

                  {!loading &&
                    !error &&
                    rows.map((row, index) => (
                      <div
                        key={`${row.bloodGroup}-${row.bloodType}`}
                        className="
                          grid
                          min-h-[58px]
                          grid-cols-[1fr_1.4fr_0.9fr_52px]
                          items-center
                          border-b
                          border-[#eeeeee]
                          px-4
                          text-[12px]
                          text-[#444]
                          transition-colors
                          duration-150
                          last:border-b-0
                          hover:bg-[#fffafa]
                          sm:min-h-[62px]
                          sm:grid-cols-[1fr_1.5fr_1fr_58px]
                          sm:px-6
                          sm:text-[13px]
                        "
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#ffffff" : "#fcfcfc",
                        }}
                      >
                        {/* Blood Group */}
                        <div className="flex min-w-0 items-center justify-start">
                          <div
                            className="
                              mr-2
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-[#fff1f1]
                              sm:mr-3
                            "
                          >
                            <Droplets
                              size={14}
                              strokeWidth={1.8}
                              className="text-[#ff3b3f]"
                            />
                          </div>

                          <span className="truncate font-semibold text-[#333]">
                            {row.bloodGroup}
                          </span>
                        </div>

                        {/* Blood Type */}
                        <div
                          className="
                            min-w-0
                            px-2
                            text-center
                            font-medium
                            text-[#666]
                          "
                        >
                          <span className="break-words">{row.bloodType}</span>
                        </div>

                        {/* Units */}
                        <div className="text-right">
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              bg-[#f3faef]
                              px-2.5
                              py-1
                              text-[11px]
                              font-bold
                              text-[#378200]
                              sm:px-3
                              sm:text-[12px]
                            "
                          >
                            {row.unitsAvailable} {unitsWordText}
                          </span>
                        </div>

                        {/* Adjust */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setAdjustingRow(row)}
                            disabled={
                              row.bloodGroupId === undefined ||
                              row.bloodComponentId === undefined
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#e5e5e5]
                              bg-white
                              text-[#777]
                              shadow-[0_1px_4px_rgba(0,0,0,0.03)]
                              transition-all
                              duration-150
                              hover:border-[#ffcccc]
                              hover:bg-[#fff4f4]
                              hover:text-[#ff3b3f]
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                              sm:h-9
                              sm:w-9
                            "
                            aria-label={`Adjust ${row.bloodGroup} ${row.bloodType} stock`}
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ADD AVAILABILITY */}
              <div
                className="
                  mt-5
                  flex
                  justify-center
                  pb-4
                  sm:mt-6
                  sm:pb-6
                "
              >
                <Link
                  href={routes.addAvailability}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#ff3b3f]
                    px-6
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-[0_6px_18px_rgba(255,59,63,0.20)]
                    transition-all
                    duration-200
                    hover:-translate-y-px
                    hover:bg-[#e93232]
                    hover:shadow-[0_8px_22px_rgba(255,59,63,0.25)]
                    active:translate-y-0
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#ff3b3f]
                    focus-visible:ring-offset-2
                    sm:w-[300px]
                  "
                >
                  <Plus size={17} strokeWidth={2} />
                  <BilingualInline
                    tKey="bloodCentre.addAvailability"
                    enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
                  />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ADJUST STOCK MODAL */}
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

// ADJUST STOCK MODAL

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
  const egNumberPlaceholder = useBilingualText(
    "bloodCentre.egNumberPlaceholder",
  );
  const unitsAvailableSuffix = useBilingualText(
    "bloodCentre.unitsAvailableSuffix",
  );

  const submit = async () => {
    if (row.bloodGroupId === undefined || row.bloodComponentId === undefined) {
      setFormError(
        "Unable to identify this stock entry. Please refresh and try again.",
      );
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
      setFormError(
        `Only ${row.unitsAvailable} units are available to ${movement.toLowerCase()}.`,
      );
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
            border-[#eeeeee]
            px-5
            py-5
          "
        >
          <div className="min-w-0">
            <Bilingual
              tKey="bloodCentre.adjustStock"
              as="h2"
              id="adjust-stock-title"
              className="text-[14px] font-bold text-[#222]"
            />

            <p className="mt-1 text-[11px] text-[#888]">
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
              text-[#999]
              transition
              hover:bg-[#f7f7f7]
              hover:text-[#555]
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
            className="block text-[13px] font-medium text-[#444]"
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
                border-[#dddddd]
                bg-white
                px-3
                pr-10
                text-[13px]
                text-[#444]
                outline-none
                transition-all
                focus:border-[#ff3b3f]
                focus:ring-2
                focus:ring-[#ff3b3f]/15
              "
            >
              <option value="ISSUE">{movementIssueText}</option>
              <option value="DISCARD">{movementDiscardText}</option>
              <option value="CORRECTION">{movementCorrectionText}</option>
            </select>

            <ChevronDown
              size={17}
              strokeWidth={1.8}
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[#888]
              "
            />
          </div>

          <Bilingual
            tKey={
              isCorrection ? "bloodCentre.newTotalUnits" : "bloodCentre.units"
            }
            as="label"
            htmlFor="adjustUnits"
            className="mt-4 block text-[13px] font-medium text-[#444]"
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
            placeholder={
              isCorrection
                ? egNumberPlaceholder
                : "Units to " + movement.toLowerCase()
            }
            className="
              mt-2
              h-11
              w-full
              rounded-lg
              border
              border-[#dddddd]
              bg-white
              px-3
              text-[13px]
              text-[#444]
              outline-none
              transition-all
              placeholder:text-[#aaa]
              focus:border-[#ff3b3f]
              focus:ring-2
              focus:ring-[#ff3b3f]/15
            "
          />

          <Bilingual
            tKey="bloodCentre.remarksOptional"
            as="label"
            htmlFor="remarks"
            className="mt-4 block text-[13px] font-medium text-[#444]"
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
              border-[#dddddd]
              bg-white
              px-3
              py-2.5
              text-[13px]
              text-[#444]
              outline-none
              transition-all
              placeholder:text-[#aaa]
              focus:border-[#ff3b3f]
              focus:ring-2
              focus:ring-[#ff3b3f]/15
            "
          />

          {formError && (
            <p role="alert" className="mt-3 text-[12px] leading-5 text-red-500">
              {formError}
            </p>
          )}
        </div>

        <div
          className="
            flex
            gap-2
            border-t
            border-[#eeeeee]
            bg-[#fafafa]
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
              border-[#dddddd]
              bg-white
              px-3
              py-1.5
              text-[13px]
              font-semibold
              text-[#666]
              transition
              hover:bg-[#f5f5f5]
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
              bg-[#ff3b3f]
              px-3
              py-1.5
              text-[13px]
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(255,59,63,0.18)]
              transition-all
              hover:bg-[#e93232]
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

// STAT CARD

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
        min-h-[112px]
        items-center
        gap-4
        rounded-2xl
        px-5
        py-5
        text-white
        shadow-[0_6px_20px_rgba(0,0,0,0.10)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_9px_25px_rgba(0,0,0,0.13)]
        sm:min-h-[120px]
        sm:px-6
      "
      style={{
        backgroundColor: color,
      }}
    >
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/15
          sm:h-13
          sm:w-13
        "
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <div
          className="
            text-[25px]
            font-bold
            leading-7
            tracking-[-0.3px]
            sm:text-[28px]
          "
        >
          {value}
        </div>

        <div
          className="
            mt-1
            text-[11px]
            font-medium
            leading-4
            text-white/90
            sm:text-[12px]
          "
        >
          {label}
        </div>
      </div>
    </div>
  );
}
