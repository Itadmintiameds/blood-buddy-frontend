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

import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import {
  normalizeRecipientForm,
  recipientRequestSchema,
} from "@/schema/recipient/recipientRequestSchema";
import type { RecipientRequestInput } from "@/types/recipient/receipientTypes";
import { submitBloodRequest } from "@/services/recipient/recipientRequestService";
import { saveLastRecipientPincode } from "@/services/recipient/recipientSessionStorage";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
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
  const selectBloodTypeText = useBilingualText("recipient.selectBloodType");
  const enterUnitsRequired = useBilingualText("recipient.enterUnitsRequired");
  const enterHospitalName = useBilingualText("recipient.enterHospitalName");
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [bloodComponents, setBloodComponents] = useState<
    MasterBloodComponent[]
  >([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues: RecipientRequestInput = {
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

  const [selectedBloodGroupId, setSelectedBloodGroupId] = useState<
    number | ""
  >("");
  const [selectedBloodComponentId, setSelectedBloodComponentId] = useState<
    number | ""
  >("");

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
        dob: data.dob,
        hospitalName: data.hospitalName || undefined,
        address: data.address || undefined,
        city: data.city,
        district: data.district,
        pincode: data.pincode,
      });

      saveLastRecipientPincode(data.pincode);
      setSuccessMessage(response.message);
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
    setSuccessMessage(null);
    router.push("/recipient");
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 md:gap-x-10 md:gap-y-5">
          <FormInput
            id="patientName"
            icon={UserRound}
            label={<Bilingual tKey="recipient.patientName" as="span" />}
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
            <Bilingual
              tKey="recipient.bloodGroupRequired"
              as="label"
              htmlFor="bloodGroupId"
              className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            />

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
                      : "border-[var(--color-border)] hover:border-[#c7c7c7] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
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
            <Bilingual
              tKey="recipient.bloodTypeRequired"
              as="label"
              htmlFor="bloodComponentId"
              className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
            />

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
                      : "border-[var(--color-border)] hover:border-[#c7c7c7] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  }
                  ${selectedBloodComponentId ? "text-[var(--color-text-body)]" : "text-[var(--color-input-placeholder)]"}
                `}
              >
                <option value="" disabled>
                  {mastersLoading ? loadingText : selectBloodTypeText}
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
            id="dob"
            icon={CalendarDays}
            label={<Bilingual tKey="donor.dateOfBirth" as="span" />}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            autoComplete="bday"
            {...register("dob")}
            error={errors.dob?.message}
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

        <div className="mt-7 flex w-full justify-center">
          <div className="w-full md:w-[240px]">
            <AppButton type="submit" loading={isSubmitting}>
              <BilingualInline
                tKey="common.submit"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
              />
            </AppButton>
          </div>
        </div>
      </form>

      <SuccessModal
        open={Boolean(successMessage)}
        title={<Bilingual tKey="recipient.requestSubmitted" as="span" />}
        description={successMessage ?? undefined}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
