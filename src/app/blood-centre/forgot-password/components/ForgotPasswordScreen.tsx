"use client";

import { useState } from "react";
import { ArrowLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { PoweredBy } from "@/app/components/common/PoweredBy";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { FormInput } from "@/app/components/ui/FormInput";
import { AppButton } from "@/app/components/ui/AppButton";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import {
  sendForgotPasswordOtp,
  resetPassword,
} from "@/services/bloodCenter/forgotPasswordService";
import { getApiErrorMessage } from "@/utils/api";

export function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const clearError = () => {
    if (error) {
      setError("");
    }
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // SEND OTP
  const sendOtp = async () => {
    if (loading) {
      return;
    }

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await sendForgotPasswordOtp({
        email: cleanEmail,
      });

      setEmail(cleanEmail);
      setStep("reset");
    } catch (requestError) {
      console.error("Forgot Password Error:", requestError);

      setError(
        getApiErrorMessage(
          requestError,
          "Unable to send the OTP. Please check your email and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const submitReset = async () => {
    if (loading) {
      return;
    }

    setError("");

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Enter the 6-digit OTP sent to your email");
      return;
    }

    if (!newPassword) {
      setError("Enter your new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!confirmPassword) {
      setError("Confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: email.trim(),
        otp: cleanOtp,
        newPassword,
      });

      setSuccessOpen(true);
    } catch (requestError) {
      console.error("Reset Password Error:", requestError);

      setError(
        getApiErrorMessage(
          requestError,
          "Unable to reset your password. Please check the OTP and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP
  const handleOtpChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

    setOtp(digitsOnly);

    clearError();
  };

  // SUCCESS
  const handleSuccess = () => {
    setSuccessOpen(false);

    router.replace("/blood-centre/login");
  };

  // CHANGE EMAIL
  const handleBackToEmail = () => {
    if (loading) {
      return;
    }

    setError("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("email");
  };

  return (
    <ScreenShell>
      <BrandHeader
        title="Forgot Password"
        showBackButton
        backHref="/blood-centre/login"
      />

      <main className="min-h-[calc(100vh-50px)] bg-white">
        <section
          className="
            mx-auto
            flex
            w-full
            max-w-[520px]
            flex-col
            items-center
            px-5
            pb-10
            pt-10
            sm:px-8
            sm:pt-12
          "
        >
          {/* ICON */}

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
            {step === "email" ? (
              <Mail
                size={26}
                strokeWidth={1.5}
                className="text-[var(--color-primary)]"
              />
            ) : (
              <KeyRound
                size={26}
                strokeWidth={1.5}
                className="text-[var(--color-primary)]"
              />
            )}
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-4
              text-[20px]
              font-semibold
              tracking-[-0.01em]
              text-[var(--color-text-primary)]
            "
          >
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-2
              max-w-[390px]
              text-center
              text-[12px]
              leading-5
              text-[var(--color-text-muted)]
            "
          >
            {step === "email"
              ? "Enter your registered email address. We will send a verification OTP to your email."
              : `Enter the OTP sent to ${email}, then create your new password.`}
          </p>

          <div className="mt-8 w-full max-w-[380px]">
            {/* STEP 1 */}
            {step === "email" ? (
              <>
                <FormInput
                  id="forgotPasswordEmail"
                  name="email"
                  icon={Mail}
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void sendOtp();
                    }
                  }}
                />

                {error && (
                  <p
                    role="alert"
                    className="
                      mt-2
                      px-1
                      text-[12px]
                      leading-4
                      text-red-500
                    "
                  >
                    {error}
                  </p>
                )}

                <div className="mt-8">
                  <AppButton type="button" loading={loading} onClick={sendOtp}>
                    Send OTP
                  </AppButton>
                </div>

                <div className="mt-5 text-center">
                  <Link
                    href="/blood-centre/login"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-[13px]
                      font-medium
                      text-[var(--color-primary)]
                      transition
                      hover:underline
                    "
                  >
                    <ArrowLeft size={15} strokeWidth={1.8} />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              // STEP 2
              <>
                {/* OTP */}

                <div>
                  <label
                    htmlFor="resetOtp"
                    className="
                      mb-1.5
                      block
                      text-[13px]
                      font-medium
                      leading-4
                      text-[var(--color-text-body)]
                    "
                  >
                    OTP
                  </label>

                  <div
                    className="
                      relative
                      flex
                      h-11
                      w-full
                      items-center
                      rounded-lg
                      border
                      border-[var(--color-border)]
                      bg-white
                      px-3.5
                      transition-all
                      focus-within:border-[var(--color-primary)]
                      focus-within:ring-2
                      focus-within:ring-[var(--color-primary)]/15
                    "
                  >
                    <KeyRound
                      size={18}
                      strokeWidth={1.5}
                      className="
                        mr-2.5
                        shrink-0
                        text-[var(--color-primary)]
                      "
                    />

                    <input
                      id="resetOtp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(event) => handleOtpChange(event.target.value)}
                      className="
                        min-w-0
                        flex-1
                        border-0
                        bg-transparent
                        text-[14px]
                        font-normal
                        tracking-[0.2em]
                        text-[var(--color-text-body)]
                        outline-none
                        placeholder:text-[var(--color-input-placeholder)]
                        placeholder:tracking-normal
                      "
                    />
                  </div>
                </div>

                {/* NEW PASSWORD */}

                <div className="mt-3">
                  <FormInput
                    id="newPassword"
                    name="newPassword"
                    icon={LockKeyhole}
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      clearError();
                    }}
                  />
                </div>

                {/* CONFIRM PASSWORD */}

                <div className="mt-3">
                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    icon={LockKeyhole}
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearError();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void submitReset();
                      }
                    }}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="
                      mt-2
                      px-1
                      text-[12px]
                      leading-4
                      text-red-500
                    "
                  >
                    {error}
                  </p>
                )}

                {/* RESET */}

                <div className="mt-8">
                  <AppButton
                    type="button"
                    loading={loading}
                    onClick={submitReset}
                  >
                    Reset Password
                  </AppButton>
                </div>

                {/* CHANGE EMAIL */}

                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    items-center
                    gap-2
                    text-center
                  "
                >
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    disabled={loading}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-[13px]
                      font-medium
                      text-[var(--color-primary)]
                      transition
                      hover:underline
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <ArrowLeft size={15} strokeWidth={1.8} />
                    Change Email
                  </button>

                  <p
                    className="
                      text-[11px]
                      text-[var(--color-text-muted)]
                    "
                  >
                    Didn&apos;t receive the OTP? Go back and request a new one.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* SUCCESS */}

      <SuccessModal
        open={successOpen}
        title="Password Updated"
        description="Your password has been changed successfully. You can now login with your new password."
        confirmLabel="Go to Login"
        onConfirm={handleSuccess}
      />
    </ScreenShell>
  );
}
