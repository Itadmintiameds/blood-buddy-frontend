"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import {
  forgotPassword,
  resetPassword,
} from "@/services/bloodCenter/bloodCenter.service";
import { logout } from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/services/api/client";
import { ResetPasswordSuccessModal } from "./ResetPasswordSuccessModal";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

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
    setPoppedIndex(index);

    if (index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const onOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const submit = async () => {
    if (loading) {
      return;
    }

    const otpValue = otp.join("");

    setError("");

    if (!email) {
      setError("Email is missing. Please restart the forgot password flow.");
      return;
    }

    if (!/^\d{6}$/.test(otpValue)) {
      setError("Enter the 6-digit OTP");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, otp: otpValue, newPassword });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(getApiErrorMessage(error, "Unable to reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (seconds > 0 || resendLoading) {
      return;
    }

    if (!email) {
      setError("Email is missing. Please restart the forgot password flow.");
      return;
    }

    setError("");
    setResendLoading(true);

    try {
      await forgotPassword({ email });

      setOtp(["", "", "", "", "", ""]);
      setSeconds(30);

      document.getElementById("reset-otp-0")?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(getApiErrorMessage(error, "Unable to resend OTP."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);

    // Clear any stale session so the login screen prompts fresh instead of
    // auto-redirecting into whoever was previously signed in.
    logout();
    router.replace("/blood-centre/login");
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);

    if (error) {
      setError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (error) {
      setError("");
    }
  };

  return (
    <>
      <ScreenShell>
        <BrandHeader
          title="Reset Password"
          showBackButton
          backHref="/blood-centre/forgot-password"
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
              <LockKeyhole
                size={26}
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
              Reset your password
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
              Enter the OTP sent to your email and choose a new password
            </p>

            {email && (
              <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                {email}
              </p>
            )}

            <p className="mt-6 text-[13px] font-medium text-[var(--color-text-body)]">
              Enter your OTP code here
            </p>

            <div className="mt-3 flex w-full max-w-[320px] justify-center gap-2 md:max-w-[360px] md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  value={digit}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  onChange={(event) => onOtpChange(index, event.target.value)}
                  onKeyDown={(event) => onOtpKeyDown(index, event)}
                  onAnimationEnd={() =>
                    setPoppedIndex((current) =>
                      current === index ? null : current,
                    )
                  }
                  className={`
                    aspect-square
                    min-w-0
                    max-w-[44px]
                    flex-1
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
                    md:max-w-[48px]
                    md:text-[18px]
                    ${poppedIndex === index ? "animate-otp-pop" : ""}
                  `}
                />
              ))}
            </div>

            <div className="mt-3 text-center text-[13px] text-[var(--color-text-secondary)]">
              Didn&apos;t receive the OTP?{" "}
              <button
                type="button"
                disabled={seconds > 0 || resendLoading}
                onClick={handleResendOtp}
                className="
                  -my-2
                  px-1
                  py-2
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

            <div className="mt-6 w-full max-w-[320px] md:max-w-[300px]">
              <div className="mb-2.5">
                <FormInput
                  id="newPassword"
                  name="newPassword"
                  icon={LockKeyhole}
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) =>
                    handleNewPasswordChange(event.target.value)
                  }
                />
              </div>

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                icon={LockKeyhole}
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(event) =>
                  handleConfirmPasswordChange(event.target.value)
                }
              />
            </div>

            {error && (
              <p
                role="alert"
                className="
                  mt-3
                  text-center
                  text-[12px]
                  leading-4
                  text-red-500
                "
              >
                {error}
              </p>
            )}

            <div className="mt-8 flex w-full justify-center">
              <div className="w-full max-w-[320px] md:max-w-[300px]">
                <AppButton type="button" loading={loading} onClick={submit}>
                  Reset Password
                </AppButton>
              </div>
            </div>
          </section>
        </main>
      </ScreenShell>

      <ResetPasswordSuccessModal
        open={showSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
