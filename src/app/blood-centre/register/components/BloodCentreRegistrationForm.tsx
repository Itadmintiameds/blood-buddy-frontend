"use client";

import { useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  FileCheck2,
  LockKeyhole,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Tags,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import {
  bloodCentreRegistrationSchema,
  normalizeBloodCentreForm,
} from "@/schema/bloodCenter/registrationSchema";
import type {
  BloodCentreRegistrationInput,
  BloodCentreRegistrationPayload,
} from "@/types/bloodCenter/bloodCenterTypes";
import {
  registerBloodCentre,
  sendOtp,
} from "@/services/bloodCenter/bloodCenter.service";
import { getApiErrorMessage } from "@/services/api/client";
import { normalizeIndianMobile } from "@/utils/mobile";

const defaultValues: BloodCentreRegistrationInput = {
  bloodCentreName: "",
  licenseNumber: "",
  category: "",
  dateOfExpiry: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  address: "",
  district: "",
  city: "",
  pinCode: "",
};

export function BloodCentreRegistrationForm() {
  const router = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultValues.category,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BloodCentreRegistrationInput>({
    resolver: zodResolver(
      bloodCentreRegistrationSchema,
    ) as Resolver<BloodCentreRegistrationInput>,

    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
  });

  const onSubmit = async (rawData: BloodCentreRegistrationInput) => {
    setSubmitError(null);

    const data = normalizeBloodCentreForm(rawData);

    const payload: BloodCentreRegistrationPayload = {
      bloodCentreName: data?.bloodCentreName,
      licenseNumber: data?.licenseNumber,
      category: data?.category as
        | "Government"
        | "Private"
        | "Charitable"
        | "Redcross",
      dateOfExpiry: data?.dateOfExpiry,
      email: data?.email,
      mobileNumber: data?.mobileNumber,
      password: data?.password,
      confirmPassword: data?.confirmPassword,
      address: data?.address,
      district: data?.district,
      city: data?.city,
      pincode: data?.pinCode,
    };

    try {
      const registrationResponse = await registerBloodCentre(payload);

      if (registrationResponse?.success !== true) {
        throw new Error(
          registrationResponse?.message ||
            "Registration failed. Please try again.",
        );
      }

      const otpResponse = await sendOtp({
        mobileNumber: normalizeIndianMobile(data?.mobileNumber),
      });

      if (otpResponse?.success !== true) {
        throw new Error(
          otpResponse?.message || "Unable to send OTP. Please try again.",
        );
      }

      sessionStorage.setItem("bloodCentreMobile", data?.mobileNumber);
      router.push(
        `/blood-centre/verify?mobile=${encodeURIComponent(data?.mobileNumber)}`,
      );
    } catch (error) {
      console.error("Blood Centre Registration / OTP Error:", error);

      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to complete registration. Please try again.",
        ),
      );
    }
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div
          className="
            grid
            grid-cols-1
            gap-x-8
            gap-y-4
            md:grid-cols-2
            md:gap-x-10
            md:gap-y-4
          "
        >
          <FormInput
            id="bloodCentreName"
            icon={Building2}
            label="Blood Centre Name"
            placeholder="Enter blood centre name"
            maxLength={100}
            autoComplete="organization"
            {...register("bloodCentreName")}
            error={errors.bloodCentreName?.message}
          />

          <FormInput
            id="licenseNumber"
            icon={FileCheck2}
            label="License Number"
            placeholder="Enter license number"
            maxLength={30}
            autoComplete="off"
            {...register("licenseNumber")}
            error={errors.licenseNumber?.message}
          />

          <div className="w-full">
            <label
              htmlFor="category"
              className="
                mb-1.5
                block
                text-[12px]
                font-medium
                leading-4
                text-[var(--color-text-body)]
              "
            >
              Category
            </label>

            <div className="relative">
              <Tags
                size={17}
                strokeWidth={1.5}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-[var(--color-primary)]
                "
              />

              {/* Category Select */}

              <select
                id="category"
                defaultValue=""
                {...register("category", {
                  onChange: (event) => {
                    setSelectedCategory(event.target.value);
                  },
                })}
                className={`
                  h-[38px]
                  w-full
                  appearance-none
                  rounded-[6px]
                  border
                  bg-[var(--color-white)]
                  pl-10
                  pr-10
                  text-[12px]
                  font-normal
                  outline-none
                  transition-all
                  duration-200

                  ${
                    errors.category
                      ? `
                        border-red-400
                        focus:border-red-500
                        focus:ring-1
                        focus:ring-red-500/10
                      `
                      : `
                        border-[var(--color-border)]
                        focus:border-[var(--color-primary)]
                        focus:ring-1
                        focus:ring-[var(--color-primary)]/15
                      `
                  }

                  ${
                    selectedCategory
                      ? "text-[var(--color-text-body)]"
                      : "text-[var(--color-input-placeholder)]"
                  }
                `}
              >
                {/* Placeholder */}
                <option
                  value=""
                  disabled
                  className="text-[var(--color-input-placeholder)]"
                >
                  Select category
                </option>

                {/* Options */}
                <option
                  value="Government"
                  className="text-[var(--color-text-body)]"
                >
                  Government
                </option>

                <option
                  value="Private"
                  className="text-[var(--color-text-body)]"
                >
                  Private
                </option>

                <option
                  value="Charitable"
                  className="text-[var(--color-text-body)]"
                >
                  Charitable
                </option>

                <option
                  value="Redcross"
                  className="text-[var(--color-text-body)]"
                >
                  Redcross
                </option>
              </select>

              {/* Custom Dropdown Arrow */}
              <ChevronDown
                size={17}
                strokeWidth={1.8}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[var(--color-primary)]
                "
              />
            </div>

            {/* Category Error */}
            {errors.category?.message && (
              <p
                role="alert"
                className="
                  mt-1
                  px-1
                  text-[10px]
                  leading-3
                  text-red-500
                "
              >
                {errors.category.message}
              </p>
            )}
          </div>

          <FormInput
            id="dateOfExpiry"
            icon={CalendarDays}
            label="Date of Expiry"
            placeholder="Select date of expiry"
            type="date"
            typeof=""
            autoComplete="off"
            {...register("dateOfExpiry")}
            error={errors.dateOfExpiry?.message}
          />

          <FormInput
            id="email"
            icon={Mail}
            label="Email Address"
            placeholder="Enter email address"
            type="email"
            maxLength={254}
            inputMode="email"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
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
            label="Address"
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
            id="pinCode"
            icon={MapPinned}
            label="Pin Code"
            placeholder="Enter 6-digit pin code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            {...register("pinCode", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);
              },
            })}
            error={errors.pinCode?.message}
          />
        </div>

        {submitError && (
          <div
            role="alert"
            className="
              mx-auto
              mt-4
              w-full
              rounded-md
              border
              border-red-200
              bg-red-50
              px-3
              py-2
              text-[11px]
              leading-4
              text-red-600
              md:max-w-[500px]
            "
          >
            {submitError}
          </div>
        )}

        <div
          className="
            mt-[22px]
            flex
            w-full
            justify-center
          "
        >
          <div
            className="
              w-full
              md:w-[220px]
            "
          >
            <AppButton type="submit" loading={isSubmitting}>
              Send OTP
            </AppButton>
          </div>
        </div>
      </form>
    </>
  );
}
