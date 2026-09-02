import { api } from "@/lib/api";
import type {
  AwardLevel,
  Cycle,
  Entry,
  HonoraryType,
  SubCategory,
  Tier,
} from "@/lib/api/types";
import { effectiveTier } from "@/lib/api/types";
import type { Locale } from "@/i18n/routing";
import { temporaryFrames, type ProjectImage } from "@/lib/project-media";

/**
 * One award, resolved once on the server — screen-map 3.1.
 *
 * **The publication boundary is `results.published`, and nothing else**, the
 * same door 1.7 and 1.8 use. A result that is not finalized, is withheld, or
 * placed nowhere has no page: it resolves to null and the route 404s. So does
 * an award whose entry is not itself public.
 *
 * **What is loaded is deliberately narrower than what is stored.** A
 * `GroupResult` carries `rank`, `tiebreakTrace` and `withheldReason`; the first
 * is a competitive detail and the other two are admin audit text (Addendum
 * §60). None of the three is copied into this view model, so no component can
 * render one by reaching for a field it happens to have.
 *
 * **Two kinds of award share the route.** A medal belongs to a group result and
 * carries a category and a tier. An honorary designation belongs to a *person*
 * (Addendum §21), takes the black colorway, and has **no tier line** — the
 * screen map says so explicitly. They are one union rather than two routes
 * because they are one thing to a reader: an award with a public page.
 */
export type AwardColorway = Exclude<AwardLevel, "did_not_place"> | "honorary";

interface AwardBase {
  id: string;
  cycle: Cycle;
  colorway: AwardColorway;
  /** Whose award it is: the entrant, or the honorary subject. */
  holder: string;
  /** The work, when there is one. An honorary designation may have none. */
  entry: Entry | null;
  cover: ProjectImage | null;
  /**
   * Every frame of the work, the cover first.
   *
   * The same set the project page publishes, resolved the same way: the
   * entrant's own media where it exists, and registered temporary frames where
   * it does not. The award page shows the whole set rather than one plate,
   * because a single cover made the work look like an illustration of the
   * award instead of the thing that won it.
   */
  gallery: ProjectImage[];
  parentId: string;
}

export interface MedalAward extends AwardBase {
  kind: "medal";
  level: Exclude<AwardLevel, "did_not_place">;
  subCategory: SubCategory;
  tier: Tier;
  /** The public count, the same one the project page shows. */
  votes: number;
}

export interface HonoraryAward extends AwardBase {
  kind: "honorary";
  type: HonoraryType;
  citation: string;
}

export type AwardView = MedalAward | HonoraryAward;

/**
 * The work's frames: the entrant's own where they exist, registered stand-ins
 * where they do not. Mirrors `resolveFrames` in `lib/project.ts` - the same
 * `/placeholders` rule and the same `temporaryFrames` pool, so an award and its
 * project never disagree about what the work looks like.
 */
function framesFor(
  entry: Entry | null,
  parentId: string,
): { cover: ProjectImage | null; gallery: ProjectImage[] } {
  if (!entry) return { cover: null, gallery: [] };

  const isReal = (url: string | undefined): url is string =>
    Boolean(url) && !url!.startsWith("/placeholders/");

  const asFile = (src: string, order: number): ProjectImage => ({
    kind: "file",
    src,
    width: 0,
    height: 0,
    temporary: false,
    shows: "",
    origin: "photograph",
    order,
  });

  if (isReal(entry.media.coverUrl)) {
    const real = [
      asFile(entry.media.coverUrl, 0),
      ...entry.media.galleryUrls.filter(isReal).map((src, i) => asFile(src, i + 1)),
    ];
    return { cover: real[0], gallery: real };
  }

  const frames = temporaryFrames(entry.slug, parentId, entry.title);
  return { cover: frames[0] ?? null, gallery: frames };
}

/**
 * One award by id, or null when the id is not a published award.
 *
 * The id is a `GroupResult.id` or a `HonoraryDesignation.id`. Anything else —
 * an unfinalized row, a withheld medal, a result whose entry was later
 * cancelled, an unpublished designation — is not an award and gets the
 * localized 404.
 */
export async function awardById(id: string, locale: Locale): Promise<AwardView | null> {
  const cycles = await api.cycles.list();

  for (const cycle of cycles) {
    // ---- a medal -------------------------------------------------------
    const published = await api.results.published(cycle.id);
    const row = published.find((r) => r.id === id);
    if (row) {
      if (row.withheld || row.level === "did_not_place") return null;

      const entry = await api.entries.getById(row.entryId);
      // An award page publishes an entry's title, cover and maker. If the
      // entry is no longer public, neither is its award.
      if (!entry || entry.state !== "shortlisted") return null;

      const [maker, subCategories] = await Promise.all([
        api.participants.getById(entry.participantId),
        api.taxonomy.subCategories(),
      ]);
      const subCategory = subCategories.find((s) => s.id === row.subCategoryId);
      if (!subCategory) return null;

      const votes = await api.votes.countForEntry(entry.id);

      return {
        kind: "medal",
        id: row.id,
        cycle,
        colorway: row.level as Exclude<AwardLevel, "did_not_place">,
        level: row.level as Exclude<AwardLevel, "did_not_place">,
        holder: maker?.name ?? "",
        entry,
        ...framesFor(entry, subCategory.parentId),
        parentId: subCategory.parentId,
        subCategory,
        tier: effectiveTier(entry),
        votes,
      };
    }

    // ---- an honorary designation ---------------------------------------
    const honorary = await api.results.honorary(cycle.id);
    const designation = honorary.find((h) => h.id === id);
    if (designation) {
      if (!designation.published) return null;

      const entry = designation.entryId
        ? await api.entries.getById(designation.entryId)
        : null;
      const subCategories = await api.taxonomy.subCategories();
      const parentId = entry
        ? (subCategories.find((s) => s.id === entry.baseSubCategoryId)?.parentId ?? "")
        : "";
      // A designation may name a project that is not public. The award still
      // exists; the work simply is not shown.
      const shown = entry && entry.state === "shortlisted" ? entry : null;

      return {
        kind: "honorary",
        id: designation.id,
        cycle,
        colorway: "honorary",
        type: designation.type,
        holder: designation.subject.name,
        citation: designation.citation[locale],
        entry: shown,
        ...framesFor(shown, parentId),
        parentId,
      };
    }
  }

  return null;
}

/** Every id with a public award page: published medals and designations. */
export async function awardIds(): Promise<string[]> {
  const cycles = await api.cycles.list();
  const ids: string[] = [];
  for (const cycle of cycles) {
    for (const row of await api.results.published(cycle.id)) {
      if (!row.withheld && row.level !== "did_not_place") ids.push(row.id);
    }
    for (const h of await api.results.honorary(cycle.id)) {
      if (h.published) ids.push(h.id);
    }
  }
  return ids;
}
