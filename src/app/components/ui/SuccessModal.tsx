"use client";

import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { useExitTransition } from "@/app/hooks/useExitTransition";
import { BilingualInline } from "@/app/components/common/Bilingual";

interface SuccessModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  onConfirm: () => void;
}

export function SuccessModal({
  open,
  title,
  description,
  confirmLabel = <BilingualInline tKey="common.ok" />,
  onConfirm,
}: SuccessModalProps) {
  const { rendered, visible } = useExitTransition(open, 200);

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`
        motion-scrim
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/40
        px-5
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div
        className={`
          motion-surface
          max-h-[90vh]
          w-full
          max-w-[340px]
          overflow-y-auto
          rounded-2xl
          bg-white
          px-5
          py-7
          text-center
          shadow-[0_25px_70px_rgba(0,0,0,0.2)]
          transition-[transform,opacity]
          duration-200
          sm:max-w-[380px]
          sm:px-7
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
            <CheckCircle2
              size={30}
              strokeWidth={2}
              className="text-[var(--color-success)]"
            />
          </div>
        </div>

        <h2
          id="success-modal-title"
          className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-[var(--color-text-primary)]"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={onConfirm}
          className="
            mt-6
            flex
            min-h-11
            w-full
            py-2
            items-center
            justify-center
            rounded-lg
            bg-[var(--color-primary)]
            text-[14px]
            font-semibold
            text-white
            shadow-[0_4px_14px_rgba(255,59,63,0.22)]
            transition-all
            duration-200
            hover:bg-[var(--color-primary-hover-alt)]
            active:scale-[0.98]
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--color-primary)]
            focus:ring-offset-2
          "
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
