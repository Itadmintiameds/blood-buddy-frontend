"use client";

import { CheckCircle2 } from "lucide-react";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  Bilingual,
  BilingualInline,
} from "@/app/components/common/Bilingual";

interface RegistrationSuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export function RegistrationSuccessModal({
  open,
  onConfirm,
}: RegistrationSuccessModalProps) {
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
        z-50
        flex
        items-center
        justify-center
        bg-black/45
        px-5
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
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
          px-6
          py-7
          text-center
          shadow-[0_25px_70px_rgba(0,0,0,0.2)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div
          className="
            mx-auto
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

        <Bilingual
          tKey="bloodCentre.registrationSuccess"
          as="h2"
          id="registration-success-title"
          className="mt-4 text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]"
        />

        <Bilingual
          tKey="bloodCentre.registrationSuccessCanLogin"
          as="p"
          className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]"
        />

        <button
          type="button"
          onClick={onConfirm}
          className="
            mt-6
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
            hover:bg-[var(--color-dashboard-cta-hover)]
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
  );
}
