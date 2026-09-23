"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import LanguageSelector from "@/app/components/common/LanguageSelector";
import { useBilingualText } from "@/app/components/common/Bilingual";

interface BrandHeaderProps {
  title?: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
}

export function BrandHeader({
  title,
  showBackButton = false,
  backHref = "/welcome",
}: BrandHeaderProps) {
  const goBackLabel = useBilingualText("accessibility.goBack");

  return (
    <header className="w-full bg-white">
      <div className="bg-[var(--color-primary)] px-3 py-2 sm:px-5 sm:py-2.5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                flex
                h-[32px]
                min-w-[74px]
                items-center
                justify-center
                rounded-full
                bg-[var(--color-icon-bg-soft-2)]
                px-3
                sm:h-9
                sm:min-w-[92px]
                sm:px-4
                gap-1
              "
            >
              <Image
                src="/images/smt-logo.png"
                alt="SMT"
                width={65}
                height={25}
                priority
                className="
                  h-[23px]
                  w-auto
                  object-contain
                  sm:h-[25px]
                  mt-1
                "
              />

              <span
                className="
                  ml-0.5
                  text-[13px]
                  font-normal
                  text-[#1769aa]
                  sm:text-[14px]
                "
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                SMT
              </span>
            </div>

            <div className="flex h-8 items-center rounded-full bg-[var(--color-icon-bg-soft-2)] px-2.5 sm:h-9 sm:px-3">
              <Image
                src="/images/rotary-logo.png"
                alt="Rotary"
                width={90}
                height={30}
                priority
                className="h-auto w-[60px] object-contain sm:w-[70px]"
              />
            </div>
          </div>

          <LanguageSelector />
        </div>
      </div>

      {title && (
        <div className="border-b border-[var(--color-border-lighter)] bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-3.5 sm:px-6 sm:py-4">
            {showBackButton && (
              <Link
                href={backHref}
                aria-label={goBackLabel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <ChevronLeft size={22} strokeWidth={1.8} />
              </Link>
            )}
            <h1 className="min-w-0 text-[16px] font-semibold text-[var(--color-text-primary)] sm:text-[18px]">
              {title}
            </h1>
          </div>
        </div>
      )}
    </header>
  );
}
