"use client";

import Image from "next/image";

import { BilingualInline } from "@/app/components/common/Bilingual";

export function PoweredBy() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-center">
      <span className="text-[11px] font-medium text-[#3B0B85]">
        <BilingualInline
          tKey="common.poweredBy"
          enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-[#3B0B85]/70"
        />
      </span>
      <Image
        src="/images/tiameds-logo.png"
        alt="TiaMeds"
        width={110}
        height={43}
        className="h-auto w-[64px] object-contain sm:w-[78px]"
      />
    </div>
  );
}

// SMT and Rotary partner logos, shown in the site-wide footer.
export function PartnerLogos() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <Image
        src="/images/smt-logo.png"
        alt="SMT"
        width={136}
        height={164}
        className="h-7 w-auto object-contain sm:h-[30px]"
      />
      <Image
        src="/images/rotary-logo.png"
        alt="Rotary Mysore"
        width={1600}
        height={423}
        className="h-5 w-auto object-contain sm:h-6"
      />
    </div>
  );
}

// Site-wide footer (partner logos + "Powered by TiaMeds"). Every page frame
// renders this as its last child (ScreenShell, BloodCentreShell, the
// super-admin dashboard), so a page only needs one of those frames to get it.
export function PoweredByFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex min-h-11 shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[var(--color-border-lighter)] bg-white px-4 py-1.5 sm:gap-x-4 ${className}`}
    >
      <PartnerLogos />
      <span aria-hidden className="h-6 w-px bg-[var(--color-border-lighter)]" />
      <PoweredBy />
    </footer>
  );
}
