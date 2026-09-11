"use client";

import { Droplets } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";

export function DonorLandingScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <BrandHeader title="Donor Module" showBackButton backHref="/welcome" />

      <section className="flex min-h-[460px] flex-col items-center bg-white px-5 pb-10 pt-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
          <Droplets
            size={30}
            strokeWidth={1.6}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h1 className="mt-5 text-center text-[18px] font-semibold text-[var(--color-text-primary)]">
          Become a Blood Donor
        </h1>

        <p className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[var(--color-text-tertiary)]">
          Register as a donor to help save lives, or log in to manage your
          availability.
        </p>

        <div className="mt-8 w-full max-w-[320px] space-y-3">
          <AppButton
            type="button"
            onClick={() => router.push("/donor/register")}
          >
            Register as Donor
          </AppButton>

          <button
            type="button"
            onClick={() => router.push("/donor/login")}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              rounded-lg
              border
              border-[var(--color-text-primary)]
              bg-white
              text-[14px]
              font-medium
              text-[var(--color-text-primary)]
              transition-all
              duration-200
              hover:bg-[var(--color-surface-hover)]
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-text-primary)]
              focus-visible:ring-offset-2
            "
          >
            Login
          </button>
        </div>

        <Link
          href="/welcome"
          className="mt-6 text-[13px] text-[var(--color-primary)] transition hover:underline"
        >
          Return to Welcome page
        </Link>
      </section>
    </ScreenShell>
  );
}
