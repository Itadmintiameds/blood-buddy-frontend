// Single source of truth for the languages the app offers.
//
// Add a language by appending an entry here plus a matching translation block
// in src/translations/translations.ts. Everything else — the Language type, the
// selector UI, storage validation and the <html lang> attribute — derives from
// this list automatically.
export const LANGUAGES = [
  { code: "en", label: "EN", native: "English", fontClass: "" },
  { code: "kn", label: "ಕ", native: "ಕನ್ನಡ", fontClass: "font-kannada" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: Language = "en";

// The selector renders a dropdown once the language count reaches this many,
// and a compact segmented toggle below it. Set to 2 so the dropdown shows
// even with just English + Kannada; raise it to switch to the toggle.
export const DROPDOWN_THRESHOLD = 2;

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    LANGUAGES.some((entry) => entry.code === value)
  );
}
