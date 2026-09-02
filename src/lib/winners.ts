import { api } from "@/lib/api";
import type {
  Cycle,
  Entry,
  GroupResult,
  HonoraryDesignation,
  SubCategory,
  Tier,
} from "@/lib/api/types";
import { TIERS } from "@/lib/api/types";
import { projectCovers } from "@/lib/media";

/**
 * One year's winners, resolved once on the server.
 *
 * **The publication boundary is `api.results.published`, and nothing else.**
 * `mock.ts` filters it to `finalized === true`, which is the only thing keeping
 * 2026's proposed rankings off a public page: that cycle is still in `voting`,
 * its 362 rows exist, and every one of them is `finalized: false`. `results.all`
 * is Admin-only and is never called from here or from anything this file feeds.
 *
 * **What is loaded is deliberately narrower than what is stored.** A
 * `GroupResult` carries `tiebreakTrace` and `withheldReason`, and both are
 * disclosure risks rather than merely unused: the trace spells out jury scores
 * verbatim ("Jury final score 88.4 vs 84.1"), and the reason is admin audit text
 * (Addendum §60). Neither is copied into the view model below, so a component
 * cannot render one by reaching for a field it happens to have.
 *
 * **A non-placer is not a winner, and neither is a withheld place.** Finalized
 * groups keep their `did_not_place` rows - the 2025 Brand Identity Redesign
 * group has one - and they are dropped here rather than in a component, so no
 * screen has to remember to.
 *
 * **The withheld row is dropped with them, and that is a correction.** 1.7 was
 * planned and built to publish it as an explicit "no medal awarded" state. That
 * was wrong on the rules and wrong on the page. Addendum §36 says a withheld
 * medal is "simply not awarded" - the award does not exist, so a page whose
 * subject is the winners has nothing to publish. This build had already settled
 * it too: `mock.ts:417` defines an entry as a winner when it holds a result
 * "finalized and not withheld (§3.1 / §3.7)", and `winnerSummary` filters on
 * exactly that. And §60 files medal withholding in the **admin audit log**,
 * with actor, timestamp and reason - which is not the register of a public
 * announcement.
 *
 * What the built version did instead was publish a negative fact about a named
 * entrant on the winners page, and invent a fourth level on a page that has
 * three.
 */

/** One awarded place inside a group. */
export interface WinnerView {
  resultId: string;
  entryId: string;
  slug: string;
  title: string;
  contentLanguage: Entry["contentLanguage"];
  /** ISO 3166-1 alpha-2. Named by the caller, which knows the locale. */
  countryCode: string;
  /** The group this medal was won in. On the card, since it is no longer a
   *  heading above it. */
  subCategory: SubCategory;
  /**
   * The project's frame, or null.
   *
   * `EntryMedia.coverUrl` points into `/placeholders`, a directory that does not
   * exist, so a real cover is one that does not. Until the client supplies
   * entrant photography a frame comes from `projectCovers` - the CC0 pool
   * grouped by parent category - chosen by the entry's own slug so a project
   * keeps the same frame on every render.
   */
  cover: string | null;
  maker: string | null;
  description: string;
  /** Gold, silver or bronze. There is no fourth. */
  level: "gold" | "silver" | "bronze";
  rank: number;
  votes: number;
}

/**
 * One award level inside one tier.
 *
 * The page groups by level rather than by group heading (§1.7 `[map-update]`,
 * 2026-08-28). The group a medal was won in has not changed - it is still
 * `sub-category × tier`, and each place carries its own sub-category name so
 * the group is stated on the card instead of above it.
 */
export interface WinnerLevelView {
  level: "gold" | "silver" | "bronze";
  places: WinnerView[];
}

export interface WinnerTierView {
  tier: Tier;
  /** Gold, silver, bronze. Only the levels this tier actually awarded. */
  levels: WinnerLevelView[];
  medalCount: number;
  groupCount: number;
}

export interface YearWinners {
  cycle: Cycle;
  tiers: WinnerTierView[];
  /** Medals conferred. A withheld place is not counted. */
  medalCount: number;
  groupCount: number;
  honorary: HonoraryDesignation[];
}

/** Cycle years that have at least one published result, newest first. */
export async function winnerYears(): Promise<{ cycle: Cycle; medalCount: number }[]> {
  const cycles = await api.cycles.list();

  const counted = await Promise.all(
    cycles.map(async (cycle) => {
      const published = await api.results.published(cycle.id);
      return {
        cycle,
        medalCount: published.filter(isMedal).length,
      };
    }),
  );

  return counted
    .filter((row) => row.medalCount > 0)
    .sort((a, b) => b.cycle.year - a.cycle.year);
}

/**
 * The newest year whose results are published.
 *
 * What `/winners` opens on. `latestPublishedCycle` in `lib/cycle-phase.ts`
 * answers the same question for Home's featured winners; this returns the year
 * rather than the cycle, which is what a route needs.
 */
export async function latestWinnerYear(): Promise<number | null> {
  const years = await winnerYears();
  return years[0]?.cycle.year ?? null;
}

/**
 * One year's winners, or null when that year is not a cycle at all.
 *
 * A cycle with no published results returns a `YearWinners` with empty tiers
 * rather than null - 2026 is a real year with a real shortlist whose results
 * are simply not out, and its page says so. Only an unknown year is null, and
 * the route turns that into the localized 404.
 */
