import type { Locale } from "@/i18n/routing";

/**
 * ISO codes, spelled out.
 *
 * `Entry.country` and `Participant.country` are ISO 3166-1 alpha-2, and
 * `Juror.languages` are ISO 639-1 — the right shape for a record and the wrong
 * shape for a reader. Since 2026-08-25 no abbreviation a reader has to decode
 * stands on a finished page (§1.3 `[map-update]`), so `TN` renders as Tunisia
 * and `ar` as Arabic.
 *
 * **`Intl.DisplayNames`, not a lookup table.** A hardcoded map would need every
 * country twice, in English and in Arabic, maintained by hand and wrong the day
 * the client enters from somewhere it does not list. The platform already holds
 * both translations of every region and language on earth, and it holds them in
 * the locale the page is being read in.
 *
 * An unknown code falls back to itself rather than throwing: a record with a
 * bad country still renders, and it renders visibly wrong, which is what a
 * fixture error should do.
 */

const cache = new Map<string, Intl.DisplayNames>();

function displayNames(locale: Locale, type: "region" | "language"): Intl.DisplayNames {
  const key = `${locale}:${type}`;
  let found = cache.get(key);
  if (!found) {
    found = new Intl.DisplayNames([locale], { type, fallback: "code" });
    cache.set(key, found);
  }
  return found;
}

/** "TN" → "Tunisia" / "تونس". */
export function countryName(code: string, locale: Locale): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return code;
  try {
    return displayNames(locale, "region").of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** "ar" → "Arabic" / "العربية". */
export function languageName(code: string, locale: Locale): string {
  try {
    return displayNames(locale, "language").of(code.toLowerCase()) ?? code;
  } catch {
    return code;
  }
}
