"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { sendRecipientOtp } from "@/services/recipient/recipientOtpService";

export function RecipientLoginScreen() {
  const router = useRouter();

  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    setError("");

    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      await sendRecipientOtp(cleanMobile);

      router.push(`/recipient/verify?mobile=${encodeURIComponent(cleanMobile)}`);
    } catch (sendError) {
      console.error("Send recipient OTP error:", sendError);
      setError("Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
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
      <BrandHeader title="Recipient / Access" showBackButton backHref="/welcome" />

      <section className="flex min-h-[460px] flex-col items-center bg-white px-5 pb-10 pt-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)] shadow-sm">
          <Phone
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h2 className="mt-4 text-center text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]">
          Login to view and request blood availability
        </h2>

        <div className="mt-8 w-full max-w-[360px]">
          <FormInput
            id="recipientMobile"
            name="mobileNumber"
            icon={Phone}
            label="Mobile Number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(event) => {
              setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10));
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
          />

          {error && (
            <p role="alert" className="mt-2 px-1 text-[12px] leading-4 text-red-500">
              {error}
            </p>
          )}

          <div className="mt-8">
            <AppButton type="button" loading={loading} onClick={submit}>
              Send OTP
            </AppButton>
          </div>

          <div className="mt-5 text-center text-[13px]">
            <Link
              href="/welcome"
              className="text-[var(--color-primary)] transition hover:underline"
            >
              Return to Welcome page
            </Link>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
