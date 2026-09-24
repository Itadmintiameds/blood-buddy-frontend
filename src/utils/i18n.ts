import { translations, type Language } from "@/translations/translations";

function lookup(language: string, key: string): string | null {
  let current: unknown = (translations as Record<string, unknown>)[language];

  for (const part of key.split(".")) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return typeof current === "string" ? current : null;
}

// Resolve a translation, falling back to English when the active language has
// no entry for this key (e.g. a newly added language without a full block).
// Returns the raw key only if English is missing it too.
export function resolveTranslation(language: Language, key: string): string {
  return lookup(language, key) ?? lookup("en", key) ?? key;
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
