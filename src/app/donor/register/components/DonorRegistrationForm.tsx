"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Droplets,
  Hash,
  MapPin,
  MapPinned,
  Phone,
  UserRound,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  STICKY_FORM_CLASS,
  StickySubmitBar,
} from "@/app/components/ui/StickySubmitBar";
import { FormInput } from "@/app/components/ui/FormInput";
import { ConsentCheckbox } from "@/app/components/ui/ConsentCheckbox";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import {
  donorPublicRegistrationSchema,
  getDonorDobBounds,
  normalizeDonorForm,
} from "@/schema/donor/donorRegistrationSchema";
import type {
  DonorRegistrationInput,
  DonorRegistrationResponse,
} from "@/types/donor/donorTypes";
import { registerDonor } from "@/services/donor/donorRegistrationService";
import { getBloodGroups } from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import type { MasterBloodGroup } from "@/types/master.types";
import { translations } from "@/translations/translations";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

const defaultValues: DonorRegistrationInput = {
  fullName: "",
  mobileNumber: "",
  alternativeMobileNumber: "",
  bloodGroupId: "",
  dob: "",
  address: "",
  district: "",
  city: "",
  pincode: "",
  lastBloodDonationDate: "",
  consentAccepted: false,
};

// Today as YYYY-MM-DD in the user's local timezone. toISOString() is UTC, which
// is already "tomorrow" (or still "yesterday") for part of the day in most
// timezones and would let the date picker offer the wrong cut-off.
function getLocalTodayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

