"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BrandHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function BrandHeader({
  title,
  showBackButton = false,
  backHref = "/welcome",
}: BrandHeaderProps) {
  return (
    <header className="w-full bg-white">
      <div className="bg-[var(--color-primary)] px-3 py-2 sm:px-5 sm:py-2.5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
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
      </div>

      {title && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6">
            {showBackButton && (
              <Link
                href={backHref}
                aria-label="Go back"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
              >
                <ChevronLeft size={22} strokeWidth={1.8} />
              </Link>
            )}
            <h1 className="text-[16px] font-medium text-slate-800 sm:text-[18px]">
              {title}
            </h1>
          </div>
        </div>
      )}
    </header>
  );
}
