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
import { getSuperAdminSession, logout } from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/services/api/client";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

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
  const enterBloodCentreName = useBilingualText(
    "bloodCentre.enterBloodCentreName",
  );
  const enterLicenseNumber = useBilingualText("bloodCentre.enterLicenseNumber");
  const selectDateOfExpiry = useBilingualText("bloodCentre.selectDateOfExpiry");
  const enterEmailAddress = useBilingualText("bloodCentre.enterEmailAddress");
  const enter6DigitOtp = useBilingualText("bloodCentre.enter6DigitOtp");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const enterPassword = useBilingualText("common.enterPassword");
  const reenterPassword = useBilingualText("common.reenterPassword");
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");
  const selectCategoryText = useBilingualText("bloodCentre.selectCategory");
  const categoryGovernmentText = useBilingualText(
    "bloodCentre.categoryGovernment",
  );
  const categoryPrivateText = useBilingualText("bloodCentre.categoryPrivate");
  const categoryCharitableText = useBilingualText(
    "bloodCentre.categoryCharitable",
  );
  const categoryRedcrossText = useBilingualText("bloodCentre.categoryRedcross");
  const verifiedText = useBilingualText("bloodCentre.verified");
  const sendingText = useBilingualText("bloodCentre.sending");
  const resendOtpText = useBilingualText("common.resend");
  const sendOtpText = useBilingualText("bloodCentre.sendOtp");
  const verifyingText = useBilingualText("bloodCentre.verifying");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultValues.category,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const resendWithSecondsText = useBilingualText(
    "bloodCentre.resendWithSeconds",
    { count: resendSeconds },
  );

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

    if (getSuperAdminSession()) {
      // A Super Admin registered this centre from their own dashboard —
      // keep them signed in and send them back there, instead of logging
      // them out into a login prompt meant for the newly registered centre.
      router.replace("/super-admin/dashboard");
      return;
    }

    // Otherwise this is a public/anonymous registration — clear any stale
    // session (e.g. a leftover Super Admin login from earlier browsing) so
    // the login screen actually prompts for the account that was just
    // registered instead of auto-redirecting into whoever was previously
    // signed in.
    logout();
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
            label={<Bilingual tKey="bloodCentre.bloodCentreName" as="span" />}
            placeholder={enterBloodCentreName}
            maxLength={100}
            autoComplete="organization"
            {...register("bloodCentreName")}
            error={errors.bloodCentreName?.message}
          />

          <FormInput
            id="licenseNumber"
            icon={FileCheck2}
            label={<Bilingual tKey="bloodCentre.licenseNumber" as="span" />}
            placeholder={enterLicenseNumber}
            maxLength={30}
            autoComplete="off"
            {...register("licenseNumber")}
            error={errors.licenseNumber?.message}
          />

          <div className="w-full">
            <Bilingual
              tKey="bloodCentre.category"
              as="label"
              className="
                mb-1.5
                block
                text-[13px]
                font-medium
                leading-4
                text-[var(--color-text-body)]
              "
            />

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
                  {selectCategoryText}
                </option>

                {/* Options */}
                <option
                  value="Government"
                  className="text-[var(--color-text-body)]"
                >
                  {categoryGovernmentText}
                </option>

                <option
                  value="Private"
                  className="text-[var(--color-text-body)]"
                >
                  {categoryPrivateText}
                </option>

                <option
                  value="Charitable"
                  className="text-[var(--color-text-body)]"
                >
                  {categoryCharitableText}
                </option>

                <option
                  value="Redcross"
                  className="text-[var(--color-text-body)]"
                >
                  {categoryRedcrossText}
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
            label={<Bilingual tKey="bloodCentre.dateOfExpiry" as="span" />}
            placeholder={selectDateOfExpiry}
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
              label={<Bilingual tKey="common.email" as="span" />}
              placeholder={enterEmailAddress}
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
                    {verifiedText}
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
                      px-2
                      py-1
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
                    {otpStatus === "sending"
                      ? sendingText
                      : otpStatus === "sent"
                        ? resendSeconds > 0
                          ? resendWithSecondsText
                          : resendOtpText
                        : sendOtpText}
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
                  placeholder={enter6DigitOtp}
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
                  {otpStatus === "verifying" ? (
                    verifyingText
                  ) : (
                    <BilingualInline
                      tKey="common.verify"
                      enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
                    />
                  )}
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

          <FormInput
            id="password"
            icon={LockKeyhole}
            label={<Bilingual tKey="common.password" as="span" />}
            placeholder={enterPassword}
            type="password"
            maxLength={64}
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />

          <FormInput
            id="confirmPassword"
            icon={LockKeyhole}
            label={<Bilingual tKey="common.confirmPassword" as="span" />}
            placeholder={reenterPassword}
            type="password"
            maxLength={64}
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <FormInput
            id="address"
            icon={MapPin}
            label={<Bilingual tKey="common.address" as="span" />}
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
            id="pinCode"
            icon={MapPinned}
            label={<Bilingual tKey="common.pinCode" as="span" />}
            placeholder={enter6DigitPinCode}
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
              <BilingualInline
                tKey="common.register"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
              />
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
