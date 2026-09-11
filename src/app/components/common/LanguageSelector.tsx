"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { useExitTransition } from "@/app/hooks/useExitTransition";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { rendered, visible } = useExitTransition(open, 150);

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

  const selectEnglish = () => {
    setLanguage("en");
    setOpen(false);
  };

  const selectKannada = () => {
    setLanguage("kn");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="
          flex
          h-10
          items-center
          gap-1.5
          rounded-lg
          border
          border-[var(--color-border)]
          bg-white
          px-3.5
          text-[13px]
          text-[var(--color-text-body)]
          transition-all
          duration-200
          hover:border-[#c7c7c7]
          hover:bg-[var(--color-surface-hover)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[var(--color-primary)]
        "
      >
        <Languages size={15} strokeWidth={1.7} />

        <span>{language === "kn" ? "English / ಕನ್ನಡ" : "English"}</span>

        <ChevronDown
          size={14}
          strokeWidth={1.7}
          className={open ? "rotate-180 transition" : "transition"}
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
            w-[190px]
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
          <button
            type="button"
            role="option"
            aria-selected={language === "en"}
            onClick={selectEnglish}
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              px-3
              py-2.5
              text-left
              text-[13px]
              text-[var(--color-text-body)]
              transition-colors
              hover:bg-[var(--color-surface-hover)]
            "
          >
            <span>English</span>

            {language === "en" && (
              <span className="text-[var(--color-primary)]">✓</span>
            )}
          </button>

          <button
            type="button"
            role="option"
            aria-selected={language === "kn"}
            onClick={selectKannada}
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              px-3
              py-2.5
              text-left
              text-[13px]
              text-[var(--color-text-body)]
              transition-colors
              hover:bg-[var(--color-surface-hover)]
            "
          >
            <span>Kannada / ಕನ್ನಡ</span>

            {language === "kn" && (
              <span className="text-[var(--color-primary)]">✓</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
