"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ComponentType, InputHTMLAttributes } from "react";
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
  label?: string;
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
              text-[12px]
              font-medium
              leading-4
              text-[var(--color-text-body)]
            "
          >
            {label}
          </label>
        )}

        {/* INPUT */}
        <div
          className={`
            relative
            flex
            h-[38px]
            w-full
            items-center
            rounded-[6px]
            border
            bg-[var(--color-white)]
            px-3
            transition-all
            duration-200

            ${
              error
                ? `
                  border-red-400
                  focus-within:border-red-500
                  focus-within:ring-1
                  focus-within:ring-red-500/10
                `
                : `
                  border-[var(--color-border)]
                  focus-within:border-[var(--color-primary)]
                  focus-within:ring-1
                  focus-within:ring-[var(--color-primary)]/15
                `
            }
          `}
        >
          {/* ICON */}
          <Icon
            size={17}
            strokeWidth={1.5}
            className="
              mr-3
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
            type={actualType}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className={`
              min-w-0
              flex-1
              border-0
              bg-transparent
              text-[12px]
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
                ml-2
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                text-[var(--color-primary)]
                transition-colors
                hover:opacity-80
              "
            >
              {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <p
            role="alert"
            className="
              mt-1
              px-1
              text-[10px]
              leading-3
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
