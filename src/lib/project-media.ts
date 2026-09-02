import { artefactsFor, ART_RATIOS } from "@/components/marketing/project-art";
import manifest from "@/lib/media-manifest.json";

/**
 * Temporary project media, resolved per project.
 *
 * **Every public project gets a real cover and a real gallery.** The earlier
 * direction - render nothing until the client's photography arrives - was
 * rejected on review (build-state §16): a cover and a gallery are mapped
 * content in all three governing sources, and missing client assets are not
 * permission to publish an empty page.
 *
 * **Everything here is a stand-in and says so.** `media-manifest.json` carries
 * `temporary: true`, the original source URL and the licence for all 65 files,
 * and `docs/temporary-media.md` is the readable record. All are CC0 or Public
 * Domain, sourced through Openverse and hand-reviewed; none is the work of the
 * entrant it appears beside.
 *
 * **Two tiers, by design.** The five review projects are hand-curated - six
 * frames each, chosen for that project's own story, so a gallery reads as one
 * body of work. Every other public project draws from a **category pool**,
 * deterministically by slug, so its set is stable across renders, relevant to
 * its parent category, and never the same sequence as its neighbour's.
 *
 * When a real `coverUrl` or `galleryUrls` entry appears - anything that is not
 * a `/placeholders` path - it wins outright and none of this is consulted.
 */

/** A frame that exists as a file: the five curated kits and their context shot. */
export interface FileFrame {
  kind: "file";
  src: string;
  width: number;
  height: number;
  temporary: boolean;
  /** What the frame shows, for the manifest and the record. */
  shows: string;
  /**
   * `generated` is drawn design work, `photograph` is contextual imagery, and
   * `client` is final imagery the client selected and supplied. Only the first
   * two are stand-ins.
   */
  origin: "generated" | "photograph" | "client";
  /**
   * The frame's place in the set, from the manifest.
   *
   * Carried through so a caption can be numbered the way the set is numbered.
   * The gallery excludes the cover, so counting from the gallery's own index
   * labelled the client's `02-` file as "01".
   */
  order: number;
}

/** A frame drawn at render time from the project's own seed. */
export interface ArtFrame {
  kind: "art";
  spec: ArtSpec;
  width: number;
  height: number;
  temporary: true;
  shows: string;
  origin: "generated";
}

export interface ArtSpec {
  parentId: string;
  index: number;
  seed: number;
  title: string;
}

export type ProjectImage = FileFrame | ArtFrame;

interface ManifestRow {
  file: string;
  width: number;
  height: number;
  usedBy: string;
  temporary: boolean;
  /** Explicit, because the files are named for what they show, not numbered. */
  order: number;
  kind?: "generated" | "photograph" | "client";
  shows?: string;
}

const rows = manifest as ManifestRow[];

const bySet = new Map<string, ProjectImage[]>();
for (const row of rows) {
  const list = bySet.get(row.usedBy) ?? [];
  list.push({
    kind: "file",
    src: row.file,
    width: row.width,
    height: row.height,
    temporary: row.temporary,
    shows: row.shows ?? "",
    origin: row.kind ?? "photograph",
    order: row.order ?? 0,
  });
  bySet.set(row.usedBy, list);
}
// Order comes from the manifest, not the filename: the artefacts are named for
// what they are, and a story does not read alphabetically.
const orderOf = new Map(rows.map((r) => [r.file, r.order ?? 0]));
for (const list of bySet.values()) {
  list.sort((a, b) => {
    const ka = a.kind === "file" ? (orderOf.get(a.src) ?? 0) : 0;
    const kb = b.kind === "file" ? (orderOf.get(b.src) ?? 0) : 0;
    return ka - kb;
  });
}

/** The five projects whose media is hand-picked for their own subject. */
export const CURATED = new Set(
  [...bySet.keys()].filter((key) => !key.startsWith("pool-")),
);

function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A project's frames: the cover first, then the gallery.
 *
 * A hand-curated project takes its own files. **Every other public project takes
 * a drawn set** - six artefacts from its category's system, seeded by its own
 * slug, rendered as inline SVG rather than stored. The pooled photographs this
 * replaces were rejected on review for exactly the reason the curated kits exist:
 * unrelated stock is not documentation of designed work, and category-aware copy
 * does not make an incoherent gallery coherent.
 */
export function temporaryFrames(
  slug: string,
  parentId: string,
  title: string,
): ProjectImage[] {
  const curated = bySet.get(slug);
  if (curated?.length) return curated;

  const seed = seedFrom(slug);
  const names = artefactsFor(parentId);
  return ART_RATIOS.map((ratio, index) => ({
    kind: "art" as const,
    spec: { parentId, index, seed, title },
    width: 1600,
    height: Math.round(1600 / ratio),
    temporary: true as const,
    shows: names[index] ?? "",
    origin: "generated" as const,
    order: index,
  }));
}