export async function yearWinners(year: number): Promise<YearWinners | null> {
  const cycle = await api.cycles.getByYear(year);
  if (!cycle) return null;

  const [published, honorary, subCategories, parents, entries, participants] =
    await Promise.all([
      api.results.published(cycle.id),
      api.results.honorary(cycle.id),
      api.taxonomy.subCategories(),
      api.taxonomy.parentCategories(),
      api.entries.list({ cycleId: cycle.id }),
      api.participants.list(),
    ]);

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const makerById = new Map(participants.map((p) => [p.id, p.name]));
  const subById = new Map(subCategories.map((sub) => [sub.id, sub]));

  // Taxonomy order: parent first, then the sub-category's position inside it -
  // the same sequence Categories publishes, so the seven parents are met in one
  // order across the site.
  const parentOrder = new Map(parents.map((parent) => [parent.id, parent.order]));
  const subRank = new Map(
    [...subCategories]
      .sort(
        (a, b) =>
          (parentOrder.get(a.parentId) ?? 0) - (parentOrder.get(b.parentId) ?? 0) ||
          a.order - b.order,
      )
      .map((sub, i) => [sub.id, i]),
  );

  // Medals only. `did_not_place` is a competitor who did not place and
  // `withheld` is a medal that was never conferred, and neither is a result
  // this page publishes.
  const awarded = published.filter(isMedal);

  const byGroup = new Map<string, GroupResult[]>();
  for (const row of awarded) {
    const key = `${row.subCategoryId}::${row.tier}`;
    byGroup.set(key, [...(byGroup.get(key) ?? []), row]);
  }

  // Internal only: results are gathered by their real group so rank order and
  // taxonomy order are correct, then regrouped by level for the page.
  const groups: {
    subCategoryId: string;
    tier: Tier;
    places: WinnerView[];
  }[] = [];
  for (const [key, rows] of byGroup) {
    const [subCategoryId, tier] = key.split("::") as [string, Tier];
    const subCategory = subById.get(subCategoryId);
    if (!subCategory) continue;

    const places = rows
      .slice()
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
      .map((row) => toWinner(row, entryById, makerById, subCategory))
      .filter((place): place is WinnerView => place !== null);
    if (!places.length) continue;

    groups.push({ subCategoryId, tier, places });
  }

  groups.sort(
    (a, b) => (subRank.get(a.subCategoryId) ?? 0) - (subRank.get(b.subCategoryId) ?? 0),
  );

  // All three tiers, always, in the model's own order. A tier a year awarded
  // nothing in is an empty section rather than an absent one: the separation is
  // the statement, and a year that awarded no student medals has to say so.
  const LEVELS = ["gold", "silver", "bronze"] as const;

  const tiers: WinnerTierView[] = TIERS.map((tier) => {
    const own = groups.filter((group) => group.tier === tier);
    // Flattened, then regrouped by level. Within a level the places keep
    // taxonomy order, which is the order the groups were sorted into above -
    // so Gold reads down the categories in the same sequence Silver does.
    const places = own.flatMap((group) => group.places);

    const levels: WinnerLevelView[] = LEVELS.map((level) => ({
      level,
      places: places.filter((place) => place.level === level),
    })).filter((row) => row.places.length > 0);

    return {
      tier,
      levels,
      medalCount: places.length,
      // Groups that actually produced a medal. A group whose only entrant had
      // their medal withheld awarded nothing and is not counted, which is the
      // same rule the tier's own medal count follows.
      groupCount: own.length,
    };
  });

  return {
    cycle,
    tiers,
    medalCount: tiers.reduce((n, tier) => n + tier.medalCount, 0),
    groupCount: groups.length,
    honorary,
  };
}

/** Gold, silver or bronze, actually conferred. */
function isMedal(row: GroupResult): boolean {
  return row.level !== "did_not_place" && !row.withheld;
}

/**
 * A real cover, or a pooled placeholder for the entry's parent category.
 *
 * The same resolution the shortlist uses, for the same reason: rendering the
 * fixtures' `/placeholders` path would fire a request at a file that is not
 * there. The pool is keyed by parent, so a photography winner gets a
 * photography frame.
 */
function coverFor(entry: Entry, parentId: string): string | null {
  const url = entry.media.coverUrl;
  if (url && !url.startsWith("/placeholders/")) return url;

  const pool = projectCovers[parentId];
  if (!pool?.length) return null;
  let h = 2166136261;
  for (let i = 0; i < entry.slug.length; i++) {
    h ^= entry.slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return pool[(h >>> 0) % pool.length].src;
}

function toWinner(
  row: GroupResult,
  entryById: Map<string, Entry>,
  makerById: Map<string, string>,
  subCategory: SubCategory,
): WinnerView | null {
  const entry = entryById.get(row.entryId);
  if (!entry) return null;

  return {
    resultId: row.id,
    entryId: row.entryId,
    slug: entry.slug,
    title: entry.title,
    contentLanguage: entry.contentLanguage,
    countryCode: entry.country,
    cover: coverFor(entry, subCategory.parentId),
    subCategory,
    maker: makerById.get(entry.participantId) ?? null,
    description: entry.description,
    level: row.level as "gold" | "silver" | "bronze",
    rank: row.rank ?? 0,
    votes: row.votes,
  };
}
