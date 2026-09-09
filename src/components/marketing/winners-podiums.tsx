import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { ProjectPlaceholder } from "@/components/shared/project-placeholder";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { AwardLevel, Entry, GroupResult, SubCategory, Tier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Winners.
 *
 * Built to the two places this already exists rather than to a new idea. The
 * live 2023 winners page groups by category and shows one Gold, one Silver and
 * one Bronze in each, and every card there is cover image, then the project
 * name carrying its level and year, then the person who made it. No scores, no
 * vote counts, no charts. The brand deck's Winners Posters (p.28) and
 * Certificates (p.29) give the form: a metal-tinted mosaic of the pixel, then a
 * panel in that metal carrying "<Category> /Category" and "GOLD WINNER".
 *
 * So that is what this is. The grouping the platform needs is the same grouping
 * the site already uses, since a Gridliners category on that page is a
 * sub-category and tier here.
 *
 * The one thing not taken from the deck is the Winner Frame artwork (p.25).
 * It carries "Gold 2026" inside the counter as part of the artwork, and these
 * are the 2025 winners, so using it would print the wrong year on a result.
 * This is treated as source-artwork errata and is not something to quietly
 * correct in the component.
 *
 * Ink per metal follows MedalBadge, which is where these pairings are already
 * settled: navy on gold and silver, white on bronze. It is not decoration that
 * they differ. Gold and silver are too light to carry white, and bronze is too
 * dark to carry navy.
 */

const PANEL: Record<AwardLevel & ("gold" | "silver" | "bronze"), string> = {
  gold: "bg-gold text-navy-900",
  silver: "bg-silver text-navy-900",
  bronze: "bg-bronze text-white",
};

/** Real photography, as opposed to the fixtures' /placeholders path. */
function hasCover(entry: Entry): boolean {
  return Boolean(entry.media.coverUrl) && !entry.media.coverUrl.startsWith("/placeholders/");
}

export async function WinnersPodiums({
  podiums,
  entries,
  subCategories,
  creators,
}: {
  /** Each inner array is one group, already ordered Gold, Silver, Bronze. */
  podiums: GroupResult[][];
  entries: Map<string, Entry>;
  subCategories: Map<string, SubCategory>;
  /** Participant name per participant id: the "who made it" line. */
  creators: Map<string, string>;
}) {
  // `getLocale` resolved on its own: `check-messages` binds namespaces to
  // destructured names positionally, so a non-`getTranslations` member in the
  // same `Promise.all` shifts every binding after it by one. Harmless while
  // there was a single translator here; adding the tier names exposed it.
  const locale = (await getLocale()) as Locale;
  const [t, tTier] = await Promise.all([
    getTranslations("home.winners"),
    getTranslations("tier"),
  ]);

  return (
    <div className="space-y-12">
      {podiums.map((group) => {
        const sub = subCategories.get(group[0].subCategoryId);

        return (
          <section key={`${group[0].subCategoryId}|${group[0].tier}`} className="space-y-5">
            <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-navy-900/20 pb-4">
              <h3 className="text-h4">{sub?.name[locale]}</h3>
              {/* The tier alone. This was the group coordinate; with the codes
                  retired it would have repeated the sub-category name printed
                  beside it (§1.3 `[map-update]`, 2026-08-25). */}
              <span className="font-display text-coord uppercase text-blue-700">
                {tTier(group[0].tier as Tier)}
              </span>
            </header>

            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((result) => {
                const entry = entries.get(result.entryId);
                if (!entry) return null;
                const level = result.level as "gold" | "silver" | "bronze";

                return (
                  <li key={result.id} className="flex flex-col bg-navy-900 text-cream-100">
                    <div className="relative aspect-[6/5] overflow-hidden bg-navy-950">
                      {/* The live winners page leads every card with the cover.
                          Every coverUrl in the fixtures still points into
                          /placeholders, which does not exist, so asking for one
                          is five 404s per page for an image the mosaic covers
                          anyway. Real covers take the cell the moment they land. */}
                      {hasCover(entry) ? (
                        <Image
                          src={entry.media.coverUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          className="object-cover"
                        />
                      ) : (
                        <ProjectPlaceholder
                          slug={entry.slug}
                          title={entry.title}
                          parentId={sub?.parentId ?? ""}
                        />
                      )}
                    </div>

                    {/* The deck's poster panel: the category, then the award. */}
                    <div className={cn("px-5 py-4", PANEL[level])}>
                      <p className="font-display text-coord uppercase opacity-80">
                        {sub?.name[locale]} /{t("category")}
                      </p>
                      <p className="mt-1.5 font-display text-[clamp(1.125rem,1.5vw,1.5rem)] uppercase leading-none">
                        {t(level)}
                      </p>
                    </div>

                    <div className="px-5 py-5">
                      <h4
                        lang={entry.contentLanguage}
                        dir={entry.contentLanguage === "ar" ? "rtl" : "ltr"}
                        className="text-h4 text-cream-50"
                      >
                        <Link
                          href={`/projects/${entry.slug}`}
                          className="transition-colors hover:text-gold"
                        >
                          {entry.title}
                        </Link>
                      </h4>
                      {/* The line the live winners page carries under every
                          title: who made it. */}
                      <p className="mt-1 text-body-sm text-cream-200/75">
                        {creators.get(entry.participantId) ?? entry.country}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
