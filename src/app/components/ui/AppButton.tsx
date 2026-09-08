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
      className={`flex h-[38px] w-full items-center justify-center rounded-[6px] bg-[var(--color-primary)] px-4 text-[12px] font-medium text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
