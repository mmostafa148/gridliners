/**
 * Temporary project media, resolved per project.
 *
 * The demo contains fictional projects and no entrant photography. Missing
 * media resolves to one branded preview placeholder, never to stock
 * photography or an invented gallery.
 *
 * When a real `coverUrl` or `galleryUrls` entry appears - anything that is not
 * a `/placeholders` path - it wins outright and none of this is consulted.
 */

/** A real frame supplied for a project. */
export interface FileFrame {
  kind: "file";
  src: string;
  width: number;
  height: number;
  temporary: boolean;
  /** What the frame shows, for a gallery caption and the record. */
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

function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A project's temporary media: one preview frame and no invented gallery.
 * The shared renderer uses the title and category only to distinguish cards;
 * it never presents the placeholder as submitted work.
 */
export function temporaryFrames(
  slug: string,
  parentId: string,
  title: string,
): ProjectImage[] {
  const seed = seedFrom(slug);
  const ratio = 16 / 9;
  return [{
    kind: "art" as const,
    spec: { parentId, index: 0, seed, title },
    width: 1600,
    height: Math.round(1600 / ratio),
    temporary: true as const,
    shows: "Project preview",
    origin: "generated" as const,
  }];
}
