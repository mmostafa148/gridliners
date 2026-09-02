import { api } from "@/lib/api";
import type { Cycle, Entry, ParentCategory, SubCategory, Tier } from "@/lib/api/types";
import { TIERS } from "@/lib/api/types";

/**
 * The shortlist, assembled once.
 *
 * Both finalists routes read through here — the per-year screen and the archive
 * index — so the rules that keep an undecided result undecided cannot drift
 * apart between them.
 *
 * **A finalist is an entry in state `shortlisted`.** Not a group result: during
 * voting the only group results that exist are *proposed*, and §1.1 requires an
 * Admin review before any ranking is published. `api.results` is never called
 * from here at all, which is the cheapest way to be sure nothing on a public
 * page can carry a rank, a level, a medal or a withholding.
 *
 * **A slate is `sub-category × tier`** — the key a result is actually filed
 * under (Addendum §3.1). It is the unit a finalist competes inside, so it is
 * the unit this screen publishes, named in full since the codes were retired
 * (§1.3 `[map-update]`, 2026-08-25).
 *
 * **Slates are grouped by parent inside each tier**, which is the taxonomy the
 * site teaches on Categories and the axis the page's filter acts on. A parent
 * nobody entered in a tier is absent rather than empty, the same rule slates
 * follow.
 *
 * **Order is never a standing.** Slates run in taxonomy order and finalists run
 * in slug order. Sorting by votes would publish the proposed ranking as a live
 * leaderboard, which is precisely what the Admin review before any announcement
 * exists to prevent, and it would go on being wrong on an archived year by
 * dressing the finalists page as the winners page.
 *
 * Slug, and not `entry.id`, which was the first answer and was wrong on sight.
 * The fixtures are authored group by group in descending vote order, so id
 * order rendered every multi-entry group as an exact leaderboard: the page did
 * not sort by votes and looked like nothing else. An order that carries no
 * information has to *look* like it carries none. The slug is the entry's own
 * public address, stable, identical in both locales, and unrelated to anything
 * the competition measures.
 */

/** One `sub-category × tier` group, with everything the card row needs. */
export interface Slate {
  subCategory: SubCategory;
  tier: Tier;
  finalists: Entry[];
}

/** One parent category's groups inside one tier. */
export interface ParentGroup {
  parent: ParentCategory;
  slates: Slate[];
  finalistCount: number;
}

/** One tier's whole shortlist. Present even when it holds nothing. */
export interface TierShortlist {
  tier: Tier;
  /** Grouped `parent -> sub-category`, both in taxonomy order. */
  parents: ParentGroup[];
  finalistCount: number;
  slateCount: number;
}

export interface YearShortlist {
  cycle: Cycle;
  tiers: TierShortlist[];
  finalistCount: number;
  slateCount: number;
  /** Vote totals by entry id — the aggregate, never a rank. */
  votesByEntry: Map<string, number>;
  /** Maker names by entry id, resolved from the roster. */
  makerByEntry: Map<string, string>;
}

/**
 * Every year that has a shortlist to show, newest first.
 *
 * A cycle with no shortlisted entries is not listed and has no page: a year
 * still in `configuration` or `submissions` has nothing to publish, and an
 * empty finalists page would say it does.
 */
export async function finalistYears(): Promise<{ cycle: Cycle; finalistCount: number }[]> {
  const cycles = await api.cycles.list();

  const counted = await Promise.all(
    cycles.map(async (cycle) => ({
      cycle,
      finalistCount: (
        await api.entries.list({ cycleId: cycle.id, states: ["shortlisted"] })
      ).length,
    })),
  );

  return counted
    .filter((row) => row.finalistCount > 0)
    .sort((a, b) => b.cycle.year - a.cycle.year);
}

