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
      {/* Desktop height must stay 76px (16px padding + 60px badge): the
          sidebar is positioned at lg:top-[76px] below it. */}
      <div className="bg-[var(--color-primary)] px-3 py-2 sm:px-5">
        <div
          className={`mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 ${
            welcomeName ? "lg:max-w-none" : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-0">
            {/* With a sidebar below (welcomeName pages), the logo slot spans the
                sidebar's 260px (240px + the bar's 20px padding) so the welcome
                text starts where the page content does. */}
            <div
              className={`flex shrink-0 items-center gap-2.5 sm:gap-3 ${
                welcomeName ? "lg:w-[240px]" : ""
              }`}
            >
              {/* White badge shaped to the tall drop so the logo fills nearly
                  all of it and stays readable against the red bar. */}
              <div
                className="
                  ml-1
                  flex
                  h-[52px]
                  w-[44px]
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  shadow-[0_4px_14px_rgba(0,0,0,0.18)]
                  ring-1
                  ring-black/5
                  sm:ml-2
                  sm:h-[60px]
                  sm:w-[50px]
                "
              >
                <Image
                  src="/images/blood-buddy-logo.png"
                  alt="Blood Buddy"
                  width={1112}
                  height={1650}
                  priority
                  className="
                    h-[48px]
                    w-auto
                    object-contain
                    sm:h-[56px]
                  "
                />
              </div>

              <div className="leading-none text-white">
                <p className="text-[16px] font-extrabold tracking-[-0.3px] sm:text-[18px]">
                  Blood Buddy
                </p>
                <p className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.04em] text-white/80 min-[380px]:text-[10px] min-[380px]:tracking-[0.08em] sm:text-[10.5px]">
                  Network of Lifesavers
                </p>
              </div>
            </div>

            {welcomeName && (
              <div className="ml-1 hidden min-w-0 items-center border-l border-white/25 pl-3 sm:flex lg:ml-0 lg:pl-8">
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
                className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
