/**
 * The canonical origin.
 *
 * Structured data needs absolute URLs, and a relative one in an @id makes the
 * graph unresolvable. Set NEXT_PUBLIC_SITE_URL per environment; the fallback is
 * the client's live domain so a build without it is still correct in production
 * rather than silently emitting localhost into a search index.
 *
 * The locale root layout uses the same value as `metadataBase`, so canonical
 * and Open Graph URLs resolve against the active deployment origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gridliners.com"
).replace(/\/$/, "");
