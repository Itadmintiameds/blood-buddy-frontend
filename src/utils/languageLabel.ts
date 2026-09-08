import { translations, Language } from "@/translations/translations";

export function getBilingualLabel(
  section: keyof typeof translations.en,
  key: string,
  language: Language,
) {
  const english =
    (translations.en[section] as Record<string, string>)[key] ?? key;

  if (language === "en") {
    return english;
  }

  const kannada = (translations.kn[section] as Record<string, string>)[key];

  if (!kannada) {
    return english;
  }

  return `${english}/${kannada}`;
}
