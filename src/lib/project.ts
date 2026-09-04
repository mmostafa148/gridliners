import { api } from "@/lib/api";
import type {
  AwardLevel,
  ContentLanguage,
  Cycle,
  Entry,
  SubCategory,
  Tier,
} from "@/lib/api/types";
import { effectiveTier } from "@/lib/api/types";
import { phaseIndex } from "@/lib/cycle-phase";
import { storyFor, type ProjectStory } from "@/lib/fixtures/project-stories";
import { temporaryFrames, type ProjectImage } from "@/lib/project-media";

/**
 * One project, resolved once on the server.
 *
 * **The publication boundary is `api.results.published`, and nothing else** -
 * the same door 1.7 uses and for the same reason. `results.forEntry` returns
 * proposed rows and is never called from here; `results.all` is Admin-only.
 * Cycle 2026 is in `voting` with 362 rows, every one of them `finalized: false`,
 * so a live entry's proposed ranking is invisible to this screen by
 * construction rather than by filtering downstream.
 *
 * **What is loaded is deliberately narrower than what is stored.** A
 * `GroupResult` carries `tiebreakTrace`, `withheldReason` and `rank`, and the
 * first two are disclosure risks rather than merely unused: the trace spells out
 * jury scores verbatim and the reason is admin audit text (Addendum §60). None
 * of the three is copied into the view model, so a component cannot render one
 * by reaching for a field it happens to have.
 *
 * **`winnerSummary` was evaluated and is not enough on its own.** It answers
 * "did this entry win" with `{ level, resultId }` and **no group**, and §1.8
 * bullet 5 requires medals *per group*. It stays the right call for a screen
 * that needs the boolean; this one needs the standings.
 */

/** One group this project stands in, and where it stands. */
export interface ProjectStanding {
  subCategory: SubCategory;
  tier: Tier;
  /**
   * The medal this group awarded it, or null.
   *
   * Null covers three different facts that the page must not conflate: the
   * group is not finalized yet, it is finalized and this project did not place,
   * and its medal was withheld (Addendum §36 - "simply not awarded"). Which one
   * applies is read from `resultsPublished` on the view, never guessed here.
   */
  medal: Exclude<AwardLevel, "did_not_place"> | null;
}

/**
 * What the voting module may do, resolved from the cycle's phase alone.
 *
 * **Phase is authoritative and no state is inferred from a date.** The voting
 * window's own dates are stored and are deliberately not consulted: a window
 * may be extended before close (Addendum §40), and a page that reads the clock
 * would contradict the platform the moment it were. `phaseIndex` gives the
 * ordering, so a cycle in `configuration`, `submissions`, `verification` or
 * `jury_scoring` is all one answer to this screen.
 */
export type VotingState = "pre_voting" | "open" | "closed" | "results";

export interface ProjectView {
  entry: Entry;
  cycle: Cycle;
  /** Verified when known, else declared - what it is actually judged in. */
  tier: Tier;
  maker: string | null;
  /** Base sub-category first, then any paid add-ons, in taxonomy order. */
  standings: ProjectStanding[];
  /** The public count. One pool, however many groups it stands in. */
  votes: number;
  votingState: VotingState;
  /**
   * Whether this entry's groups have been finalized at all.
   *
   * What separates "voting is over and nothing is announced" from "the results
   * are out and this project took no medal". Both show no medal; only one of
   * them may say the results are pending.
   */
  resultsPublished: boolean;
  /**
   * The cover, and the gallery beneath it.
   *
   * The cover is always present: real media wins, otherwise a branded preview
   * stands in. Gallery slots stay in their recorded order and use the same
   * honest preview until real submitted media replaces each one.
   */
  cover: ProjectImage | null;
  gallery: ProjectImage[];
  /** True while any frame on the page is a stand-in rather than the work. */
  mediaIsTemporary: boolean;
  /** Provisional brief/concept/execution/outcome, or null. */
  story: ProjectStory | null;
  videoUrl: string | null;
  externalUrl: string | null;
  credits: string[];
  /** The authored direction, independent of the page's locale. */
  contentDir: "ltr" | "rtl";
  contentLanguage: ContentLanguage;
}

/**
 * A project's frames: real media when it exists, registered stand-ins when it
 * does not.
 *
 * Real media is used in place. Every fixture currently points into
 * `/placeholders`, so `lib/project-media.ts` supplies one branded cover preview
 * and one preview for every existing gallery slot.
 */
function resolveFrames(
  entry: Entry,
  parentId: string,
): { cover: ProjectImage | null; gallery: ProjectImage[]; mediaIsTemporary: boolean } {
  const temporary = temporaryFrames(
    entry.slug,
    parentId,
    entry.title,
    entry.media.galleryUrls.length,
  );
  const realCover = realMedia(entry.media.coverUrl);
  const cover: ProjectImage = realCover
    ? { kind: "file", src: realCover, width: 0, height: 0, temporary: false, shows: "", origin: "photograph", order: 0 }
    : temporary[0];
  const gallery = entry.media.galleryUrls.map((url, index): ProjectImage => {
    const real = realMedia(url);
    return real
      ? { kind: "file", src: real, width: 0, height: 0, temporary: false, shows: "", origin: "photograph", order: index + 1 }
      : temporary[index + 1];
  });
  const frames = [cover, ...gallery];

  return {
    cover,
    gallery,
    mediaIsTemporary: frames.some((frame) => frame.temporary),
  };
}

