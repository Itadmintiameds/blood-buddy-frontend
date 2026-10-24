"use client";

import {
  Building2,
  CalendarDays,
  FileCheck2,
  Link2,
  Loader2,
  LocateFixed,
  MapPin,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getApiErrorMessage } from "@/services/api/client";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import { FormInput } from "@/app/components/ui/FormInput";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";
import {
  bloodCentreEditSchema,
  normalizeBloodCentreEditForm,
} from "@/schema/bloodCenter/registrationSchema";
import type {
  BloodCentreAdminUpdatePayload,
  BloodCentreEditInput,
} from "@/types/bloodCenter/bloodCenterTypes";

// English sub-line colour for Kannada labels on the solid Save button.
const ON_SOLID_EN_CLASS =
  "mt-0.5 text-[0.68em] font-normal leading-tight text-white/85";

// Form values → API payload. Optional fields left blank are omitted (the PUT
// is a full replacement, so they're cleared). The licence fields only go out
// when the form shows them (superadmin).
export function toBloodCentrePayload(
  values: BloodCentreEditInput,
  includeLicence: boolean,
): BloodCentreAdminUpdatePayload {
  const payload: BloodCentreAdminUpdatePayload = {
    bloodCentreName: values.bloodCentreName,
    mobileNumber: values.mobileNumber,
    address: values.address || undefined,
    district: values.district,
    city: values.city,
    pincode: values.pinCode,
    latitude: values.latitude ? Number(values.latitude) : undefined,
    longitude: values.longitude ? Number(values.longitude) : undefined,
    locationUrl: values.locationUrl || undefined,
  };

  if (includeLicence) {
    payload.bloodCentreLicenceNumber = values.licenseNumber || undefined;
    payload.licenceExpiryDate = values.dateOfExpiry || undefined;
  }

  return payload;
}

