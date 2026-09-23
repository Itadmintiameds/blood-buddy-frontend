"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Language } from "@/translations/translations";
import { interpolate, resolveTranslation } from "@/utils/i18n";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "bloodBuddyLanguage";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (savedLanguage === "en" || savedLanguage === "kn") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of saved language from localStorage on mount
      setLanguageState(savedLanguage);
    }

    setMounted(true);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);

    window.localStorage.setItem(STORAGE_KEY, newLanguage);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return interpolate(resolveTranslation(language, key), params);
  };

  useEffect(() => {
    document.documentElement.lang = language === "kn" ? "kn" : "en";
  }, [language]);

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
