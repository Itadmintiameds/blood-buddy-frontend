import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

import { BilingualInline } from "@/app/components/common/Bilingual";

interface RoleSwitchLinkProps {
  href: string;
  tKey: string;
}

export function RoleSwitchLink({ href, tKey }: RoleSwitchLinkProps) {
  return (
    <Link
      href={href}
      className="flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:px-4 sm:text-[13px]"
    >
      <ArrowLeftRight size={16} className="shrink-0" />
      <BilingualInline
        tKey={tKey}
        enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
      />
    </Link>
  );
}
