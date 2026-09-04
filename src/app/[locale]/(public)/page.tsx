import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { CycleHero } from "@/components/marketing/cycle-hero";
import { FeaturedWinner } from "@/components/marketing/featured-winner";
import { JuryHighlights } from "@/components/marketing/jury-highlights";
import { NewsInsights } from "@/components/marketing/news-insights";
import { BecomePartner } from "@/components/marketing/become-partner";
import { PartnersStrip } from "@/components/marketing/partners-strip";
import { QuickNavigate } from "@/components/marketing/quick-navigate";
import { Testimonials } from "@/components/marketing/testimonials";
import { api } from "@/lib/api";
import { latestPublishedCycle } from "@/lib/cycle-phase";

/**
 * Home.
 *
 * A server component calling `api.*` directly rather than going through
 * TanStack Query: Phase 1 is SEO-critical, so the content has to be in the
 * HTML rather than fetched after hydration. Query stays for the interactive
 * app screens.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [tCommon, tHero] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "home.hero" }),
  ]);
  const cycle = await api.cycles.getActive();

  return {
    // absolute, or the layout's `%s · Gridliners Awards` template renders the
    // home page as "Gridliners Awards · Gridliners Awards".
    title: { absolute: tCommon("siteName") },
    description: tHero(`${cycle.phase}.body`),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tClosing, cycle, cycles, parentCategories, subCategories, jurors] =
    await Promise.all([
      getTranslations("home.closing"),
      api.cycles.getActive(),
      api.cycles.list(),
      api.taxonomy.parentCategories(),
      api.taxonomy.subCategories(),
      api.jury.jurors(),
    ]);

  // Live figures for the hero. Cadets and groups come from the active cycle's
  // shortlisted entries, which is what public voting is actually ranking.
  const [cadets, activeResults] = await Promise.all([
    api.entries.list({ cycleId: cycle.id, states: ["shortlisted"] }),
    api.results.all(cycle.id),
  ]);
  const groupCount = new Set(
    activeResults.map((r) => `${r.subCategoryId}|${r.tier}`),
  ).size;

  // "Latest winners" is the newest cycle with FINALIZED results — never the
  // active one, whose rankings are still proposed and unreviewed (§1.1).
  const publishedByCycle = new Map(
    await Promise.all(
      cycles.map(
        async (c) => [c.id, await api.results.published(c.id)] as const,
      ),
    ),
  );
  const winnersCycle = latestPublishedCycle(cycles, (id) =>
    Boolean(publishedByCycle.get(id)?.length),
  );

  // Two complete podiums rather than four golds from four groups. Showing
  // Gold, Silver and Bronze side by side inside one Sub-category x Tier is the
  // clearest possible demonstration that ranking happens within a group — and
  // it varies the artwork, since four gold frames in a row read as one image
  // repeated.
  const publishedWins = (
    publishedByCycle.get(winnersCycle?.id ?? "") ?? []
  ).filter((r) => !r.withheld && r.level !== "did_not_place");
  const podiums = new Map<string, typeof publishedWins>();
  for (const result of publishedWins) {
    const key = `${result.subCategoryId}|${result.tier}`;
    podiums.set(key, [...(podiums.get(key) ?? []), result]);
  }
  // Kept as groups rather than flattened. The section renders a podium per
  // group, and flattening then deduplicating was what previously made the same
  // coordinate appear twice with no indication they were one contest.
  const winningPodiums = [...podiums.values()]
    .map((group) => [...group].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)))
    .sort((a, b) => b[0].votes - a[0].votes)
    .slice(0, 2);
  const winningResults = winningPodiums.flat();

  // Seven wins and the honorary sheet: eight cards, four in view.
  //
  // Ordered by group, strongest first, then by rank inside it, so the track
  // reads Gold, Silver, Bronze of one contest before moving to the next.
  //
  // Photography repeats across the set. There is one winner shot per level and
  // the certificate inside it names that level, so every gold card carries the
  // gold photograph. That is the supplied set doing what it can until the
  // client's own coverage lands.
  const groupKey = (r: (typeof publishedWins)[number]) =>
    `${r.subCategoryId}|${r.tier}`;
  const groupTop = new Map<string, number>();
  for (const r of publishedWins) {
    groupTop.set(
      groupKey(r),
      Math.max(groupTop.get(groupKey(r)) ?? 0, r.votes),
    );
  }
  const featuredWins = [...publishedWins]
    .sort((a, b) => {
      const byGroup =
        (groupTop.get(groupKey(b)) ?? 0) - (groupTop.get(groupKey(a)) ?? 0);
      if (byGroup !== 0) return byGroup;
      if (groupKey(a) !== groupKey(b))
        return groupKey(a).localeCompare(groupKey(b));
      return (a.rank ?? 99) - (b.rank ?? 99);
    })
    .slice(0, 7)
    .map((result) => ({ result }));

  const featuredResults = featuredWins.map((w) => w.result);

  const winningEntries = new Map(
    (
      await Promise.all(
        // The featured posters draw from every published win, not only the two
        // podiums this map was first built for. Fetching the podiums alone left
        // the bronze poster with no entry to resolve and it silently vanished.
        [
          ...new Set(
            [...winningResults, ...featuredResults].map((r) => r.entryId),
          ),
        ].map((id) => api.entries.getById(id)),
      )
    )
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .map((entry) => [entry.id, entry]),
  );
  const subCategoryById = new Map(subCategories.map((sub) => [sub.id, sub]));

  // The winners page has carried the maker's name under every title since 2023,
  // so the section needs participants, not just entries.
  const [news, partners, testimonials] = await Promise.all([
    // No limit here: the section splits the list into two columns and
    // decides how many of each it shows.
    api.content.news(),
    api.content.partners(),
    api.content.testimonials(),
  ]);

  // The fourth sheet: the cycle's first published honorary designation.
  const honorary = winnersCycle
    ? (await api.results.honorary(winnersCycle.id))[0]
    : undefined;

  const creatorById = new Map(
    (await api.participants.list()).map((p) => [p.id, p.name] as const),
  );

  return (
    <>
      <CycleHero
        cycle={cycle}
        stats={[
          { value: cadets.length, labelKey: "cadets" },
          { value: groupCount, labelKey: "groups" },
          { value: subCategories.length, labelKey: "subCategories" },
          { value: jurors.length, labelKey: "jurors" },
        ]}
      />

      {/* The sitemap's order, below the hero. */}
      {featuredWins.length ? (
        <FeaturedWinner
          honorary={honorary}
          year={winnersCycle?.year ?? cycle.year}
          wins={featuredWins.flatMap(({ result }) => {
            const entry = winningEntries.get(result.entryId);
            return entry
              ? [
                  {
                    result,
                    entry,
                    subCategory: subCategoryById.get(result.subCategoryId),
                    creator: creatorById.get(entry.participantId),
                  },
                ]
              : [];
          })}
        />
      ) : null}

      <QuickNavigate />

      <NewsInsights items={news} />

      {/* The whole cohort: the track shows four at a time and carries the
          rest, where the grid it replaced could only ever hold a row. */}
      <JuryHighlights jurors={jurors} parentCategories={parentCategories} />

      <PartnersStrip partners={partners} />

      {/* The ask, straight after the people who already said yes. */}
      <BecomePartner />

      <Testimonials items={testimonials} />

      {/* The last word before the footer. The action is the cycle's, from the
          same phasePresentation the header rail and the phone menu read, so
          the page cannot close by asking for something the header is not.
          No countdown: the hero's readout counted this same deadline down at
          the top of the page, and saying it twice makes neither one urgent. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove={testimonials.length ? "bg-navy-950" : "bg-mist"}
      />
    </>
  );
}