// Edits a centre's profile. Shared by the centre's own Profile page (no
// licence fields) and the superadmin's blood bank view (with licence fields).
// `onSubmit` performs the save; a thrown error is shown in the form.
// `inline` renders it as a full-width card in the page instead of a pop-up.
export function BloodCentreEditModal({
  initialValues,
  email,
  includeLicence,
  inline = false,
  onClose,
  onSubmit,
}: {
  initialValues: BloodCentreEditInput;
  /** Login email, shown for context — it isn't editable. */
  email?: string;
  includeLicence: boolean;
  inline?: boolean;
  onClose: () => void;
  onSubmit: (values: BloodCentreEditInput) => Promise<void>;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const enterBloodCentreName = useBilingualText(
    "bloodCentre.enterBloodCentreName",
  );
  const enterLicenseNumber = useBilingualText("bloodCentre.enterLicenseNumber");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");
  const enterLatitude = useBilingualText("bloodCentre.enterLatitude");
  const enterLongitude = useBilingualText("bloodCentre.enterLongitude");
  const enterLocationUrl = useBilingualText("bloodCentre.enterLocationUrl");

  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BloodCentreEditInput>({
    resolver: zodResolver(
      bloodCentreEditSchema,
    ) as Resolver<BloodCentreEditInput>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError("");

    try {
      await onSubmit(normalizeBloodCentreEditForm(values));
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, "Unable to update this blood centre."),
      );
    }
  });

  if (!rendered) {
    return null;
  }

  const card = (
    <div
      className={
        inline
          ? "animate-rise flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)]"
          : `motion-surface flex max-h-[calc(100dvh-2rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 sm:max-h-[90dvh] ${
              visible
                ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
                : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
            }`
      }
      role={inline ? "region" : undefined}
      aria-labelledby={inline ? "edit-centre-title" : undefined}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--color-border-lighter)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
            <Pencil size={16} className="text-[var(--color-primary)]" />
          </div>

          <div className="min-w-0">
            <h2
              id="edit-centre-title"
              className="text-[14px] font-bold text-[var(--color-text-primary)]"
            >
              Edit Blood Centre
            </h2>
            {email && (
              <p className="mt-0.5 break-words text-[12px] text-[var(--color-text-placeholder-alt)]">
                {email}
              </p>
            )}
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

      <form
        onSubmit={submit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div
          className={`grid min-h-0 flex-1 grid-cols-1 content-start gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5 sm:py-5 ${
            inline ? "sm:px-6 sm:py-6" : "overflow-y-auto overscroll-contain"
          }`}
        >
          <div className="sm:col-span-2">
            <FormInput
              id="edit-centre-name"
              icon={Building2}
              label={<Bilingual tKey="bloodCentre.bloodCentreName" as="span" />}
              required
              placeholder={enterBloodCentreName}
              error={errors.bloodCentreName?.message}
              {...register("bloodCentreName")}
            />
          </div>

          <FormInput
            id="edit-centre-mobile"
            icon={Phone}
            label={<Bilingual tKey="common.mobileNumber" as="span" />}
            required
            inputMode="numeric"
            maxLength={10}
            placeholder={enter10DigitMobile}
            error={errors.mobileNumber?.message}
            {...register("mobileNumber")}
          />

          <FormInput
            id="edit-centre-pincode"
            icon={MapPin}
            label={<Bilingual tKey="common.pinCode" as="span" />}
            required
            inputMode="numeric"
            maxLength={6}
            placeholder={enter6DigitPinCode}
            error={errors.pinCode?.message}
            {...register("pinCode")}
          />

          {includeLicence && (
            <>
              <FormInput
                id="edit-centre-licence"
                icon={FileCheck2}
                label={<Bilingual tKey="bloodCentre.licenseNumber" as="span" />}
                placeholder={enterLicenseNumber}
                error={errors.licenseNumber?.message}
                {...register("licenseNumber")}
              />

              <FormInput
                id="edit-centre-expiry"
                icon={CalendarDays}
                label={<Bilingual tKey="bloodCentre.dateOfExpiry" as="span" />}
                type="date"
                error={errors.dateOfExpiry?.message}
                {...register("dateOfExpiry")}
              />
            </>
          )}

          <div className="sm:col-span-2">
            <FormInput
              id="edit-centre-address"
              icon={MapPin}
              label={<Bilingual tKey="common.address" as="span" />}
              placeholder={enterAddress}
              error={errors.address?.message}
              {...register("address")}
            />
          </div>

          <FormInput
            id="edit-centre-district"
            icon={MapPin}
            label={<Bilingual tKey="common.district" as="span" />}
            required
            placeholder={enterDistrict}
            error={errors.district?.message}
            {...register("district")}
          />

          <FormInput
            id="edit-centre-city"
            icon={MapPin}
            label={<Bilingual tKey="common.city" as="span" />}
            required
            placeholder={enterCity}
            error={errors.city?.message}
            {...register("city")}
          />

          <FormInput
            id="edit-centre-latitude"
            icon={LocateFixed}
            label={<Bilingual tKey="bloodCentre.latitude" as="span" />}
            inputMode="decimal"
            placeholder={enterLatitude}
            error={errors.latitude?.message}
            {...register("latitude")}
          />

          <FormInput
            id="edit-centre-longitude"
            icon={LocateFixed}
            label={<Bilingual tKey="bloodCentre.longitude" as="span" />}
            inputMode="decimal"
            placeholder={enterLongitude}
            error={errors.longitude?.message}
            {...register("longitude")}
          />

          <div className="sm:col-span-2">
            <FormInput
              id="edit-centre-location-url"
              icon={Link2}
              label={<Bilingual tKey="bloodCentre.locationUrl" as="span" />}
              type="url"
              placeholder={enterLocationUrl}
              error={errors.locationUrl?.message}
              {...register("locationUrl")}
            />
          </div>

          {submitError && (
            <p role="alert" className="text-[12px] text-red-500 sm:col-span-2">
              {submitError}
            </p>
          )}
        </div>

        <div
          className={`flex shrink-0 gap-2 border-t ${
            inline ? "sm:justify-end sm:[&>button]:max-w-[180px] " : ""
          } border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-3 sm:px-5 sm:py-4`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[40px] sm:text-[11px]"
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all hover:bg-[var(--color-dashboard-cta-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[40px] sm:text-[11px]"
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
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return card;
  }

  return (
    <div
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-centre-title"
    >
      {card}
    </div>
  );
}
