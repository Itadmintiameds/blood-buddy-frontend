"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Bilingual, useBilingualText } from "@/app/components/common/Bilingual";

interface ConsentCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  id: string;
  error?: string;
  /** Short statement shown next to the checkbox, e.g. "donor.consentStatement". */
  statementKey: string;
  /** Longer explanation revealed by the "View details" toggle, e.g. "donor.consentDetails". */
  detailsKey: string;
}

// A required "I agree" checkbox for the donor / recipient forms. The short
// statement sits next to the box; a "View details" toggle reveals the fuller
// explanation of what the user is agreeing to, without needing a modal.
export const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  ({ id, error, statementKey, detailsKey, className = "", ...props }, ref) => {
    const [expanded, setExpanded] = useState(false);
    const viewDetailsText = useBilingualText("common.viewDetails");
    const hideDetailsText = useBilingualText("common.hideDetails");

    return (
      <div className="w-full">
        <div
          className={`
            flex
            w-full
            items-start
            gap-3
            rounded-lg
            border
            bg-[var(--color-white)]
            px-3.5
            py-3
            transition-all
            duration-200
            ${
              error
                ? "border-red-400"
                : "border-[var(--color-border)]"
            }
          `}
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={Boolean(error)}
            className={`
              mt-0.5
              h-[18px]
              w-[18px]
              shrink-0
              cursor-pointer
              rounded
              border-[var(--color-border)]
              text-[var(--color-primary)]
              outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]/30

              ${className}
            `}
            {...props}
          />

          <div className="min-w-0 flex-1">
            <label
              htmlFor={id}
              className="cursor-pointer text-[13px] font-medium leading-5 text-[var(--color-text-body)]"
            >
              <Bilingual
                tKey={statementKey}
                as="span"
                enClassName="mt-1 block text-[12px] font-normal leading-5 text-[var(--color-text-tertiary)]"
              />
            </label>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[var(--color-primary)]"
            >
              {expanded ? hideDetailsText : viewDetailsText}
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {expanded && (
              <Bilingual
                tKey={detailsKey}
                as="p"
                className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[var(--color-text-tertiary)]"
                enClassName="mt-2 block border-t border-[var(--color-border)] pt-2 text-[12px] font-normal leading-5 text-[var(--color-text-tertiary)]"
              />
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-1.5 px-1 text-[12px] leading-4 text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

ConsentCheckbox.displayName = "ConsentCheckbox";
