"use client";

import { Droplets } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import {
  Bilingual,
  BilingualInline,
} from "@/app/components/common/Bilingual";

export function DonorLandingScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <BrandHeader
        title={<Bilingual tKey="donor.donorModule" as="span" />}
        showBackButton
        backHref="/welcome"
      />

      {/* max-sm: lift the small second-language lines from 0.68em (about 9px) to 11px. */}
      <section className="flex flex-1 flex-col items-center justify-center bg-white px-5 pb-8 pt-8 max-sm:[&_:is(h1,p)>span+span]:text-[11px] max-sm:[&_a>span>span+span]:text-[11px] sm:min-h-[460px] sm:justify-start sm:pb-10 sm:pt-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
          <Droplets
            size={30}
            strokeWidth={1.6}
            className="text-[var(--color-primary)]"
          />
        </div>

        <Bilingual
          tKey="donor.becomeADonor"
          as="h1"
          className="mt-5 text-center text-[18px] font-semibold text-[var(--color-text-primary)]"
        />

        <Bilingual
          tKey="donor.becomeADonorDescription"
          as="p"
          className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[var(--color-text-tertiary)]"
        />

        <div className="mt-8 w-full max-w-[320px] space-y-3">
          <AppButton
            type="button"
            onClick={() => router.push("/donor/register")}
          >
            <BilingualInline
              tKey="donor.registerAsDonor"
              enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
            />
          </AppButton>
        </div>

        <Link
          href="/welcome"
          className="mt-4 flex min-h-10 items-center px-3 text-[13px] text-[var(--color-primary)] transition hover:underline sm:mt-6"
        >
          <BilingualInline
            tKey="common.returnToWelcome"
            enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-[var(--color-primary)]/70"
          />
        </Link>
      </section>
    </ScreenShell>
  );
}
