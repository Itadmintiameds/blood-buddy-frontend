"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  DROPDOWN_THRESHOLD,
  LANGUAGES,
  type Language,
} from "@/config/languages";
import { useExitTransition } from "@/app/hooks/useExitTransition";

// Lives on the primary-red BrandHeader bar. Renders a compact segmented
// toggle for 2–3 languages, and automatically switches to a dropdown once
// there are enough languages that a toggle would overflow the header.
export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  if (LANGUAGES.length >= DROPDOWN_THRESHOLD) {
    return <LanguageDropdown language={language} setLanguage={setLanguage} />;
  }

  return <LanguageToggle language={language} setLanguage={setLanguage} />;
}

interface Props {
  language: Language;
  setLanguage: (language: Language) => void;
}

function LanguageToggle({ language, setLanguage }: Props) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/25 bg-white/15 p-0.5"
    >
      {LANGUAGES.map((lang) => {
        const active = language === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            aria-pressed={active}
            className={`${lang.fontClass} rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:text-[12px] ${
              active
                ? "bg-white text-[var(--color-primary)] shadow-sm"
                : "text-white/90 hover:text-white"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

function LanguageDropdown({ language, setLanguage }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { rendered, visible } = useExitTransition(open, 150);

  const current =
    LANGUAGES.find((lang) => lang.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="
          flex
          h-9
          items-center
          gap-1.5
          rounded-full
          border
          border-white/25
          bg-white/15
          px-3
          text-[12px]
          font-semibold
          text-white
          transition-colors
          hover:bg-white/25
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/60
        "
      >
        <Globe size={15} strokeWidth={1.8} />

        <span className={current.fontClass}>{current.native}</span>

        <ChevronDown
          size={14}
          strokeWidth={2}
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        />
      </button>

      {rendered && (
        <div
          role="listbox"
          style={{ transformOrigin: "top right" }}
          className={`
            motion-surface
            absolute
            right-0
            top-full
            z-[100]
            mt-2
            w-[210px]
            overflow-hidden
            rounded-xl
            border
            border-[var(--color-border-lighter)]
            bg-white
            p-1.5
            shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            transition-[transform,opacity]
            duration-150
            ${
              visible
                ? "scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
                : "scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
            }
          `}
        >
          {LANGUAGES.map((lang) => {
            const active = language === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--color-surface-hover)] ${
                  active ? "bg-[var(--color-surface-hover)]" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                      active
                        ? "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]"
                    } ${lang.fontClass}`}
                  >
                    {lang.label}
                  </span>

                  <span
                    className={`truncate text-[13px] ${
                      active
                        ? "font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text-body)]"
                    } ${lang.fontClass}`}
                  >
                    {lang.native}
                  </span>
                </span>

                {active && (
                  <Check
                    size={15}
                    strokeWidth={2.4}
                    className="shrink-0 text-[var(--color-primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
