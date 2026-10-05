"use client";

import { CheckCircle2 } from "lucide-react";

import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  Bilingual,
  BilingualInline,
} from "@/app/components/common/Bilingual";

interface LoginSuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export function LoginSuccessModal({ open, onConfirm }: LoginSuccessModalProps) {
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
      aria-labelledby="login-success-title"
    >
      {/* The message scrolls if it is long (Kannada + English on a small
          phone); the OK button stays pinned below it. */}
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[340px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          text-center
          shadow-[0_25px_70px_rgba(0,0,0,0.2)]
          transition-[transform,opacity]
          duration-200
          sm:max-w-[380px]
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain max-sm:[&_:is(h2,p,span)>span+span]:text-[11px] px-5 pt-6 sm:px-7 sm:pt-7">
          {/* Success Icon */}
          <div className="mb-4 flex justify-center">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[var(--color-success-bg)]
              "
            >
              <CheckCircle2
                size={30}
                strokeWidth={2}
                className="text-[var(--color-success)]"
              />
            </div>
          </div>

          {/* Title */}
          <Bilingual
            tKey="bloodCentre.loginSuccess"
            as="h2"
            id="login-success-title"
            className="
              text-[18px]
              font-semibold
              leading-6
              tracking-[-0.01em]
              text-[var(--color-text-primary)]
            "
          />

          {/* Description */}
          <Bilingual
            tKey="bloodCentre.loggedInMessage"
            as="p"
            className="
              mt-2
              text-[13px]
              leading-5
              text-[var(--color-text-muted)]
            "
          />

          <Bilingual
            tKey="bloodCentre.welcomeMessage"
            as="p"
            className="
              mt-1
              text-[13px]
              leading-5
              text-[var(--color-text-muted)]
            "
          />
        </div>

        {/* OK */}
        <div className="shrink-0 px-5 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
          <button
            type="button"
            onClick={onConfirm}
            className="
              flex
              min-h-11
              w-full
              items-center
              justify-center
              rounded-lg
              bg-[var(--color-primary)]
              px-4
              py-2
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
            <BilingualInline
              tKey="common.ok"
              enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
