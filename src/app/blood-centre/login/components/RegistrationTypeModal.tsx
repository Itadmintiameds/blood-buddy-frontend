"use client";

import { Building2, ShieldCheck, X } from "lucide-react";

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
        px-4
        backdrop-blur-[2px]
      "
      onMouseDown={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-[390px]
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Close Button */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close registration modal"
          className="
            absolute
            right-4
            top-4
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-700
          "
        >
          <X size={18} />
        </button>

        {/* Heading */}

        <div className="pr-8">
          <h2
            className="
              text-[18px]
              font-semibold
              text-[#222]
            "
          >
            Registration
          </h2>

          <p
            className="
              mt-1
              text-[12px]
              leading-5
              text-gray-500
            "
          >
            Do you want registration for Super Admin or Blood Centre?
          </p>
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
              hover:border-[#FF3B3B]
              hover:bg-red-50
              active:scale-[0.99]
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
                className="text-[#FF3B3B]"
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[13px]
                  font-semibold
                  text-[#222]
                "
              >
                Super Admin
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-4
                  text-gray-500
                "
              >
                Register as Super Admin
              </p>
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
              hover:border-[#FF3B3B]
              hover:bg-red-50
              active:scale-[0.99]
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
                className="text-[#FF3B3B]"
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[13px]
                  font-semibold
                  text-[#222]
                "
              >
                Blood Centre Register
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-4
                  text-gray-500
                "
              >
                Register a new blood centre
              </p>
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
            text-[12px]
            text-gray-500
            transition
            hover:text-[#222]
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
