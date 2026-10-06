"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  Link2,
  LockKeyhole,
  Mail,
  MapPin,
  MapPinned,
  Phone,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  STICKY_FORM_CLASS,
  StickySubmitBar,
} from "@/app/components/ui/StickySubmitBar";
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
  dateOfExpiry: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  address: "",
  district: "",
  city: "",
  pinCode: "",
  latitude: "",
  longitude: "",
  locationUrl: "",
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
  const enterLatitude = useBilingualText("bloodCentre.enterLatitude");
  const enterLongitude = useBilingualText("bloodCentre.enterLongitude");
  const enterLocationUrl = useBilingualText("bloodCentre.enterLocationUrl");
  const verifiedText = useBilingualText("bloodCentre.verified");
  const sendingText = useBilingualText("bloodCentre.sending");
  const resendOtpText = useBilingualText("common.resend");
  const sendOtpText = useBilingualText("bloodCentre.sendOtp");
  const verifyingText = useBilingualText("bloodCentre.verifying");

  const [submitError, setSubmitError] = useState<string | null>(null);
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
    formState: { errors, isSubmitting, isValid },
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
      bloodCentreLicenceNumber: data.licenseNumber,
      licenceExpiryDate: data.dateOfExpiry,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
      address: data.address,
      district: data.district,
      city: data.city,
      pincode: data.pinCode,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      locationUrl: data.locationUrl,
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
      <form noValidate onSubmit={handleSubmit(onSubmit)} className={STICKY_FORM_CLASS}>
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
            required
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
            required
            placeholder={enterLicenseNumber}
            maxLength={30}
            autoComplete="off"
            {...register("licenseNumber")}
            error={errors.licenseNumber?.message}
          />

          <FormInput
            id="dateOfExpiry"
            icon={CalendarDays}
            label={<Bilingual tKey="bloodCentre.dateOfExpiry" as="span" />}
            required
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
              required
              placeholder={enterEmailAddress}
              type="email"
              maxLength={254}
              inputMode="email"
              autoComplete="email"
              readOnly={otpStatus === "verified"}
              {...register("email", { onChange: resetOtpState })}
              error={errors.email?.message}
              rightElement={
                <div className="hidden sm:flex">
                  {otpStatus === "verified" ? (
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
                        px-2.5
                        py-1.5
                        text-[12px]
                        font-semibold
                        sm:text-[13px]
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
                  )}
                </div>
              }
            />

            {/* No room for the OTP control inside the field on a phone: it sits
                under the field instead (see rightElement above for sm+). */}
            {otpStatus === "verified" && (
              <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-success)] sm:hidden">
                <CheckCircle2 size={16} strokeWidth={2} />
                {verifiedText}
              </div>
            )}

            {(otpStatus === "idle" || otpStatus === "sending") && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpStatus === "sending"}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-white transition-colors duration-200 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
              >
                {otpStatus === "sending" ? sendingText : sendOtpText}
              </button>
            )}

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
                  autoComplete="one-time-code"
                  className="
                    h-11
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
                    hover:border-[var(--color-border)]
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
                    h-11
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

            {(otpStatus === "sent" || otpStatus === "verifying") && (
              <div className="mt-1 flex justify-end sm:hidden">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendSeconds > 0 || otpStatus === "verifying"}
                  className="min-h-10 px-2 text-[14px]! text-[var(--color-primary)] disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
                >
                  {resendSeconds > 0 ? resendWithSecondsText : resendOtpText}
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
            id="password"
            icon={LockKeyhole}
            label={<Bilingual tKey="common.password" as="span" />}
            required
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
            required
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
            required
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
            id="pinCode"
            icon={MapPinned}
            label={<Bilingual tKey="common.pinCode" as="span" />}
            required
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

          <FormInput
            id="latitude"
            icon={MapPin}
            label={<Bilingual tKey="bloodCentre.latitude" as="span" />}
            placeholder={enterLatitude}
            inputMode="decimal"
            autoComplete="off"
            {...register("latitude")}
            error={errors.latitude?.message}
          />

          <FormInput
            id="longitude"
            icon={MapPin}
            label={<Bilingual tKey="bloodCentre.longitude" as="span" />}
            placeholder={enterLongitude}
            inputMode="decimal"
            autoComplete="off"
            {...register("longitude")}
            error={errors.longitude?.message}
          />

          <div className="md:col-span-2">
            <FormInput
              id="locationUrl"
              icon={Link2}
              label={<Bilingual tKey="bloodCentre.locationUrl" as="span" />}
              required
              placeholder={enterLocationUrl}
              autoComplete="off"
              {...register("locationUrl")}
              error={errors.locationUrl?.message}
            />
          </div>
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

        <StickySubmitBar
          ready={isValid && otpStatus === "verified"}
          loading={isSubmitting}
        >
          <BilingualInline
            tKey="common.register"
            enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
          />
        </StickySubmitBar>
      </form>

      <RegistrationSuccessModal
        open={showSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
