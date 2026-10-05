"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import { addAvailability } from "@/services/bloodCenter/bloodCenter.service";
import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

// Adds units to an existing inventory row (blood group + component already
// known) via POST /inventory/add-availability.
export function AddStockModal({
  row,
  onClose,
  onSaved,
}: {
  row: BloodAvailabilityItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [units, setUnits] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const closeLabel = useBilingualText("common.close");
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

    const parsedUnits = Number(units);

    if (!units.trim() || !Number.isInteger(parsedUnits) || parsedUnits <= 0) {
      setFormError("Enter a whole number greater than zero.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await addAvailability({
        bloodGroupId: row.bloodGroupId,
        bloodComponentId: row.bloodComponentId,
        units: parsedUnits,
        remarks: remarks.trim() || undefined,
      });

      onSaved();
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, "Unable to add stock. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-stock-title"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0">
            <h2
              id="add-stock-title"
              className="text-[14px] font-bold text-[var(--color-text-primary)]"
            >
              Add Blood Units
            </h2>

            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
              {row.bloodGroup} · {row.bloodType} ·{" "}
              {row.unitsAvailable}{" "}
              {unitsAvailableSuffix}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:m-0 sm:h-8 sm:w-8"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <label
            htmlFor="addUnits"
            className="block text-[13px] font-medium text-[var(--color-text-body)]"
          >
            <Bilingual tKey="bloodCentre.units" as="span" />
            <span className="text-red-500"> *</span>
          </label>

          <input
            id="addUnits"
            type="text"
            inputMode="numeric"
            value={units}
            maxLength={4}
            disabled={saving}
            autoFocus
            onChange={(event) => {
              setUnits(event.target.value.replace(/\D/g, "").slice(0, 4));
              setFormError("");
            }}
            placeholder="Units to add"
            className="mt-2 h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] text-[var(--color-text-body)] outline-none transition-all placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />

          <Bilingual
            tKey="bloodCentre.remarksOptional"
            as="label"
            htmlFor="addRemarks"
            className="mt-4 block text-[13px] font-medium text-[var(--color-text-body)]"
          />

          <textarea
            id="addRemarks"
            value={remarks}
            disabled={saving}
            onChange={(event) => setRemarks(event.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-[13px] text-[var(--color-text-body)] outline-none transition-all placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />

          {formError && (
            <p role="alert" className="mt-3 text-[12px] leading-5 text-red-500">
              {formError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-hover)] px-4 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 flex-1 sm:min-h-[40px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            style={{ color: "var(--color-white)" }}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 sm:min-h-[40px] rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all hover:bg-[var(--color-primary-hover-alt)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin shrink-0" />
            ) : (
              <Plus size={15} strokeWidth={2.2} />
            )}
            {saving ? (
              <BilingualInline tKey="common.saving" />
            ) : (
              "Add stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
