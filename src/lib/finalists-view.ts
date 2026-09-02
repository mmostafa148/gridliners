import type { Locale } from "@/i18n/routing";
import type { ContentLanguage, Tier } from "@/lib/api/types";
import { countryName } from "@/lib/display-names";
import { categoryImage, projectCovers } from "@/lib/media";
import type { YearShortlist } from "@/lib/finalists";

/**
 * The shortlist, resolved for the client.
 *
 * The board that renders it is a client component, because the category filter
 * has to change what is shown *and* the counts that describe it, and a filter
 * whose numbers disagree with its list is worse than no filter. Everything the
 * board needs therefore has to cross the server boundary as plain data.
 *
 * **Resolution stays on the server.** Localized names, coordinates, parent codes
 * and category frames are all worked out here and handed over as strings, so the
 * client ships no taxonomy, no locale branching and no `api` call. What crosses
 * is exactly what is drawn.
 *
 * This is not a departure from the page being server-rendered: a client
 * component is still rendered to HTML on first paint, so every finalist, every
 * group and every count is in the document before any script runs. The filter is
 * a refinement over content that is already there, which is also why it needs no
 * URL state to stay crawlable.
 *
 * Nothing here carries a rank, a level or a medal. `YearShortlist` never had
 * them to give.
 */

/**
 * Real project photography, as opposed to the fixtures' `/placeholders` path.
 *
 * The twin of `hasCover` in `marketing/winners-podiums.tsx`, which asks the
 * same question for the same reason - logged as a `[dupe]` rather than lifted,
 * because that component belongs to an approved screen.
 */
