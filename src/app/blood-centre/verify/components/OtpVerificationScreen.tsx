"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import {
  resendOtp,
  verifyOtp,
} from "@/services/bloodCenter/bloodCenter.service";
import { normalizeIndianMobile } from "@/utils/mobile";
import { OtpVerificationSuccessModal } from "./OtpVerificationSuccessModal";

export function OtpVerificationScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mobile = searchParams.get("mobile") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [seconds]);

  const onOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const digit = digits.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");

    if (index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const onOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Verify OTP
  const submit = async () => {
    const value = otp.join("");

    if (!/^\d{6}$/.test(value)) {
      setError("Enter the 6-digit OTP");
      return;
    }

    if (!mobile) {
      setError("Mobile number is missing. Please register again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await verifyOtp({
        mobileNumber: normalizeIndianMobile(mobile),
        otp: value,
      });

      if (!response?.success) {
        setError(response.message || "Unable to verify OTP.");
        return;
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Verify OTP error:", error);

      setError(
        error instanceof Error
          ? error?.message
          : "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (seconds > 0 || resendLoading) {
      return;
    }

    if (!mobile) {
      setError("Mobile number is missing. Please register again.");
      return;
    }

    setError("");
    setResendLoading(true);

    try {
      const response = await resendOtp(normalizeIndianMobile(mobile));

      if (!response.success) {
        setError(response.message || "Unable to resend OTP.");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setSeconds(30);

      document.getElementById("otp-0")?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to resend OTP.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Success → Login
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);

    router.replace("/blood-centre/login");
  };

  return (
    <>
      <ScreenShell>
        <BrandHeader
          title="Verify Mobile Number"
          showBackButton
          backHref="/blood-centre/register"
        />

        <main className="w-full bg-white">
          <section
            className="
              mx-auto
              flex
              min-h-[520px]
              w-full
              flex-col
              items-center
              px-5
              pb-10
              pt-9
              md:max-w-[850px]
              md:px-10
              md:pt-12
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[var(--color-icon-bg-soft)]
                shadow-sm
              "
            >
              <MessageSquare
                size={30}
                strokeWidth={1.5}
                className="text-[var(--color-primary)]"
              />
            </div>

            <h1
              className="
                mt-5
                text-center
                text-[18px]
                font-semibold
                text-[var(--color-text-primary)]
                md:text-[22px]
              "
            >
              Verify your mobile number
            </h1>

            <p
              className="
                mt-2
                max-w-[300px]
                text-center
                text-[13px]
                leading-5
                text-[var(--color-text-placeholder-alt)]
                md:text-[14px]
              "
            >
              We just sent a verification code to your phone number
            </p>

            {mobile && (
              <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                {mobile}
              </p>
            )}

            <p className="mt-6 text-[13px] font-medium text-[var(--color-text-body)]">
              Enter your OTP code here
            </p>

            <div className="mt-3 flex gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  onChange={(event) => onOtpChange(index, event.target.value)}
                  onKeyDown={(event) => onOtpKeyDown(index, event)}
                  className="
                    h-11
                    w-11
                    rounded-lg
                    border
                    border-[var(--color-border)]
                    bg-white
                    text-center
                    text-[16px]
                    font-semibold
                    outline-none
                    transition-all
                    duration-200
                    hover:border-[#c7c7c7]
                    focus:border-[var(--color-primary)]
                    focus:ring-2
                    focus:ring-[var(--color-primary)]/20
                    md:h-12
                    md:w-12
                    md:text-[18px]
                  "
                />
              ))}
            </div>

            {error && (
              <p
                role="alert"
                className="
                  mt-2
                  text-center
                  text-[12px]
                  leading-4
                  text-red-500
                "
              >
                {error}
              </p>
            )}

            <div className="mt-4 text-center text-[13px] text-[var(--color-text-secondary)]">
              Didn&apos;t receive the OTP?{" "}
              <button
                type="button"
                disabled={seconds > 0 || resendLoading}
                onClick={handleResendOtp}
                className="
                  font-medium
                  text-[var(--color-primary)]
                  disabled:cursor-not-allowed
                  disabled:text-[var(--color-text-placeholder)]
                "
              >
                {resendLoading ? "Sending..." : "Resend OTP"}

                {!resendLoading && seconds > 0 && ` (${seconds}s)`}
              </button>
            </div>

            <div className="mt-10 flex w-full justify-center">
              <div className="w-full max-w-[320px] md:max-w-[300px]">
                <AppButton type="button" loading={loading} onClick={submit}>
                  Verify OTP
                </AppButton>
              </div>
            </div>
          </section>
        </main>
      </ScreenShell>

      <OtpVerificationSuccessModal
        open={showSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
