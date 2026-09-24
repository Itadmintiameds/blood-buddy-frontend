"use client";

import { Building2, ShieldCheck, X } from "lucide-react";

import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

interface RegistrationTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSuperAdmin: () => void;
  onBloodCentre: () => void;
}

export function RegistrationTypeModal({
  open,
  onClose,
  onSuperAdmin,
  onBloodCentre,
}: RegistrationTypeModalProps) {
  const { rendered, visible } = useExitTransition(open, 200);
  const closeLabel = useBilingualText("accessibility.closeRegistrationModal");

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
        bg-black/45
        px-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className={`
          motion-surface
          relative
          max-h-[90vh]
          w-full
          max-w-[400px]
          overflow-y-auto
          rounded-2xl
          bg-white
          p-6
          shadow-[0_25px_70px_rgba(0,0,0,0.2)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-type-title"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Close Button */}

        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-gray-300
          "
        >
          <X size={18} />
        </button>

        {/* Heading */}

        <div className="pr-8">
          <Bilingual
            tKey="bloodCentre.registrationTypeTitle"
            as="h2"
            id="registration-type-title"
            className="
              text-[19px]
              font-semibold
              tracking-[-0.01em]
              text-[var(--color-text-primary)]
            "
          />

          <Bilingual
            tKey="bloodCentre.registrationTypeDescription"
            as="p"
            className="
              mt-1
              text-[13px]
              leading-5
              text-gray-500
            "
          />
        </div>

        {/* Registration Options */}

        <div className="mt-6 space-y-3">
          {/* Super Admin */}

          <button
            type="button"
            onClick={onSuperAdmin}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-white
              p-4
              text-left
              transition-all
              duration-200
              hover:border-[var(--color-stat-red)]
              hover:bg-red-50
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-red-50
              "
            >
              <ShieldCheck
                size={22}
                strokeWidth={1.7}
                className="text-[var(--color-stat-red)]"
              />
            </div>

            <div className="min-w-0">
              <Bilingual
                tKey="superAdmin.superAdmin"
                as="p"
                className="
                  text-[14px]
                  font-semibold
                  text-[var(--color-text-primary)]
                "
              />

              <Bilingual
                tKey="bloodCentre.registerAsSuperAdmin"
                as="p"
                className="
                  mt-0.5
                  text-[12px]
                  leading-4
                  text-gray-500
                "
              />
            </div>
          </button>

          {/* Blood Centre */}

          <button
            type="button"
            onClick={onBloodCentre}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-white
              p-4
              text-left
              transition-all
              duration-200
              hover:border-[var(--color-stat-red)]
              hover:bg-red-50
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-red-50
              "
            >
              <Building2
                size={22}
                strokeWidth={1.7}
                className="text-[var(--color-stat-red)]"
              />
            </div>

            <div className="min-w-0">
              <Bilingual
                tKey="bloodCentre.bloodCentreRegister"
                as="p"
                className="
                  text-[14px]
                  font-semibold
                  text-[var(--color-text-primary)]
                "
              />

              <Bilingual
                tKey="bloodCentre.registerNewBloodCentre"
                as="p"
                className="
                  mt-0.5
                  text-[12px]
                  leading-4
                  text-gray-500
                "
              />
            </div>
          </button>
        </div>

        {/* Cancel */}

        <button
          type="button"
          onClick={onClose}
          className="
            mt-5
            w-full
            rounded-lg
            py-2
            text-[13px]
            text-gray-500
            transition
            hover:bg-gray-50
            hover:text-[var(--color-text-primary)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-gray-300
          "
        >
          <BilingualInline tKey="common.cancel" />
        </button>
      </div>
    </div>
  );
}
