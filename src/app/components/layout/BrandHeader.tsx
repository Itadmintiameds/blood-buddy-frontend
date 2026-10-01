"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import LanguageSelector from "@/app/components/common/LanguageSelector";
import {
  useBilingualText,
  useDualLanguage,
} from "@/app/components/common/Bilingual";

interface BrandHeaderProps {
  title?: ReactNode;
  /** Rendered at the right end of the title row. */
  titleAction?: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  welcomeName?: string | null;
  /**
   * When true, the title row is constrained to the same width/padding as a
   * registration content column, so the title (and its right-side action) line
   * up with the form fields below instead of hugging the full-width bar edge.
   */
  alignTitleToContent?: boolean;
}

export function BrandHeader({
  title,
  titleAction,
  showBackButton = false,
  backHref = "/welcome",
  welcomeName,
  alignTitleToContent = false,
}: BrandHeaderProps) {
  const goBackLabel = useBilingualText("accessibility.goBack");

  // In dual-language mode (donor/recipient) both languages show at once, so the
  // language toggle is redundant and hidden.
  const dual = useDualLanguage();

  // Padding here is the sum of the content section's padding and the card's
  // inner padding at each breakpoint, so the title edge matches the field edge.
  const titleRowClass = alignTitleToContent
    ? "mx-auto flex w-full items-center gap-2.5 px-8 py-3.5 sm:px-12 sm:py-4 md:max-w-[900px] md:px-[72px] lg:max-w-[1000px] lg:px-20"
    : "mx-auto flex max-w-[1600px] items-center gap-2.5 px-4 py-3.5 sm:px-6 sm:py-4";

  return (
    <header className="w-full bg-white">
      <div className="bg-[var(--color-primary)] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-[var(--color-icon-bg-soft-2)]
                sm:h-13
                sm:w-13
              "
            >
              <Image
                src="/images/blood-buddy-logo.png"
                alt="Blood Buddy"
                width={1112}
                height={1650}
                priority
                className="
                  h-[34px]
                  w-auto
                  object-contain
                  sm:h-[42px]
                "
              />
            </div>

            <div className="flex h-11 items-center rounded-full bg-[var(--color-icon-bg-soft-2)] px-3 sm:h-13 sm:px-4">
              <Image
                src="/images/rotary-logo.png"
                alt="Rotary"
                width={90}
                height={30}
                priority
                className="h-auto w-[82px] object-contain sm:w-[98px]"
              />
            </div>

            {welcomeName && (
              <div className="ml-1 hidden min-w-0 items-center border-l border-white/25 pl-3 sm:flex">
                <p className="truncate text-[13px] font-medium text-white sm:text-[14px]">
                  Welcome,{" "}
                  <span className="font-semibold">{welcomeName}</span>
                </p>
              </div>
            )}
          </div>

          {!dual && <LanguageSelector />}
        </div>
      </div>

      {title && (
        <div className="border-b border-[var(--color-border-lighter)] bg-white">
          <div className={titleRowClass}>
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
            {titleAction && <div className="ml-auto shrink-0">{titleAction}</div>}
          </div>
        </div>
      )}
    </header>
  );
}
