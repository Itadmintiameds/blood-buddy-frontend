"use client";

interface RegistrationSuccessModalProps {
  open: boolean;
  onConfirm: () => void;
}

export function RegistrationSuccessModal({
  open,
  onConfirm,
}: RegistrationSuccessModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        px-5
      "
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-full
          max-w-[340px]
          rounded-[10px]
          bg-white
          px-6
          py-6
          text-center
          shadow-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-[var(--color-icon-bg-soft)]
            text-[var(--color-primary)]
          "
        >
          ✓
        </div>

        <h2 className="mt-4 text-[15px] font-semibold text-[var(--color-text-primary)]">
          Registration Successful
        </h2>

        <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-muted)]">
          Your Blood Centre registration was successful. Please verify your
          mobile number using the OTP.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="
            mt-5
            h-[38px]
            w-full
            rounded-[6px]
            bg-[var(--color-primary)]
            text-[12px]
            font-medium
            text-white
            transition
            hover:bg-[var(--color-dashboard-cta-hover)]
          "
        >
          OK
        </button>
      </div>
    </div>
  );
}
