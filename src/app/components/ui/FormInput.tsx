"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";

import { useLanguage } from "@/contexts/LanguageContext";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  error?: string;
  name?: string;
  label?: ReactNode;
  /** Optional inline control (e.g. a "Send OTP" button) rendered inside the input box. */
  rightElement?: ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      icon: Icon,
      error,
      type = "text",
      className = "",
      label,
      id,
      name,
      placeholder,
      rightElement,
      required,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const { t } = useLanguage();

    const isPassword = type === "password";

    const actualType = isPassword && showPassword ? "text" : type;

    const inputId = id ?? name;

    return (
      <div className="w-full">
        {/* FIXED LABEL */}
        {label && (
          <label
            htmlFor={inputId}
            className="
              mb-1.5
              block
              text-[13px]
              font-medium
              leading-4
              text-[var(--color-text-body)]
            "
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        {/* INPUT */}
        <div
          className={`
            relative
            flex
            h-11
            w-full
            items-center
            rounded-lg
            border
            bg-[var(--color-white)]
            px-3.5
            transition-all
            duration-200

            ${
              error
                ? `
                  border-red-400
                  focus-within:border-red-500
                  focus-within:ring-2
                  focus-within:ring-red-500/10
                `
                : `
                  border-[var(--color-border)]
                  hover:border-[var(--color-border)]
                  focus-within:border-[var(--color-primary)]
                  focus-within:ring-2
                  focus-within:ring-[var(--color-primary)]/15
                `
            }
          `}
        >
          {/* ICON */}
          <Icon
            size={18}
            strokeWidth={1.5}
            className="
              mr-2.5
              shrink-0
              text-[var(--color-primary)]
            "
          />

          {/* INPUT FIELD */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            {...props}
            required={required}
            type={actualType}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className={`
              h-full
              min-w-0
              flex-1
              border-0
              bg-transparent
              font-normal
              text-[var(--color-text-body)]
              outline-none
              placeholder:text-[var(--color-input-placeholder)]
              placeholder:opacity-100
              disabled:cursor-not-allowed
              disabled:opacity-60

              ${className}
            `}
          />

          {/* PASSWORD SHOW / HIDE */}
          {isPassword && (
            <button
              type="button"
              aria-label={
                showPassword
                  ? t("accessibility.hidePassword")
                  : t("accessibility.showPassword")
              }
              onClick={() => setShowPassword((value) => !value)}
              className="
                ml-1
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-md
                text-[var(--color-primary)]
                transition-colors
                hover:bg-[var(--color-icon-bg-soft)]
              "
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}

          {/* OPTIONAL INLINE ACTION (e.g. Send OTP) */}
          {rightElement && (
            <div className="ml-2 flex shrink-0 items-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <p
            role="alert"
            className="
              mt-1.5
              px-1
              text-[12px]
              leading-4
              text-red-500
            "
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
