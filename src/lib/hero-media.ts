/**
 * The film that plays behind a project's hero, where one exists.
 *
 * **`Entry.media.videoUrl` is not this.** That field is the entrant's own film
 * - a link a reader follows, off-site, and on this build it holds a provisional
 * address that does not resolve (build-state §25). A hero backdrop is a
 * different thing: a short, silent, seamless loop served from this origin.
 *
 * `qamar-identity` carries the client's own `hero-cover.mp4`. It replaced a
 * loop generated here from image 01, which is deleted rather than left beside
 * it - two hero films in one folder is an invitation to wire up the wrong one.
 *
 * Every other project shows its cover with a slow drift, which reads the same
 * way and needs no asset. Each becomes a real film the moment one is added
 * here; nothing else changes.
 */
export const HERO_FILM: Record<string, string> = {
  "qamar-identity": "/media/projects/qamar-identity/hero-cover.mp4",
};

export function heroFilmFor(slug: string): string | null {
  return HERO_FILM[slug] ?? null;
}
