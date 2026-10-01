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
        className="h-auto w-[78px] object-contain"
      />
    </div>
  );
}

// Site-wide footer ("Powered by TiaMeds"). Every page frame renders this as its
// last child (ScreenShell, BloodCentreShell, the super-admin dashboard), so a
// page only needs one of those frames to get the footer.
export function PoweredByFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex min-h-11 shrink-0 items-center justify-center border-t border-[var(--color-border-lighter)] bg-white px-4 py-1.5 ${className}`}
    >
      <PoweredBy />
    </footer>
  );
}
