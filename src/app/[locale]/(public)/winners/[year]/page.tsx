import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { WinnersYear } from "@/components/marketing/winners-year";
import { api } from "@/lib/api";
import { yearWinners } from "@/lib/winners";

/**
 * Winners, for one named year.
 *
 * The first screen allowed to publish an awarded level. `lib/winners.ts` reads
 * `api.results.published` and nothing else, so only finalized rows can reach
 * here - 2026's 362 proposed rows are all `finalized: false` and are invisible
 * to this route by construction rather than by filtering downstream.
 *
 * **Every cycle year is prerendered, including one with no results.** 2026 is a
 * real edition whose shortlist is public and whose rankings are proposed only;
 * `/winners/2026` says that and points at the finalists rather than 404ing a
 * year that plainly exists. `phasePresentation` will link exactly that URL the
 * moment the cycle reaches `results`, so it has to be a real page before then.
 * Anything that is not a cycle year falls through to the localized 404.
 *
 * A server component calling `api.*` directly, like the other public screens:
 * Phase 1 is SEO-critical, so results belong in the HTML rather than arriving
 * after hydration.
 *
 * `/awards/[resultId]` is a deliberate carry-forward: every place links there
 * and it resolves to the localized 404 until Phase 3.1, exactly as
 * `/projects/[slug]` does from 1.6 until 1.8.
 */

export async function generateStaticParams() {
  const cycles = await api.cycles.list();
  return cycles.map((cycle) => ({ year: String(cycle.year) }));
}

/** The segment as a year, or null if it is not one. */
function parseYear(raw: string): number | null {
  // Strict: `2025x` and `02025` are not this page, and `Number()` would take
  // both. A year is four digits and nothing else.
  if (!/^\d{4}$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; year: string }>;
}): Promise<Metadata> {
  const { locale, year: raw } = await params;
  const tMeta = await getTranslations({ locale, namespace: "winners.meta" });
  const year = parseYear(raw);

  return {
    title: year ? tMeta("title", { year }) : tMeta("titleFallback"),
    description: tMeta("description"),
  };
}

export default async function WinnersYearPage({
  params,
}: {
  params: Promise<{ locale: string; year: string }>;
}) {
  const { locale, year: raw } = await params;
  setRequestLocale(locale);

  const year = parseYear(raw);
  if (year === null) notFound();

  const winners = await yearWinners(year);
  if (!winners) notFound();

  return <WinnersYear winners={winners} />;
}
