import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function AppButton({
  loading,
  disabled,
  children,
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(255,59,63,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_18px_rgba(255,59,63,0.28)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(255,59,63,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {loading ? "Please wait..." : children}
    </button>
  );
}