export function DonorRegistrationForm() {
  const router = useRouter();
  const dobBounds = getDonorDobBounds();
  const todayIso = getLocalTodayIso();
  const enterFullName = useBilingualText("common.enterFullName");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const enterAlternateMobile = useBilingualText("donor.enterAlternateMobile");
  const selectBloodGroupText = useBilingualText("bloodCentre.selectBloodGroup");
  const loadingText = useBilingualText("bloodCentre.loadingOptions");
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredDonor, setRegisteredDonor] =
    useState<DonorRegistrationResponse | null>(null);
  // Picked once per successful registration (not on every render) so each
  // donor sees one of several messages instead of the same line every time.
  const [motivationalMessageIndex, setMotivationalMessageIndex] = useState(0);
  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [selectedBloodGroupId, setSelectedBloodGroupId] = useState<
    number | ""
  >("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DonorRegistrationInput>({
    resolver: zodResolver(
      donorPublicRegistrationSchema,
    ) as Resolver<DonorRegistrationInput>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadBloodGroups() {
      setMastersLoading(true);
      try {
        const groups = await getBloodGroups();
        if (!cancelled) setBloodGroups(groups);
      } catch (error) {
        console.error("Load blood groups error:", error);
      } finally {
        if (!cancelled) setMastersLoading(false);
      }
    }

    void loadBloodGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (rawData: DonorRegistrationInput) => {
    setSubmitError(null);

    const data = normalizeDonorForm(rawData);

    try {
      const response = await registerDonor({
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        alternativeMobileNumber: data.alternativeMobileNumber || undefined,
        bloodGroupId: Number(data.bloodGroupId),
        dob: data.dob,
        address: data.address || undefined,
        city: data.city,
        district: data.district,
        pincode: data.pincode,
        lastBloodDonationDate: data.lastBloodDonationDate || undefined,
      });

      setRegisteredDonor(response);
      setMotivationalMessageIndex(
        Math.floor(
          Math.random() * translations.en.donor.donorMotivationalMessages.length,
        ),
      );
    } catch (error) {
      console.error("Donor registration error:", error);

      setSubmitError(
        getApiErrorMessage(error, "Unable to register. Please try again."),
      );
    }
  };

  const handleSuccessConfirm = () => {
    setRegisteredDonor(null);
    router.push("/donor");
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className={STICKY_FORM_CLASS}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 md:gap-x-10 md:gap-y-5">
          <FormInput
            id="fullName"
            icon={UserRound}
            label={<Bilingual tKey="common.fullName" as="span" />}
            required
            placeholder={enterFullName}
            maxLength={100}
            autoComplete="name"
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <FormInput
            id="mobileNumber"
            icon={Phone}
            label={<Bilingual tKey="common.mobileNumber" as="span" />}
            required
            placeholder={enter10DigitMobile}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            {...register("mobileNumber", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
              },
            })}
            error={errors.mobileNumber?.message}
          />

          <FormInput
            id="alternativeMobileNumber"
            icon={Phone}
            label={<Bilingual tKey="donor.alternateMobileOptional" as="span" />}
            placeholder={enterAlternateMobile}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            {...register("alternativeMobileNumber", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
              },
            })}
            error={errors.alternativeMobileNumber?.message}
          />

          <FormInput
            id="dob"
            icon={CalendarDays}
            label={<Bilingual tKey="donor.dateOfBirth" as="span" />}
            required
            type="date"
            min={dobBounds.min}
            max={dobBounds.max}
            autoComplete="bday"
            {...register("dob")}
            error={errors.dob?.message}
          />

          <div className="w-full">
            <label
              htmlFor="bloodGroupId"
              className="mb-1.5 flex items-start gap-0.5 text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            >
              <Bilingual tKey="bloodCentre.bloodGroup" as="span" />
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Droplets
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-primary)]"
              />

              <select
                id="bloodGroupId"
                disabled={mastersLoading}
                defaultValue=""
                {...register("bloodGroupId", {
                  setValueAs: (value) => (value === "" ? "" : Number(value)),
                  onChange: (event) => {
                    setSelectedBloodGroupId(
                      event.target.value ? Number(event.target.value) : "",
                    );
                  },
                })}
                className={`
                  h-11
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  bg-[var(--color-white)]
                  pl-10
                  pr-10
                  text-[14px]
                  font-normal
                  outline-none
                  transition-all
                  duration-200
                  ${
                    errors.bloodGroupId
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  }
                  ${selectedBloodGroupId ? "text-[var(--color-text-body)]" : "text-[var(--color-input-placeholder)]"}
                `}
              >
                <option value="" disabled>
                  {mastersLoading ? loadingText : selectBloodGroupText}
                </option>

                {bloodGroups.map((group) => (
                  <option key={group.bloodGroupId} value={group.bloodGroupId}>
                    {group.bloodGroupName}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
              />
            </div>

            {errors.bloodGroupId?.message && (
              <p role="alert" className="mt-1.5 px-1 text-[12px] leading-4 text-red-500">
                {errors.bloodGroupId.message}
              </p>
            )}
          </div>

          <FormInput
            id="address"
            icon={MapPin}
            label={<Bilingual tKey="donor.addressOptional" as="span" />}
            placeholder={enterAddress}
            maxLength={200}
            autoComplete="street-address"
            {...register("address")}
            error={errors.address?.message}
          />

          <FormInput
            id="district"
            icon={MapPinned}
            label={<Bilingual tKey="common.district" as="span" />}
            required
            placeholder={enterDistrict}
            maxLength={100}
            autoComplete="address-level2"
            {...register("district")}
            error={errors.district?.message}
          />

          <FormInput
            id="city"
            icon={MapPinned}
            label={<Bilingual tKey="common.city" as="span" />}
            required
            placeholder={enterCity}
            maxLength={100}
            autoComplete="address-level2"
            {...register("city")}
            error={errors.city?.message}
          />

          <FormInput
            id="pincode"
            icon={MapPinned}
            label={<Bilingual tKey="common.pinCode" as="span" />}
            required
            placeholder={enter6DigitPinCode}
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            {...register("pincode", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);
              },
            })}
            error={errors.pincode?.message}
          />

          <FormInput
            id="lastBloodDonationDate"
            icon={CalendarDays}
            label={<Bilingual tKey="donor.lastBloodDonationDateOptional" as="span" />}
            type="date"
            max={todayIso}
            {...register("lastBloodDonationDate")}
            error={errors.lastBloodDonationDate?.message}
          />
        </div>

        <div className="mt-5">
          <ConsentCheckbox
            id="consentAccepted"
            statementKey="donor.consentStatement"
            detailsKey="donor.consentDetails"
            {...register("consentAccepted")}
            error={errors.consentAccepted?.message}
          />
        </div>

        {submitError && (
          <div
            role="alert"
            className="mx-auto mt-5 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-600 md:max-w-[500px]"
          >
            {submitError}
          </div>
        )}

        <StickySubmitBar ready={isValid} loading={isSubmitting}>
          <BilingualInline
            tKey="common.register"
            enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
          />
        </StickySubmitBar>
      </form>

      <SuccessModal
        open={registeredDonor !== null}
        title={
          <Bilingual
            tKey="bloodCentre.registrationSuccess"
            as="span"
            enClassName="mt-1 block text-[clamp(13.5px,3.8vw,14.5px)] font-medium leading-snug text-[var(--color-text-muted)]"
          />
        }
        description={
          <>
            <Bilingual
              tKey="donor.donorRegisteredSuccessfully"
              as="span"
              className="block"
              enClassName="mt-1 block text-[clamp(12.5px,3.4vw,13.5px)] font-medium leading-relaxed text-[var(--color-text-muted)]"
            />
            {registeredDonor && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-left">
                <Hash
                  size={16}
                  strokeWidth={2.25}
                  className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
                />
                <Bilingual
                  tKey="donor.donorReferenceId"
                  params={{ id: registeredDonor.bloodDonorDetailsId }}
                  as="span"
                  className="block font-semibold text-[var(--color-text-body)]"
                  enClassName="mt-1 block text-[clamp(12.5px,3.4vw,13.5px)] font-medium leading-relaxed text-[var(--color-text-muted)]"
                />
              </div>
            )}
            <Bilingual
              tKey={`donor.donorMotivationalMessages.${motivationalMessageIndex}`}
              as="span"
              className="mt-3 block rounded-xl bg-[var(--color-primary)]/5 px-3.5 py-3 font-medium text-[var(--color-primary)]"
              enClassName="mt-1 block text-[clamp(12px,3.3vw,13px)] font-medium leading-relaxed text-[var(--color-primary)]/80"
            />
          </>
        }
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
