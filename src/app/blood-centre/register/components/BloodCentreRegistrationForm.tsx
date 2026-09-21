"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
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
  BloodCentreCategory,
  BloodCentreRegistrationInput,
  BloodCentreRegistrationPayload,
} from "@/types/bloodCenter/bloodCenterTypes";
import {
  registerBloodCentre,
  resendOtp,
  sendOtp,
  verifyOtp,
} from "@/services/bloodCenter/bloodCenter.service";
import { getApiErrorMessage } from "@/services/api/client";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";

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

type OtpStatus = "idle" | "sending" | "sent" | "verifying" | "verified";

export function BloodCentreRegistrationForm() {
  const router = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultValues.category,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BloodCentreRegistrationInput>({
    resolver: zodResolver(
      bloodCentreRegistrationSchema,
    ) as Resolver<BloodCentreRegistrationInput>,

    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (otpStatus !== "sent" || resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpStatus, resendSeconds]);

  const resetOtpState = () => {
    if (otpStatus === "idle") return;
    setOtpStatus("idle");
    setOtpValue("");
    setOtpError("");
    setResendSeconds(0);
  };

  const handleSendOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    const email = getValues("email").trim().toLowerCase();

    setOtpError("");
    setOtpStatus("sending");

    try {
      await sendOtp({ email });

      setOtpValue("");
      setOtpStatus("sent");
      setResendSeconds(30);
    } catch (error) {
      console.error("Blood Centre send OTP error:", error);

      setOtpError(
        getApiErrorMessage(error, "Unable to send OTP. Please try again."),
      );
      setOtpStatus("idle");
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || otpStatus === "sending") return;

    const email = getValues("email").trim().toLowerCase();

    setOtpError("");
    setOtpStatus("sending");

    try {
      await resendOtp(email);

      setOtpValue("");
      setOtpStatus("sent");
      setResendSeconds(30);
    } catch (error) {
      console.error("Blood Centre resend OTP error:", error);

      setOtpError(
        getApiErrorMessage(error, "Unable to resend OTP. Please try again."),
      );
      setOtpStatus("sent");
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }

    setOtpError("");
    setOtpStatus("verifying");

    try {
      const email = getValues("email").trim().toLowerCase();
      await verifyOtp({ email, otp: otpValue });

      setOtpStatus("verified");
    } catch (error) {
      console.error("Blood Centre verify OTP error:", error);

      setOtpError(getApiErrorMessage(error, "Invalid OTP. Please try again."));
      setOtpStatus("sent");
    }
  };

  const onSubmit = async (rawData: BloodCentreRegistrationInput) => {
    setSubmitError(null);

    if (otpStatus !== "verified") {
      setSubmitError(
        "Please verify your email address with the OTP before registering.",
      );
      return;
    }

    const data = normalizeBloodCentreForm(rawData);

    const payload: BloodCentreRegistrationPayload = {
      bloodCentreName: data.bloodCentreName,
      bloodBankCategory: data.category as BloodCentreCategory,
      bloodCentreLicenceNumber: data.licenseNumber,
      licenceExpiryDate: data.dateOfExpiry,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
      address: data.address,
      district: data.district,
      city: data.city,
      pincode: data.pinCode,
    };

    try {
      await registerBloodCentre(payload);

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Blood Centre registration error:", error);

      setSubmitError(
        getApiErrorMessage(error, "Unable to register. Please try again."),
      );
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.replace("/blood-centre/login");
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div
          className="
            grid
            grid-cols-1
            gap-x-8
            gap-y-5
            md:grid-cols-2
            md:gap-x-10
            md:gap-y-5
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
                text-[13px]
                font-medium
                leading-4
                text-[var(--color-text-body)]
              "
            >
              Category
            </label>

            <div className="relative">
              <Tags
                size={18}
                strokeWidth={1.5}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
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
                    errors.category
                      ? `
                        border-red-400
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-500/10
                      `
                      : `
                        border-[var(--color-border)]
                        hover:border-[#c7c7c7]
                        focus:border-[var(--color-primary)]
                        focus:ring-2
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
                  mt-1.5
                  px-1
                  text-[12px]
                  leading-4
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

          <div className="w-full">
            <FormInput
              id="email"
              icon={Mail}
              label="Email Address"
              placeholder="Enter email address"
              type="email"
              maxLength={254}
              inputMode="email"
              autoComplete="email"
              readOnly={otpStatus === "verified"}
              {...register("email", { onChange: resetOtpState })}
              error={errors.email?.message}
              rightElement={
                otpStatus === "verified" ? (
                  <span className="flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--color-success)]">
                    <CheckCircle2 size={15} strokeWidth={2} />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={
                      otpStatus === "sent" ? handleResendOtp : handleSendOtp
                    }
                    disabled={
                      otpStatus === "sending" ||
                      (otpStatus === "sent" && resendSeconds > 0)
                    }
                    className="
                      whitespace-nowrap
                      rounded-md
                      bg-[var(--color-primary)]
                      px-2.5
                      py-1.5
                      text-[12px]
                      font-semibold
                      text-white
                      transition-colors
                      duration-200
                      hover:bg-[var(--color-primary-hover)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {otpStatus === "sending"
                      ? "Sending..."
                      : otpStatus === "sent"
                        ? resendSeconds > 0
                          ? `Resend (${resendSeconds}s)`
                          : "Resend OTP"
                        : "Send OTP"}
                  </button>
                )
              }
            />

            {(otpStatus === "sent" || otpStatus === "verifying") && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpValue}
                  onChange={(event) => {
                    setOtpValue(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    );
                    if (otpError) setOtpError("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="
                    h-10
                    w-full
                    min-w-0
                    flex-1
                    rounded-lg
                    border
                    border-[var(--color-border)]
                    bg-white
                    px-3.5
                    text-[14px]
                    text-[var(--color-text-body)]
                    outline-none
                    transition-all
                    duration-200
                    placeholder:text-[var(--color-input-placeholder)]
                    hover:border-[#c7c7c7]
                    focus:border-[var(--color-primary)]
                    focus:ring-2
                    focus:ring-[var(--color-primary)]/15
                  "
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpStatus === "verifying"}
                  className="
                    h-10
                    shrink-0
                    rounded-lg
                    bg-[var(--color-primary)]
                    px-4
                    text-[13px]
                    font-semibold
                    text-white
                    transition-colors
                    duration-200
                    hover:bg-[var(--color-primary-hover)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {otpStatus === "verifying" ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}

            {otpError && (
              <p
                role="alert"
                className="mt-1.5 px-1 text-[12px] leading-4 text-red-500"
              >
                {otpError}
              </p>
            )}
          </div>

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
              mt-5
              w-full
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-[13px]
              leading-5
              text-red-600
              md:max-w-[500px]
            "
          >
            {submitError}
          </div>
        )}

        <div
          className="
            mt-7
            flex
            w-full
            justify-center
          "
        >
          <div
            className="
              w-full
              md:w-[240px]
            "
          >
            <AppButton
              type="submit"
              loading={isSubmitting}
              disabled={otpStatus !== "verified"}
            >
              Register
            </AppButton>
          </div>
        </div>
      </form>

      <RegistrationSuccessModal
        open={showSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
