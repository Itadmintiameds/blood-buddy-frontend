import { Droplets } from "lucide-react";
import Link from "next/link";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";

export default function DonorPage() {
  return (
    <ScreenShell>
      <BrandHeader title="Donor Module" showBackButton backHref="/welcome" />

      <section
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center
          bg-white
          px-5
          py-14
          text-center
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[var(--color-icon-bg-soft)]
          "
        >
          <Droplets
            size={30}
            strokeWidth={1.6}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h1 className="mt-5 text-[18px] font-semibold text-[var(--color-text-primary)]">
          Donor Module
        </h1>

        <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[var(--color-text-tertiary)]">
          This section is coming soon.
        </p>

        <Link
          href="/welcome"
          className="
            mt-6
            rounded-lg
            border
            border-[var(--color-border)]
            px-4
            py-2
            text-[13px]
            font-medium
            text-[var(--color-text-secondary)]
            transition-all
            duration-200
            hover:border-[var(--color-primary)]
            hover:text-[var(--color-primary)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--color-primary)]
          "
        >
          Return to Welcome page
        </Link>
      </section>
    </ScreenShell>
  );
}
