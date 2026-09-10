"use client";

import { CheckCircle2 } from "lucide-react";

interface LoginSuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export function LoginSuccessModal({ open, onConfirm }: LoginSuccessModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/40
        px-5
        backdrop-blur-[2px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-success-title"
    >
      <div
        className="
          animate-modalFadeSlide
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
          sm:max-w-[380px]
          sm:px-7
        "
      >
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
        <h2
          id="login-success-title"
          className="
            text-[18px]
            font-semibold
            leading-6
            text-[var(--color-text-primary)]
          "
        >
          Login Successful
        </h2>

        {/* Description */}
        <p
          className="
            mt-2
            text-[13px]
            leading-5
            text-[var(--color-text-muted)]
          "
        >
          You have logged in successfully.
        </p>

        <p
          className="
            mt-1
            text-[13px]
            leading-5
            text-[var(--color-text-muted)]
          "
        >
          Welcome to Blood Buddy.
        </p>

        {/* OK */}
        <button
          type="button"
          onClick={onConfirm}
          className="
            mt-6
            flex
            h-11
            w-full
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
          OK
        </button>
      </div>
    </div>
  );
}
