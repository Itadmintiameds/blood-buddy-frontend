"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { Bilingual } from "@/app/components/common/Bilingual";
import type { ConsentForm } from "@/types/api.types";

interface ConsentCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  id: string;
  error?: string;
  /** Short statement shown next to the checkbox, e.g. "donor.consentStatement". */
  statementKey: string;
  /**
   * The active consent wording from the backend, always shown above the
   * checkbox. Null while loading or if loading failed; the checkbox is
   * disabled until it arrives, since the submit must carry its version.
   */
  consent: ConsentForm | null;
  consentLoading?: boolean;
  /** Called from the "Retry" link shown when the consent wording failed to load. */
  onRetry?: () => void;
}

// A required "I agree" checkbox for the donor / recipient forms. The exact
// consent wording (title + text) served by the backend is always visible
// above the box, so anyone who ticks it has had that text on screen.
export const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  (
    {
      id,
      error,
      statementKey,
      consent,
      consentLoading = false,
      onRetry,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        <div
          className={`
            w-full
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
          {consent ? (
            <div
              id={`${id}-text`}
              className="text-[12px] leading-5 text-[var(--color-text-tertiary)]"
            >
              <p className="font-semibold text-[var(--color-text-body)]">
                {consent.title}
              </p>
              <p className="mt-1 whitespace-pre-line">{consent.content}</p>
            </div>
          ) : consentLoading ? (
            <p className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)]">
              <Loader2 size={12} className="animate-spin" />
              <Bilingual tKey="common.consentLoading" as="span" />
            </p>
          ) : (
            <p className="text-[12px] text-red-500">
              <Bilingual tKey="common.consentLoadFailed" as="span" />
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-0.5 block font-medium text-[var(--color-primary)] underline"
                >
                  <Bilingual tKey="common.retry" as="span" />
                </button>
              )}
            </p>
          )}

          <div className="mt-3 flex items-start gap-3 border-t border-[var(--color-border)] pt-3">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              aria-invalid={Boolean(error)}
              aria-describedby={consent ? `${id}-text` : undefined}
              disabled={disabled || !consent}
              className={`
                mt-0.5
                h-[18px]
                w-[18px]
                shrink-0
                cursor-pointer
                rounded
                disabled:cursor-not-allowed
                disabled:opacity-50
                border-[var(--color-border)]
                text-[var(--color-primary)]
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-primary)]/30

                ${className}
              `}
              {...props}
            />

            <label
              htmlFor={id}
              className="min-w-0 flex-1 cursor-pointer text-[13px] font-medium leading-5 text-[var(--color-text-body)]"
            >
              <Bilingual
                tKey={statementKey}
                as="span"
                enClassName="mt-1 block text-[12px] font-normal leading-5 text-[var(--color-text-tertiary)]"
              />
            </label>
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
