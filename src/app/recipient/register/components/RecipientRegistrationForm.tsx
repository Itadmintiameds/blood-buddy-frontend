"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Droplets,
  Hospital,
  MapPin,
  MapPinned,
  Package,
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
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import {
  normalizeRecipientForm,
  recipientRequestSchema,
} from "@/schema/recipient/recipientRequestSchema";
import type {
  BloodRequestResponse,
  RecipientRequestInput,
} from "@/types/recipient/receipientTypes";
import { submitBloodRequest } from "@/services/recipient/recipientRequestService";
import { saveLastRecipientPincode } from "@/services/recipient/recipientSessionStorage";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import { HELPLINE_NUMBER } from "@/config/support";
import { dobFromAge } from "@/utils/age";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export function RecipientRegistrationForm() {
  const router = useRouter();
  const enterPatientName = useBilingualText("recipient.enterPatientName");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const loadingText = useBilingualText("bloodCentre.loadingOptions");
  const selectBloodGroupText = useBilingualText("recipient.selectBloodGroup");
  const selectBloodComponentText = useBilingualText(
    "recipient.selectBloodComponent",
  );
  const enterUnitsRequired = useBilingualText("recipient.enterUnitsRequired");
  const enterAge = useBilingualText("recipient.enterAge");
  const enterHospitalName = useBilingualText("recipient.enterHospitalName");
  const enterHospitalAddress = useBilingualText(
    "recipient.enterHospitalAddress",
  );
  const enterHospitalDistrict = useBilingualText(
    "recipient.enterHospitalDistrict",
  );
  const enterHospitalCity = useBilingualText("recipient.enterHospitalCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [bloodComponents, setBloodComponents] = useState<
    MasterBloodComponent[]
  >([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [successResult, setSuccessResult] =
    useState<BloodRequestResponse | null>(null);

  const defaultValues: RecipientRequestInput = {
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

  const [selectedBloodGroupId, setSelectedBloodGroupId] = useState<
    number | ""
  >("");
  const [selectedBloodComponentId, setSelectedBloodComponentId] = useState<
    number | ""
  >("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RecipientRequestInput>({
    resolver: zodResolver(
      recipientRequestSchema,
    ) as Resolver<RecipientRequestInput>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMasters() {
      setMastersLoading(true);
      try {
        const [groups, components] = await Promise.all([
          getBloodGroups(),
          getBloodComponents(),
        ]);

        if (!cancelled) {
          setBloodGroups(groups);
          setBloodComponents(components);
        }
      } catch (error) {
        console.error("Load masters error:", error);
      } finally {
        if (!cancelled) setMastersLoading(false);
      }
    }

    void loadMasters();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (rawData: RecipientRequestInput) => {
    setSubmitError(null);

    const data = normalizeRecipientForm(rawData);

    try {
      const response = await submitBloodRequest({
        recipientName: data.patientName,
        mobileNumber: data.mobileNumber,
        bloodGroupId: Number(data.bloodGroupId),
        bloodComponentId: Number(data.bloodComponentId),
        requiredUnits: Number(data.requiredUnits),
        dob: dobFromAge(Number(data.age)),
        hospitalName: data.hospitalName || undefined,
        address: data.address || undefined,
        city: data.city,
        district: data.district,
        pincode: data.pincode,
      });

      saveLastRecipientPincode(data.pincode);
      setSuccessResult(response);
    } catch (error) {
      console.error("Blood request submit error:", error);

      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to submit your request. Please try again.",
        ),
      );
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessResult(null);
    router.push("/recipient");
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className={STICKY_FORM_CLASS}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 md:gap-x-10 md:gap-y-5">
          <FormInput
            id="patientName"
            icon={UserRound}
            label={<Bilingual tKey="recipient.patientName" as="span" />}
            required
            placeholder={enterPatientName}
            maxLength={100}
            autoComplete="name"
            {...register("patientName")}
            error={errors.patientName?.message}
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

          <div className="w-full">
            <label
              htmlFor="bloodGroupId"
              className="mb-1.5 flex items-start gap-0.5 text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            >
              <Bilingual tKey="recipient.bloodGroupRequired" as="span" />
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

          <div className="w-full">
            <label
              htmlFor="bloodComponentId"
              className="mb-1.5 flex items-start gap-0.5 text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            >
              <Bilingual tKey="recipient.bloodComponentRequired" as="span" />
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Droplets
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-primary)]"
              />

              <select
                id="bloodComponentId"
                disabled={mastersLoading}
                defaultValue=""
                {...register("bloodComponentId", {
                  setValueAs: (value) => (value === "" ? "" : Number(value)),
                  onChange: (event) => {
                    setSelectedBloodComponentId(
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
                    errors.bloodComponentId
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  }
                  ${selectedBloodComponentId ? "text-[var(--color-text-body)]" : "text-[var(--color-input-placeholder)]"}
                `}
              >
                <option value="" disabled>
                  {mastersLoading ? loadingText : selectBloodComponentText}
                </option>

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
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
              />
            </div>

            {errors.bloodComponentId?.message && (
              <p role="alert" className="mt-1.5 px-1 text-[12px] leading-4 text-red-500">
                {errors.bloodComponentId.message}
              </p>
            )}
          </div>

          <FormInput
            id="requiredUnits"
            icon={Package}
            label={<Bilingual tKey="recipient.unitsRequired" as="span" />}
            required
            placeholder={enterUnitsRequired}
            inputMode="numeric"
            maxLength={3}
            autoComplete="off"
            {...register("requiredUnits", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 3);
              },
            })}
            error={errors.requiredUnits?.message}
          />

          <FormInput
            id="age"
            icon={CalendarDays}
            label={<Bilingual tKey="recipient.age" as="span" />}
            required
            placeholder={enterAge}
            inputMode="numeric"
            maxLength={3}
            autoComplete="off"
            {...register("age", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 3);
              },
            })}
            error={errors.age?.message}
          />

          <FormInput
            id="hospitalName"
            icon={Hospital}
            label={<Bilingual tKey="recipient.hospitalNameOptional" as="span" />}
            placeholder={enterHospitalName}
            maxLength={150}
            autoComplete="off"
            {...register("hospitalName")}
            error={errors.hospitalName?.message}
          />

          {/* Address, district and city are the hospital's (where the blood
              is needed), so the browser's own address autofill stays off. */}
          <FormInput
            id="address"
            icon={MapPin}
            label={<Bilingual tKey="recipient.hospitalAddressOptional" as="span" />}
            placeholder={enterHospitalAddress}
            maxLength={200}
            autoComplete="off"
            {...register("address")}
            error={errors.address?.message}
          />

          <FormInput
            id="district"
            icon={MapPinned}
            label={<Bilingual tKey="recipient.hospitalDistrict" as="span" />}
            required
            placeholder={enterHospitalDistrict}
            maxLength={100}
            autoComplete="off"
            {...register("district")}
            error={errors.district?.message}
          />

          <FormInput
            id="city"
            icon={MapPinned}
            label={<Bilingual tKey="recipient.hospitalCity" as="span" />}
            required
            placeholder={enterHospitalCity}
            maxLength={100}
            autoComplete="off"
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
            tKey="common.submit"
            enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
          />
        </StickySubmitBar>
      </form>

      <SuccessModal
        open={successResult !== null}
        title={<Bilingual tKey="recipient.requestSubmitted" as="span" />}
        description={
          successResult && (
            <>
              {successResult.matched ? (
                <span className="block">{successResult.message}</span>
              ) : (
                <Bilingual
                  tKey="recipient.noCentreMatched"
                  as="span"
                  className="block"
                />
              )}
              <Bilingual
                tKey="recipient.requestReferenceId"
                params={{ id: successResult.bloodRequestId }}
                as="span"
                className="mt-1.5 block font-semibold text-[var(--color-text-body)]"
              />
              <Bilingual
                tKey="recipient.helplineCall"
                params={{ number: HELPLINE_NUMBER }}
                as="span"
                className="mt-1.5 block font-semibold text-[var(--color-text-body)]"
              />
            </>
          )
        }
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
