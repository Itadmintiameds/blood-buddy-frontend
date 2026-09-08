"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { translations, type Language } from "@/translations/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "bloodBuddyLanguage";

function getTranslation(language: Language, key: string): string {
  const keys = key.split(".");

  let current: unknown = translations[language];

  for (const part of keys) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  return typeof current === "string" ? current : key;
}

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

  const t = (key: string) => {
    return getTranslation(language, key);
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
