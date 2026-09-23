"use client";

import Image from "next/image";

import { BilingualInline } from "@/app/components/common/Bilingual";

export function PoweredBy() {
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5 text-center">
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
        className="h-auto w-[92px] object-contain"
      />
    </div>
  );
}
