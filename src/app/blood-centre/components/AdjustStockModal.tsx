"use client";

import { useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import { adjustStock } from "@/services/bloodCenter/bloodCenter.service";
import type {
  BloodAvailabilityItem,
  StockMovement,
} from "@/types/bloodCenter/bloodCenterTypes";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export function AdjustStockModal({
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

            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
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
              hover:text-[var(--color-text-secondary)]
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
                text-[13px]
                text-[var(--color-text-body)]
                outline-none
                transition-all
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/15
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
                text-[var(--color-text-tertiary)]
              "
            />
          </div>

          <Bilingual
            tKey={
              isCorrection ? "bloodCentre.newTotalUnits" : "bloodCentre.units"
            }
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
              border-[var(--color-border)]
              bg-white
              px-3
              text-[13px]
              text-[var(--color-text-body)]
              outline-none
              transition-all
              placeholder:text-[var(--color-text-placeholder)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary)]/15
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
              text-[13px]
              text-[var(--color-text-body)]
              outline-none
              transition-all
              placeholder:text-[var(--color-text-placeholder)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary)]/15
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
            border-[var(--color-border-lighter)]
            bg-[var(--color-surface-hover)]
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
              hover:bg-[var(--color-primary-hover-alt)]
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
