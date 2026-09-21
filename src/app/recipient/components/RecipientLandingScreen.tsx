"use client";

import { Droplets } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";

export function RecipientLandingScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <BrandHeader title="Recipient Module" showBackButton backHref="/welcome" />

      <section className="flex min-h-[460px] flex-col items-center bg-white px-5 pb-10 pt-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
          <Droplets
            size={30}
            strokeWidth={1.6}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h1 className="mt-5 text-center text-[18px] font-semibold text-[var(--color-text-primary)]">
          Need Blood?
        </h1>

        <p className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[var(--color-text-tertiary)]">
          Submit a blood request and our team will help match it with a
          nearby blood centre.
        </p>

        <div className="mt-8 w-full max-w-[320px] space-y-3">
          <AppButton
            type="button"
            onClick={() => router.push("/recipient/register")}
          >
            Request Blood
          </AppButton>
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
