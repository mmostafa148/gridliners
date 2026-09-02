import { ArrowRight, ListChecks, MapPin } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { CeremonyEdition, Cycle } from "@/lib/api/types";
import { ceremonyHeld } from "@/lib/cycle-phase";

/**
 * The rest of the archive, under the shortlist a reader is already on.
 *
 * `/finalists` used to be an index whose whole job was to send a reader
 * somewhere else - and the footer has linked it since Phase 1.1, so the site's
 * own "Finalists" link landed on a page with no finalists on it. The years grid
 * was not dropped, it moved here: every year's page ends with the other years,
 * so the archive is reachable from any of them and a reader who lands on 2024
 * can reach 2026 without going back up a level (§1.6 `[map-update]`,
 * 2026-08-24).
 *
 * Rows, not cards. Cards said these years were equal options; they are a
 * record, and a record reads down. A row also never leaves a hole - two cards
 * in a three-column grid did - and it goes on working when the archive is
 * fifteen years long, which is the state this list spends most of its life in.
 *
 * Each row carries the year, a frame from it, how many finalists that shortlist
 * holds, and the city. The count is why this is more than a list of links: it
 * is what makes one year different from another at a glance.
 *
 * **The thumbnail follows the same rule as the ceremony hero, and it has to.**
 * A held year shows its ceremony photograph. The running year shows its *city*,
 * because its ceremony has not happened - `cityImage`, not `image`. Taking
 * `image` for every row would have put a lit stage beside a year still in
 * voting, which is the exact falsehood corrected on this screen on 2026-08-26,
 * reintroduced one component over. `ceremonyHeld(cycle)` is the same phase
 * check the hero uses; neither reads a date.
 *
 * The two marks name what the facts are rather than decorating them: a
 * shortlist beside the count, a place beside the city. The city is the one that
 * earns it - "Amman" alone could as easily be a venue as a city.
 *
 * **The running cycle is flagged from the phase**, never from a date - the same
 * rule the voting banner follows, for the same reason. That flag is the whole
 * reason a reader on an archived year needs this list to be more than years.
 *
 * Nothing renders when this is the only year there has ever been. A heading
 * over an empty rule would be a section that failed rather than an archive with
 * one entry in it.
 */
export async function ArchiveYears({
  years,
  activeCycle,
  ceremonies,
  /** The year whose page this is. It is the page, so it is not in the list. */
  current,
}: {
  years: { cycle: Cycle; finalistCount: number }[];
  activeCycle: Cycle;
  ceremonies: CeremonyEdition[];
  current: number;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finalists");

  const others = years.filter(({ cycle }) => cycle.year !== current);
  if (others.length === 0) return null;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <h2 className="text-h1 text-balance">{t("archive.otherYears")}</h2>

        <ul className="mt-10 border-t border-navy-900/20 lg:mt-12">
          {others.map(({ cycle, finalistCount }) => {
            const edition = ceremonies.find((row) => row.year === cycle.year) ?? null;
            const city = edition?.city[locale];
            const isOpen = activeCycle.phase === "voting" && activeCycle.id === cycle.id;
            const thumb = ceremonyHeld(cycle) ? edition?.image : edition?.cityImage;

            return (
              <li key={cycle.id} className="border-b border-navy-900/20">
                <Link
                  href={`/finalists/${cycle.year}`}
                  className="group flex items-center gap-x-6 py-6 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:py-7"
                >
                  {/* Landscape rather than square, and fixed so every row keeps
                      the same rhythm. Square first, and it cropped the city
                      frame to its darkest part - a night skyline is mostly
                      sky, so the thumbnail read as a black block. A year with neither
                      frame still gets the block rather than collapsing its row
                      out of line with the others.

                      `alt=""`: which edition a frame was shot at is not
                      recorded (`fixtures/content.ts` says so), and the year
                      beside it is text. */}
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-navy-950 sm:h-16 sm:w-24">
                    {thumb ? (
                      <Image
                        src={thumb.src}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>

                  {/* The year and its facts wrap among themselves; the arrow
                      stays on the row. Letting it wrap with them stranded it
                      alone on a second line at 390. */}
                  <span className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
                    <span className="font-data text-h2 leading-none tabular-nums">
                      {cycle.year}
                    </span>
                    {isOpen ? (
                      /* py-1.5, not py-1: `text-coord` sets a 13.2px line box
                         and the Arabic face's ascent and descent at 11px
                         measure 23px, which overflowed a 21px chip at both
                         edges. */
                      <span className="self-center bg-navy-950 px-3 py-1.5 font-display text-coord uppercase text-cream-100">
                        {t("archive.open")}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-2 font-display text-coord uppercase text-navy-600 transition-colors group-hover:text-blue-700">
                      <ListChecks aria-hidden className="size-4 shrink-0" />
                      {t("index.finalists", { count: finalistCount })}
                    </span>
                    {city ? (
                      <span className="flex items-center gap-2 text-body-sm text-navy-600 transition-colors group-hover:text-blue-700">
                        <MapPin aria-hidden className="size-4 shrink-0" />
                        {city}
                      </span>
                    ) : null}
                  </span>
                  {/* Mirrored in RTL, the way every other directional mark on
                      the build is. */}
                  <ArrowRight
                    aria-hidden
                    className="ms-auto size-5 shrink-0 rtl:-scale-x-100"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
