import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { BilingualInline } from "@/app/components/common/Bilingual";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  /**
   * Muted "not ready yet" look for a form whose required fields aren't all
   * filled. Unlike `disabled` the button stays tappable, so pressing it can
   * still run validation and show the user what is missing.
   */
  dimmed?: boolean;
  children: ReactNode;
}

const BASE =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[14px] font-semibold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none";

const READY =
  "bg-[var(--color-primary)] shadow-[0_4px_14px_rgba(255,59,63,0.22)] hover:-translate-y-px hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_18px_rgba(255,59,63,0.28)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(255,59,63,0.22)]";

const DIMMED = "bg-[var(--color-primary-dull)] shadow-none";

export function AppButton({
  loading,
  disabled,
  dimmed = false,
  children,
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={dimmed || undefined}
      className={`${BASE} ${dimmed && !loading ? DIMMED : READY} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
      {loading ? (
        <BilingualInline
          tKey="common.pleaseWait"
          enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
        />
      ) : (
        children
      )}
    </button>
  );
}
