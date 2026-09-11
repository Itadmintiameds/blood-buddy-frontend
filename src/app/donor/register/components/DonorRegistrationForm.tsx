"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Droplets,
  LockKeyhole,
  MapPin,
  MapPinned,
  Phone,
  UserRound,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import {
  donorRegistrationSchema,
  normalizeDonorForm,
} from "@/schema/donor/donorRegistrationSchema";
import type { DonorRegistrationInput } from "@/types/donor/donorTypes";
import { registerDonor } from "@/services/donor/donorRegistrationService";
import { savePendingDonorRegistration } from "@/services/donor/donorSessionStorage";
import { getBloodGroups } from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import type { MasterBloodGroup } from "@/types/master.types";

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
  password: "",
  confirmPassword: "",
};

export function DonorRegistrationForm() {
  const router = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [selectedBloodGroupId, setSelectedBloodGroupId] = useState<
    number | ""
  >("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorRegistrationInput>({
    resolver: zodResolver(
      donorRegistrationSchema,
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

      // Backend has no password field for donors — kept locally only so the
      // stubbed donor login can authenticate against it (see
      // donorSessionStorage.ts).
      savePendingDonorRegistration({
        ...data,
        bloodDonorDetailsId: response.bloodDonorDetailsId,
      });

      router.push(
        `/donor/verify?mobile=${encodeURIComponent(data.mobileNumber)}`,
      );
    } catch (error) {
      console.error("Donor registration error:", error);

      setSubmitError(
        getApiErrorMessage(error, "Unable to register. Please try again."),
      );
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 md:gap-x-10 md:gap-y-5">
        <FormInput
          id="fullName"
          icon={UserRound}
          label="Full Name"
          placeholder="Enter your full name"
          maxLength={100}
          autoComplete="name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <FormInput
          id="mobileNumber"
          icon={Phone}
          label="Mobile Number"
          placeholder="Enter 10-digit mobile number"
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
          label="Alternate Mobile Number (Optional)"
          placeholder="Enter alternate mobile number"
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
          label="Date of Birth"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          autoComplete="bday"
          {...register("dob")}
          error={errors.dob?.message}
        />

        <div className="w-full">
          <label
            htmlFor="bloodGroupId"
            className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]"
          >
            Blood Group
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
                    : "border-[var(--color-border)] hover:border-[#c7c7c7] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                }
                ${selectedBloodGroupId ? "text-[var(--color-text-body)]" : "text-[var(--color-input-placeholder)]"}
              `}
            >
              <option value="" disabled>
                {mastersLoading ? "Loading..." : "Select blood group"}
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
          id="password"
          icon={LockKeyhole}
          label="Password"
          placeholder="Enter password"
          type="password"
          maxLength={64}
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <FormInput
          id="confirmPassword"
          icon={LockKeyhole}
          label="Confirm Password"
          placeholder="Re-enter password"
          type="password"
          maxLength={64}
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <FormInput
          id="address"
          icon={MapPin}
          label="Address (Optional)"
          placeholder="Enter address"
          maxLength={200}
          autoComplete="street-address"
          {...register("address")}
          error={errors.address?.message}
        />

        <FormInput
          id="district"
          icon={MapPinned}
          label="District"
          placeholder="Enter district"
          maxLength={100}
          autoComplete="address-level2"
          {...register("district")}
          error={errors.district?.message}
        />

        <FormInput
          id="city"
          icon={MapPinned}
          label="City"
          placeholder="Enter city"
          maxLength={100}
          autoComplete="address-level2"
          {...register("city")}
          error={errors.city?.message}
        />

        <FormInput
          id="pincode"
          icon={MapPinned}
          label="Pin Code"
          placeholder="Enter 6-digit pin code"
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
          label="Last Blood Donation Date (Optional)"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          {...register("lastBloodDonationDate")}
          error={errors.lastBloodDonationDate?.message}
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
            Register
          </AppButton>
        </div>
      </div>
    </form>
  );
}
