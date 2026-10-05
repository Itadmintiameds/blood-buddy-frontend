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
        p-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="presentation"
    >
      <div
        className={`
          motion-surface
          relative
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[400px]
          flex-col
          overflow-hidden
          max-sm:[&_:is(h2,p,span)>span+span]:text-[11px]
          rounded-2xl
          bg-white
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
      >
        {/* Close Button */}

        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="
            absolute
            right-3
            top-3
            sm:right-4
            sm:top-4
            flex
            h-10
            w-10
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

        <div className="shrink-0 px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
          <div className="pr-10">
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
        </div>

        {/* Registration Options */}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
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

        <div className="shrink-0 px-5 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="
              min-h-11
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
    </div>
  );
}
