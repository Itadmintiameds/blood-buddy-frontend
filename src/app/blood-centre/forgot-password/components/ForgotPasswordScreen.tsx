"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { forgotPassword } from "@/services/bloodCenter/bloodCenter.service";
import { getApiErrorMessage } from "@/services/api/client";

export function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const submit = async () => {
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
      await forgotPassword({ email: cleanEmail });

      router.push(
        `/blood-centre/reset-password?email=${encodeURIComponent(cleanEmail)}`,
      );
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        getApiErrorMessage(error, "Unable to send OTP. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (error) {
      setError("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      void submit();
    }
  };

  return (
    <ScreenShell>
      <BrandHeader
        title="Forgot Password"
        showBackButton
        backHref="/blood-centre/login"
      />

      <section
        className="
          flex
          min-h-[510px]
          flex-col
          items-center
          bg-white
          px-5
          pb-10
          pt-12
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
          <Mail
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h2
          className="
            mt-4
            text-[20px]
            font-semibold
            tracking-[-0.01em]
            text-[var(--color-text-primary)]
          "
        >
          Forgot Password
        </h2>

        <p
          className="
            mt-2
            max-w-[300px]
            text-center
            text-[13px]
            leading-5
            text-[var(--color-text-placeholder-alt)]
          "
        >
          Enter your registered email and we&apos;ll send you an OTP to reset
          your password
        </p>

        <div
          className="
            mt-8
            w-full
            max-w-[360px]
          "
        >
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
            onChange={(event) => handleEmailChange(event.target.value)}
            onKeyDown={handleKeyDown}
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
            <AppButton type="button" loading={loading} onClick={submit}>
              Send OTP
            </AppButton>
          </div>

          <div
            className="
              mt-5
              text-center
              text-[13px]
            "
          >
            <Link
              href="/blood-centre/login"
              className="
                text-[var(--color-text-secondary)]
                underline
                underline-offset-2
                transition
                hover:text-[var(--color-primary)]
              "
            >
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
