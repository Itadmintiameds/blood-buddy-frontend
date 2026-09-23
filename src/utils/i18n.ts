import { translations, type Language } from "@/translations/translations";

export function resolveTranslation(language: Language, key: string): string {
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

export function interpolate(
  text: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return text;
  }

  return text.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in params ? String(params[token]) : match,
  );
}
