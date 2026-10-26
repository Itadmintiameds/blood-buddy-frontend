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
  confirmLabel = (
    <BilingualInline
      tKey="common.ok"
      enClassName="mt-0.5 text-[clamp(11.5px,3.2vw,12.5px)] font-medium leading-tight text-white/85"
    />
  ),
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
        p-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      {/* Width scales continuously with the viewport instead of snapping at a
          breakpoint. The message scrolls if it is long (Kannada + English on
          a small phone); the OK button stays pinned below it. */}
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[min(94vw,400px)]
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          text-center
          shadow-[0_25px_70px_rgba(0,0,0,0.22)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[clamp(20px,6vw,28px)] pt-[clamp(22px,6vw,28px)]">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-bg)] ring-8 ring-[var(--color-success-bg)]/50">
              <CheckCircle2
                size={34}
                strokeWidth={2.25}
                className="text-[var(--color-success)]"
              />
            </div>
          </div>

          <h2
            id="success-modal-title"
            className="text-[clamp(18px,5vw,20px)] font-bold leading-6 tracking-[-0.01em] text-[var(--color-text-primary)]"
          >
            {title}
          </h2>

          {description && (
            <div className="mt-2.5 text-[clamp(13.5px,3.6vw,14.5px)] leading-6 text-[var(--color-text-muted)]">
              {description}
            </div>
          )}
        </div>

        <div className="shrink-0 px-[clamp(20px,6vw,28px)] pb-[clamp(20px,6vw,28px)] pt-5">
          <button
            type="button"
            onClick={onConfirm}
            className="
              flex
              min-h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-b
              from-[var(--color-primary)]
              to-[var(--color-primary-hover-alt)]
              px-4
              py-3
              text-[clamp(14px,3.8vw,15px)]
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(227,30,36,0.28)]
              transition-all
              duration-200
              hover:shadow-[0_10px_24px_rgba(227,30,36,0.34)]
              hover:brightness-105
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
    </div>
  );
}
