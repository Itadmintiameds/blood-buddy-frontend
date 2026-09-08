"use client";

import { CheckCircle2 } from "lucide-react";

interface OtpVerificationSuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export function OtpVerificationSuccessModal({
  open,
  onConfirm,
}: OtpVerificationSuccessModalProps) {
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
      aria-labelledby="otp-success-title"
    >
      <div
        className="
          w-full
          max-w-[340px]
          rounded-[10px]
          bg-white
          px-5
          py-6
          text-center
          shadow-xl

          sm:max-w-[380px]
          sm:px-7
        "
      >
        {/* Success Icon */}
        <div className="mb-4 flex justify-center">
          <div
            className="
              flex
              h-[52px]
              w-[52px]
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
          id="otp-success-title"
          className="
            text-[16px]
            font-semibold
            leading-6
            text-[var(--color-text-primary)]
          "
        >
          Mobile Number Verified
        </h2>

        {/* Message */}
        <p
          className="
            mt-2
            text-[12px]
            leading-5
            text-[var(--color-text-muted)]
          "
        >
          Your mobile number has been verified successfully.
        </p>

        <p
          className="
            mt-1
            text-[12px]
            leading-5
            text-[var(--color-text-muted)]
          "
        >
          You can now continue to login.
        </p>

        {/* OK Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="
            mt-5
            flex
            h-[40px]
            w-full
            items-center
            justify-center
            rounded-[6px]
            bg-[var(--color-primary)]
            text-[12px]
            font-medium
            text-white
            transition
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