/**
 * `/placeholders` is not a directory.
 *
 * Every `EntryMedia` path in the fixtures points into it and no entrant
 * photography exists in this build (`lib/media.ts` says so at length). A path
 * that starts there is treated as absent, so the page renders its designed
 * empty state rather than a broken image - and starts rendering real media the
 * day real media arrives, with no code change.
 */
function realMedia(url: string | undefined): string | null {
  if (!url) return null;
  return url.startsWith("/placeholders/") ? null : url;
}

/**
 * Which of the four states the voting module is in.
 *
 * A pure function of the cycle and whether this entry's groups are finalized,
 * so the two states no fixture cycle can reach - `pre_voting`, and `closed`
 * while nothing is announced - are testable directly instead of being faked
 * into the fixture set.
 */
export function votingStateFor(cycle: Cycle, resultsPublished: boolean): VotingState {
  if (phaseIndex(cycle.phase) < phaseIndex("voting")) return "pre_voting";
  if (cycle.phase === "voting") return "open";
  // Past voting. The results are out for this project only if its groups were
  // finalized; otherwise the page says voting is closed and stops there.
  return resultsPublished ? "results" : "closed";
}

/**
 * One project by slug, or null when the slug is not a public project.
 *
 * **Only a shortlisted entry has a page.** Everything else - draft, pending
 * payment, submitted, verified, not shortlisted, excluded, cancelled,
 * disqualified - is not public, and returning null here is what sends those
 * slugs to the localized 404 rather than publishing an entry that was never
 * announced.
 */
export async function projectBySlug(slug: string): Promise<ProjectView | null> {
  const entry = await api.entries.getBySlug(slug);
  if (!entry || entry.state !== "shortlisted") return null;

  const [cycle, maker, subCategories, parents, published, votes] = await Promise.all([
    api.cycles.getById(entry.cycleId),
    api.participants.getById(entry.participantId),
    api.taxonomy.subCategories(),
    api.taxonomy.parentCategories(),
    api.results.published(entry.cycleId),
    api.votes.countForEntry(entry.id),
  ]);
  if (!cycle) return null;

  const tier = effectiveTier(entry);
  const subById = new Map(subCategories.map((sub) => [sub.id, sub]));

  // Taxonomy order for the add-ons, the same sequence Categories publishes -
  // but the base sub-category leads, because it is the one the entry was priced
  // and judged under (§1.2) and the add-ons hang off it.
  const parentOrder = new Map(parents.map((parent) => [parent.id, parent.order]));
  const addOns = entry.additionalSubCategoryIds
    .map((id) => subById.get(id))
    .filter((sub): sub is SubCategory => Boolean(sub))
    .sort(
      (a, b) =>
        (parentOrder.get(a.parentId) ?? 0) - (parentOrder.get(b.parentId) ?? 0) ||
        a.order - b.order,
    );

  const base = subById.get(entry.baseSubCategoryId);
  const groups = base ? [base, ...addOns] : addOns;

  // Finalized rows for this entry only. `published` is already filtered to
  // `finalized === true`, so anything here is announced.
  const mine = published.filter((row) => row.entryId === entry.id);

  const standings: ProjectStanding[] = groups.map((subCategory) => {
    const row = mine.find(
      (r) => r.subCategoryId === subCategory.id && r.tier === tier,
    );
    const medal =
      row && !row.withheld && row.level !== "did_not_place"
        ? (row.level as Exclude<AwardLevel, "did_not_place">)
        : null;
    return { subCategory, tier, medal };
  });

  const resultsPublished = mine.length > 0;
  const frames = resolveFrames(entry, base?.parentId ?? "");

  return {
    entry,
    cycle,
    tier,
    maker: maker?.name ?? null,
    standings,
    votes,
    votingState: votingStateFor(cycle, resultsPublished),
    resultsPublished,
    ...frames,
    videoUrl: realMedia(entry.media.videoUrl),
    externalUrl: entry.externalUrl ?? null,
    credits: entry.credits,
    mediaIsTemporary: frames.mediaIsTemporary,
    story: storyFor(entry.slug, base?.parentId),
    contentDir: entry.contentLanguage === "ar" ? "rtl" : "ltr",
    contentLanguage: entry.contentLanguage,
  };
}

/** Every slug with a public page: the shortlisted entries and nothing else. */
export async function projectSlugs(): Promise<string[]> {
  const entries = await api.entries.list({ states: ["shortlisted"] });
  return entries.map((entry) => entry.slug);
}
