/**
 * The film that plays behind a project's hero, where one exists.
 *
 * **`Entry.media.videoUrl` is not this.** That field is the entrant's own film
 * - a link a reader follows, off-site, and on this build it holds a provisional
 * address that does not resolve (build-state §25). A hero backdrop is a
 * different thing: a short, silent, seamless loop served from this origin.
 *
 * The demo projects are fictional, so none currently claim a film as their
 * work. Each can opt into a real film here when entrant media is supplied.
 */
export const HERO_FILM: Record<string, string> = {};

export function heroFilmFor(slug: string): string | null {
  return HERO_FILM[slug] ?? null;
}
