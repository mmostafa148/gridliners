import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FinalistsYear } from "@/components/marketing/finalists-year";
import { finalistYears, yearShortlist } from "@/lib/finalists";

/**
 * Finalists, for one named year.
 *
 * The shortlist: every entry that cleared its own tier's jury threshold, filed
 * in the groups it will actually be ranked inside. Nothing here is ranked, and
 * during voting nothing may be - the ordering of a group by vote count *is* the
 * proposed ranking, and §1.1 requires an Admin review before any of that is
 * published. `lib/finalists.ts` holds that rule so the two finalists routes
 * cannot drift apart on it.
 *
 * Medals, podiums, honorary designations and withheld awards are 1.7 Winners.
 * This page never calls `api.results`, which is the cheapest way to be certain.
 *
 * **The app's first dynamic route.** Every year that has a shortlist is
 * prerendered; anything else - an unknown year, a non-numeric segment, a cycle
 * that has published nothing yet - falls through to the localized 404.
 *
 * A server component calling `api.*` directly, like the other public screens:
 * Phase 1 is SEO-critical, so the shortlist belongs in the HTML rather than
 * arriving after hydration.
 *
 * `/projects/[slug]` is a deliberate carry-forward: every card points there and
 * it resolves to the localized 404 until 1.8, exactly as `/jury-panel` did
 * before 1.5.
 */

export async function generateStaticParams() {
  const years = await finalistYears();
  return years.map(({ cycle }) => ({ year: String(cycle.year) }));
}

/** The segment as a year, or null if it is not one. */
function parseYear(raw: string): number | null {
  // Strict: `2026x` and `02026` are not this page, and `Number()` would take
  // both. A year is four digits and nothing else.
  if (!/^\d{4}$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; year: string }>;
}): Promise<Metadata> {
  const { locale, year } = await params;
  // The object form, and named apart from the page body's translator:
  // check-messages binds one namespace per variable name per file.
  const tMeta = await getTranslations({ locale, namespace: "finalists.meta" });

  return {
    title: tMeta("title", { year }),
    description: tMeta("description", { year }),
  };
}

export default async function FinalistsYearPage({
  params,
}: {
  params: Promise<{ locale: string; year: string }>;
}) {
  const { locale, year: rawYear } = await params;
  setRequestLocale(locale);

  const year = parseYear(rawYear);
  if (year === null) notFound();

  const shortlist = await yearShortlist(year);
  if (!shortlist) notFound();

  return <FinalistsYear shortlist={shortlist} />;
}
