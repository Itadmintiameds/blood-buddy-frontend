"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          h-[36px]
          items-center
          gap-1.5
          rounded-[6px]
          border
          border-[var(--color-border)]
          bg-white
          px-3
          text-[12px]
          text-[var(--color-text-body)]
          transition
          hover:bg-[#f8f8f8]
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

      {open && (
        <div
          role="listbox"
          className="
            absolute
            right-0
            top-full
            z-[100]
            mt-2
            w-[180px]
            overflow-hidden
            rounded-[8px]
            border
            border-[#e5e5e5]
            bg-white
            p-1
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
          "
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
              rounded-[6px]
              px-3
              py-2.5
              text-left
              text-[12px]
              text-[var(--color-text-body)]
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
              rounded-[6px]
              px-3
              py-2.5
              text-left
              text-[12px]
              text-[var(--color-text-body)]
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