function coverOf(
  entry: { slug: string; media: { coverUrl: string } },
  parentId: string,
): string | null {
  const url = entry.media.coverUrl;
  if (url && !url.startsWith("/placeholders/")) return url;

  // No real cover, so a placeholder from the parent's pool - chosen by the
  // entry's own slug, so a project keeps the same frame on every render and
  // neighbouring rows do not repeat. `projectCovers` records where the pool
  // came from and what it is not.
  const pool = projectCovers[parentId];
  if (!pool?.length) return null;
  let h = 2166136261;
  for (let i = 0; i < entry.slug.length; i++) {
    h ^= entry.slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return pool[(h >>> 0) % pool.length].src;
}

export interface FinalistView {
  id: string;
  slug: string;
  title: string;
  contentLanguage: ContentLanguage;
  /** The group this finalist competes in. It was the block heading above them
   *  and is now on the line itself. */
  subId: string;
  subName: string;
  /** Named in full. The record holds ISO 3166-1 alpha-2; a reader gets a
   *  country (§1.3 `[map-update]`, 2026-08-25). */
  country: string;
  /** The aggregate. Never a rank, and never the order. */
  votes: number;
  maker: string | null;
  /** As submitted, never translated (§3.8). The page had been throwing this
   *  away, which left a finalist as a title and a number. */
  description: string;
  /**
   * The project's own cover, or null - and today it is null for every entry.
   *
   * `EntryMedia.coverUrl` is populated in the fixtures as
   * `/placeholders/<slug>-cover.jpg`, and `public/placeholders` is not a
   * directory, so every one of those URLs is a 404 waiting to be requested.
   * Resolving it here means the row asks for a file only when there is a file.
   */
  cover: string | null;
}

export interface SlateView {
  id: string;
  /** The sub-category, named in full. */
  name: string;
  finalists: FinalistView[];
}

export interface ParentView {
  id: string;
  name: string;
  description: string | null;
  image: { src: string; ratio: number } | null;
  /** Kept for the counts the band prints; the list below is what renders. */
  slates: SlateView[];
  /**
   * Every finalist this parent holds in this tier, as **one list**.
   *
   * The sub-categories used to be separate ruled blocks and merged into this
   * (§1.6 `[map-update]`, 2026-08-25). Ordered by sub-category and then within
   * it, so like still sits with like without a heading between them, and every
   * line carries its own sub-category where that heading used to be.
   */
  finalists: FinalistView[];
  finalistCount: number;
}

export interface TierView {
  tier: Tier;
  parents: ParentView[];
  finalistCount: number;
  slateCount: number;
}

/** One sub-category inside a filter cell's panel. */
export interface FilterSubOption {
  id: string;
  name: string;
  count: number;
}

/** One entry in the filter bar. Only parents the year actually holds. */
export interface FilterOption {
  id: string;
  name: string;
  /** How many finalists sit behind this cell, across all three tiers. It is
   *  the one thing a reader cannot work out before clicking. */
  count: number;
  /**
   * The sub-categories this parent holds **this year**, in taxonomy order.
   *
   * Only the ones with finalists in them: offering a sub-category nobody
   * entered would hand a reader a control that empties the page, which is the
   * same rule the board already follows for absent parents and empty groups.
   */
  subs: FilterSubOption[];
}

export interface ShortlistView {
  tiers: TierView[];
  options: FilterOption[];
}

export function toShortlistView(
  shortlist: YearShortlist,
  locale: Locale,
): ShortlistView {
  const tiers: TierView[] = shortlist.tiers.map((tier) => ({
    tier: tier.tier,
    finalistCount: tier.finalistCount,
    slateCount: tier.slateCount,
    parents: tier.parents.map((group) => ({
      id: group.parent.id,
      name: group.parent.name[locale],
      description: group.parent.description?.[locale] ?? null,
      image: categoryImage[group.parent.id] ?? null,
      finalistCount: group.finalistCount,
      // `orderedSubs` already put the slates in taxonomy order, so flattening
      // keeps a sub-category's finalists together without a heading to hold
      // them; within one, `lib/finalists.ts` has already applied slug order.
      finalists: group.slates.flatMap((slate) =>
        slate.finalists.map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          title: entry.title,
          contentLanguage: entry.contentLanguage,
          subId: slate.subCategory.id,
          subName: slate.subCategory.name[locale],
          country: countryName(entry.country, locale),
          votes: shortlist.votesByEntry.get(entry.id) ?? 0,
          maker: shortlist.makerByEntry.get(entry.id) ?? null,
          description: entry.description,
          cover: coverOf(entry, group.parent.id),
        })),
      ),
      slates: group.slates.map((slate) => ({
        id: slate.subCategory.id,
        name: slate.subCategory.name[locale],
        finalists: slate.finalists.map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          title: entry.title,
          contentLanguage: entry.contentLanguage,
          subId: slate.subCategory.id,
          subName: slate.subCategory.name[locale],
          country: countryName(entry.country, locale),
          votes: shortlist.votesByEntry.get(entry.id) ?? 0,
          maker: shortlist.makerByEntry.get(entry.id) ?? null,
          description: entry.description,
          cover: coverOf(entry, group.parent.id),
        })),
      })),
    })),
  }));

  // Offering all seven parents when only five have anything would hand a reader
  // two chips that empty the page. The bar lists what the year holds, in
  // taxonomy order, deduplicated across the three tiers.
  const seen = new Map<string, FilterOption>();
  const subSeen = new Map<string, Map<string, FilterSubOption>>();

  for (const tier of tiers)
    for (const parent of tier.parents) {
      const found = seen.get(parent.id);
      if (found) found.count += parent.finalistCount;
      else {
        seen.set(parent.id, {
          id: parent.id,
          name: parent.name,
          count: parent.finalistCount,
          subs: [],
        });
        subSeen.set(parent.id, new Map());
      }

      // A sub-category can hold finalists in more than one tier; the panel
      // counts the whole year, the way the parent cell above it does.
      const subs = subSeen.get(parent.id)!;
      for (const slate of parent.slates) {
        const already = subs.get(slate.id);
        if (already) already.count += slate.finalists.length;
        else subs.set(slate.id, { id: slate.id, name: slate.name, count: slate.finalists.length });
      }
    }

  for (const [parentId, subs] of subSeen) seen.get(parentId)!.subs = [...subs.values()];

  return { tiers, options: [...seen.values()] };
}
