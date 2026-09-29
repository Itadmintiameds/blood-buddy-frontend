"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useLanguage } from "@/contexts/LanguageContext";
import { interpolate, resolveTranslation } from "@/utils/i18n";

/**
 * When this context is true, Bilingual components always render BOTH languages
 * at once (English + Kannada) regardless of the selected language, and the
 * language toggle only controls which one is shown as the primary line. Off by
 * default; turned on for a route subtree via <DualLanguageProvider> (see the
 * donor/recipient layouts).
 */
const DualLanguageContext = createContext(false);

export function DualLanguageProvider({ children }: { children: ReactNode }) {
  return (
    <DualLanguageContext.Provider value={true}>
      {children}
    </DualLanguageContext.Provider>
  );
}

export function useDualLanguage() {
  return useContext(DualLanguageContext);
}

type BilingualTag =
  | "span"
  | "div"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "li"
  | "legend";

interface BilingualProps {
  /** Dot-path translation key, e.g. "welcome.title". */
  tKey: string;
  params?: Record<string, string | number>;
  as?: BilingualTag;
  className?: string;
  /** Overrides the default small/muted styling of the English sub-line (Kannada mode only). */
  enClassName?: string;
  id?: string;
  /** Passed through when `as="label"`. */
  htmlFor?: string;
  style?: CSSProperties;
}

function useBilingualStrings(
  tKey: string,
  params?: Record<string, string | number>,
) {
  const en = interpolate(resolveTranslation("en", tKey), params);
  const knRaw = resolveTranslation("kn", tKey);
  const kn = knRaw === tKey ? en : interpolate(knRaw, params);

  return { en, kn };
}

/**
 * Renders translated text. In English mode this is a single line, identical
 * to plain text. In Kannada mode it renders Kannada on top and English
 * below it in a smaller, muted line.
 */
export function Bilingual({
  tKey,
  params,
  as = "span",
  className,
  enClassName,
  id,
  htmlFor,
  style,
}: BilingualProps) {
  const { language } = useLanguage();
  const dual = useDualLanguage();
  const { en, kn } = useBilingualStrings(tKey, params);
  const Tag = as;

  // Show both lines when Kannada is the active language, or always in dual mode
  // (unless there's no distinct Kannada translation for this key).
  const showBoth = kn !== en && (dual || language === "kn");

  if (!showBoth) {
    return (
      <Tag id={id} htmlFor={htmlFor} className={className} style={style}>
        {language === "kn" ? kn : en}
      </Tag>
    );
  }

  const knPrimary = language === "kn";
  const primary = knPrimary ? kn : en;
  const secondary = knPrimary ? en : kn;

  return (
    <Tag id={id} htmlFor={htmlFor} className={className} style={style}>
      <span className={`block${knPrimary ? " font-kannada" : ""}`}>
        {primary}
      </span>
      <span
        className={`${
          enClassName ??
          "mt-0.5 block text-[0.68em] font-normal leading-tight text-[var(--color-text-muted)]"
        }${knPrimary ? "" : " font-kannada"}`}
      >
        {secondary}
      </span>
    </Tag>
  );
}

/**
 * Same as Bilingual, but for spots that already have their own JSX and just
 * need the two lines dropped in (e.g. inside a button that also renders an
 * icon). Renders a fragment instead of a wrapper tag.
 */
export function BilingualInline({
  tKey,
  params,
  enClassName,
}: Pick<BilingualProps, "tKey" | "params" | "enClassName">): ReactNode {
  const { language } = useLanguage();
  const dual = useDualLanguage();
  const { en, kn } = useBilingualStrings(tKey, params);

  const showBoth = kn !== en && (dual || language === "kn");

  if (!showBoth) {
    return language === "kn" ? kn : en;
  }

  const knPrimary = language === "kn";
  const primary = knPrimary ? kn : en;
  const secondary = knPrimary ? en : kn;

  return (
    <span className="inline-flex flex-col">
      <span className={knPrimary ? "font-kannada" : undefined}>{primary}</span>
      <span
        className={`${
          enClassName ??
          "mt-0.5 text-[0.68em] font-normal leading-tight text-[var(--color-text-muted)]"
        }${knPrimary ? "" : " font-kannada"}`}
      >
        {secondary}
      </span>
    </span>
  );
}

/**
 * For HTML-attribute-only strings (placeholder, aria-label, title="") that
 * can't be rendered as two lines. Returns plain English in English mode, or
 * a single-line "Kannada (English)" combination in Kannada mode.
 */
export function useBilingualText(
  tKey: string,
  params?: Record<string, string | number>,
): string {
  const { language } = useLanguage();
  const dual = useDualLanguage();
  const { en, kn } = useBilingualStrings(tKey, params);

  if (kn === en) {
    return en;
  }

  if (!dual && language === "en") {
    return en;
  }

  // Primary language first, other language in parentheses.
  return language === "kn" ? `${kn} (${en})` : `${en} (${kn})`;
}
