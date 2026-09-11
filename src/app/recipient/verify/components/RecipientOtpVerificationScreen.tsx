"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import {
  sendRecipientOtp,
  verifyRecipientOtp,
} from "@/services/recipient/recipientOtpService";
import { saveRecipientSession } from "@/services/recipient/recipientSessionStorage";

export function RecipientOtpVerificationScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mobileNumber = searchParams.get("mobile") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = window.setInterval(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
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
    setPoppedIndex(index);

    if (index < 5) {
      document.getElementById(`recipient-otp-${index + 1}`)?.focus();
    }
  };

  const onOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`recipient-otp-${index - 1}`)?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      document.getElementById(`recipient-otp-${index - 1}`)?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      document.getElementById(`recipient-otp-${index + 1}`)?.focus();
    }
  };

  // STUB — the backend has no mobile-OTP endpoint for recipients yet, so any
  // 6-digit code is accepted (see recipientOtpService.ts).
  const submit = async () => {
    const value = otp.join("");

    if (!/^\d{6}$/.test(value)) {
      setError("Enter the 6-digit OTP");
      return;
    }

    if (!mobileNumber) {
      setError("Mobile number is missing. Please start again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const verified = await verifyRecipientOtp(value);

      if (!verified) {
        throw new Error("Invalid OTP. Please try again.");
      }

      saveRecipientSession(mobileNumber);

      router.replace(
        `/recipient/register?mobile=${encodeURIComponent(mobileNumber)}`,
      );
    } catch (submitError) {
      console.error("Recipient OTP verify error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (seconds > 0 || resendLoading) return;

    setError("");
    setResendLoading(true);

    try {
      await sendRecipientOtp(mobileNumber);

      setOtp(["", "", "", "", "", ""]);
      setSeconds(30);

      document.getElementById("recipient-otp-0")?.focus();
    } catch (resendErr) {
      console.error("Recipient resend OTP error:", resendErr);
      setError("Unable to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScreenShell>
      <BrandHeader
        title="Verify Mobile Number"
        showBackButton
        backHref="/recipient"
      />

      <main className="w-full bg-white">
        <section className="mx-auto flex min-h-[520px] w-full flex-col items-center px-5 pb-10 pt-9 md:max-w-[850px] md:px-10 md:pt-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)] shadow-sm">
            <MessageSquare
              size={30}
              strokeWidth={1.5}
              className="text-[var(--color-primary)]"
            />
          </div>

          <h1 className="mt-5 text-center text-[18px] font-semibold text-[var(--color-text-primary)] md:text-[22px]">
            Verify your mobile number
          </h1>

          <p className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[var(--color-text-placeholder-alt)] md:text-[14px]">
            We just sent you a verification code to your mobile number
          </p>

          {mobileNumber && (
            <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
              +91 {mobileNumber}
            </p>
          )}

          <p className="mt-6 text-[13px] font-medium text-[var(--color-text-body)]">
            Enter your OTP code here
          </p>

          <div className="mt-3 flex gap-2 md:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`recipient-otp-${index}`}
                value={digit}
                type="text"
                maxLength={1}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                onChange={(event) => onOtpChange(index, event.target.value)}
                onKeyDown={(event) => onOtpKeyDown(index, event)}
                onAnimationEnd={() =>
                  setPoppedIndex((current) => (current === index ? null : current))
                }
                className={`
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
                  ${poppedIndex === index ? "animate-otp-pop" : ""}
                `}
              />
            ))}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-center text-[12px] leading-4 text-red-500">
              {error}
            </p>
          )}

          <div className="mt-4 text-center text-[13px] text-[var(--color-text-secondary)]">
            Didn&apos;t receive the OTP?{" "}
            <button
              type="button"
              disabled={seconds > 0 || resendLoading}
              onClick={handleResendOtp}
              className="font-medium text-[var(--color-primary)] disabled:cursor-not-allowed disabled:text-[var(--color-text-placeholder)]"
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
  );
}
