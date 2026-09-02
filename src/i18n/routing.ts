import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Text direction per locale. Arabic mirrors every screen. */
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/** Names shown in the language switcher, each in its own script. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so /en and /ar are both real, indexable URLs.
  localePrefix: "always",
});

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale) {
  return localeDirection[locale];
}