/** The shortlist for one year, or null if that year has none. */
export async function yearShortlist(year: number): Promise<YearShortlist | null> {
  const cycle = await api.cycles.getByYear(year);
  if (!cycle) return null;

  const finalists = await api.entries.list({
    cycleId: cycle.id,
    states: ["shortlisted"],
  });
  if (!finalists.length) return null;

  const [subCategories, parents] = await Promise.all([
    api.taxonomy.subCategories(),
    api.taxonomy.parentCategories(),
  ]);

  // Taxonomy order: parent first, then the sub-category's position inside it.
  // The same order Categories publishes, so a reader meets the seven parents in
  // one sequence across the site.
  const parentOrder = new Map(parents.map((parent) => [parent.id, parent.order]));
  const orderedSubs = [...subCategories].sort(
    (a, b) =>
      (parentOrder.get(a.parentId) ?? 0) - (parentOrder.get(b.parentId) ?? 0) ||
      a.order - b.order,
  );

  // The verified tier is what the entry was actually judged in. `declaredTier`
  // is what was claimed and is never mutated by verification (§3.7), so an
  // entry that moved tiers would otherwise be filed under the wrong bar.
  const tierOf = (entry: Entry): Tier =>
    entry.verification?.verifiedTier ?? entry.declaredTier;

  const orderedParents = [...parents].sort((a, b) => a.order - b.order);
  const subById = new Map(subCategories.map((sub) => [sub.id, sub]));

  const tiers: TierShortlist[] = TIERS.map((tier) => {
    const inTier = finalists.filter((entry) => tierOf(entry) === tier);

    const slates: Slate[] = orderedSubs
      .map((subCategory) => ({
        subCategory,
        tier,
        // Slug order. See the note at the top of this file: it is deliberately
        // arbitrary with respect to everything this page could leak.
        finalists: inTier
          .filter((entry) => entry.baseSubCategoryId === subCategory.id)
          .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)),
      }))
      // An empty slate is not rendered: 23 sub-categories against three tiers
      // is 69 groups, and publishing the ones nobody entered would bury the ones
      // that matter. The tier heading publishes how many there are instead.
      .filter((slate) => slate.finalists.length > 0);

    // Parents follow the same rule as slates: a parent nobody entered in this
    // tier is not a band, it is absent. `orderedSubs` is already in parent then
    // sub order, so a parent's slates arrive together and stay that way.
    const parentGroups: ParentGroup[] = orderedParents
      .map((parent) => {
        const own = slates.filter(
          (slate) => subById.get(slate.subCategory.id)?.parentId === parent.id,
        );
        return {
          parent,
          slates: own,
          finalistCount: own.reduce((n, slate) => n + slate.finalists.length, 0),
        };
      })
      .filter((group) => group.slates.length > 0);

    return {
      tier,
      parents: parentGroups,
      finalistCount: inTier.length,
      slateCount: slates.length,
    };
  });

  const [votes, participants] = await Promise.all([
    Promise.all(
      finalists.map(async (entry) => [entry.id, await api.votes.countForEntry(entry.id)] as const),
    ),
    api.participants.list(),
  ]);

  const nameById = new Map(participants.map((p) => [p.id, p.name] as const));

  return {
    cycle,
    tiers,
    finalistCount: finalists.length,
    slateCount: tiers.reduce((total, tier) => total + tier.slateCount, 0),
    votesByEntry: new Map(votes),
    makerByEntry: new Map(
      finalists.flatMap((entry) => {
        const name = nameById.get(entry.participantId);
        return name ? [[entry.id, name] as const] : [];
      }),
    ),
  };
}

/**
 * The year `/finalists` opens on when no year is named.
 *
 * The running cycle, if it has a shortlist to show. It usually does during
 * voting and results, and it does not during configuration, submissions or
 * verification — in which case the newest year that published one is the honest
 * answer, since a bare `/finalists` promises finalists and there are some.
 *
 * `null` only when nothing has ever been shortlisted.
 */
export async function currentFinalistYear(): Promise<number | null> {
  const [active, years] = await Promise.all([api.cycles.getActive(), finalistYears()]);
  const activeHasShortlist = years.some(({ cycle }) => cycle.id === active.id);
  // `finalistYears` is sorted newest first.
  return activeHasShortlist ? active.year : (years[0]?.cycle.year ?? null);
}

/**
 * Whether this year's voting is open.
 *
 * The phase, never a date. `lib/cycle-phase.ts` states why: Admin controls phase
 * transitions (§3.1) and a window can be extended before it closes, so the
 * phase is the authority. Only the active cycle can be in a live phase, so an
 * archived year is closed however its stored window reads.
 *
 * Note what this deliberately does NOT do: it does not derive, infer or publish
 * a closing instant. `votingWindow.end` can sit in the past while the phase is
 * still `voting`, and that inconsistency proves nothing — not that the window
 * was extended, and certainly not what the new deadline is. The banner says
 * voting is open and how to vote; a deadline needs an authority, and there
 * isn't one.
 */
export function votingIsOpen(activeCycle: Cycle, year: number): boolean {
  return activeCycle.phase === "voting" && activeCycle.year === year;
}
