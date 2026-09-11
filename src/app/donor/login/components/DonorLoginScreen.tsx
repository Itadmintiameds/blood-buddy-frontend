"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { getDonorSession } from "@/services/donor/donorSessionStorage";
import { loginDonor } from "@/services/donor/donorLoginService";

export function DonorLoginScreen() {
  const router = useRouter();

  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getDonorSession()) {
      router.replace("/donor/dashboard");
    }
  }, [router]);

  const submit = async () => {
    if (loading) return;

    setError("");

    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    if (!password) {
      setError("Enter your password");
      return;
    }

    setLoading(true);

    try {
      await loginDonor(cleanMobile, password);

      router.replace("/donor/dashboard");
    } catch (loginError) {
      console.error("Donor login error:", loginError);

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Invalid mobile number or password.",
      );
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
      <BrandHeader title="Donor Login" showBackButton backHref="/donor" />

      <section className="flex min-h-[510px] flex-col items-center bg-white px-5 pb-10 pt-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)] shadow-sm">
          <Phone
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]">
          Login
        </h2>

        <div className="mt-8 w-full max-w-[360px]">
          <div className="mb-2.5">
            <FormInput
              id="donorLoginMobile"
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
          </div>

          <FormInput
            id="donorLoginPassword"
            name="password"
            icon={LockKeyhole}
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
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
              Login
            </AppButton>
          </div>

          <div className="mt-5 text-center text-[13px] text-[var(--color-text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/donor/register"
              className="font-medium text-[var(--color-primary)] underline-offset-2 transition hover:underline"
            >
              Register Now
            </Link>
          </div>

          <div className="mt-2.5 text-center text-[13px]">
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
