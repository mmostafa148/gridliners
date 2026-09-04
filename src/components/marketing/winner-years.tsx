import { ArrowRight, MapPin, Medal } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { CeremonyEdition, Cycle } from "@/lib/api/types";

/**
 * The other editions, beneath this year's winners.
 *
 * **Moved out of the page header on the client's direction (2026-08-29), which
 * lands 1.7 on the arrangement 1.6 already settled.** This began as a compact
 * switcher in `PageHeader`'s `children` slot. 1.6 took the same decision in the
 * other direction and recorded it: its years grid moved to the foot of every
 * year's page and **the header's switcher was struck out** - one way to change
 * year, not two - which is why `YearSwitcher` was deleted in `84ff45d`. Winners
 * now reads the same way, and the two screens no longer disagree about where a
 * reader goes to find another edition.
 *
 * It also stops being a switcher and becomes an archive. A row carries the
 * year, how many medals that edition awarded and where its ceremony was, which
 * is what makes one year different from another; a chip row carried none of
 * that. `ArchiveYears` does exactly this for finalists and **could not be
 * reused** - it is hardcoded to `/finalists/${year}` and typed on
 * `finalistCount`, and 1.6 is approved and closed, so extracting a shared
 * component would mean editing it. Logged as a `[dupe]` beside the mark-map,
 * `Scrim` and the retired winner sheet.
 *
 * **Links, not a select.** Every year is a real URL, so the list is crawlable
 * and each year is one keystroke away in tab order with no script running.
 *
 * **The current year is not listed.** It is the page; a link back to where you
 * already are is not an action, and leaving it out is what makes this an
 * archive of the others rather than a switcher that has to mark one of its own
 * options as current.
 *
 * **Years arrive already filtered to those that published results**, so this
 * never offers a page with nothing on it. The running cycle is deliberately
 * absent while its results are unpublished - `/winners/2026` stays reachable
 * and explains itself, but it is not advertised as an edition to go and read.
 */
export async function WinnerYears({
  years,
  ceremonies,
  current,
  title,
  footer,
}: {
  /** Newest first, and only years that have published winners. */
  years: { cycle: Cycle; medalCount: number }[];
  ceremonies: CeremonyEdition[];
  /** The year whose page this is. It is the page, so it is not in the list. */
  current: number;
  /**
   * Override the heading.
   *
   * Optional and **defaulting to the approved copy**, so `/winners/<year>`
   * renders exactly as it was approved. The Awards hub lists the same archive
   * with no current year, where "Other years" would be other than nothing;
   * there it is the Sitemap's "Previous awards" instead.
   */
  title?: string;
  /**
   * Optional context for the archive as a whole. Kept inside this section so
   * a hub can close the archive with one useful next step without adding a
   * second navigation band beneath it.
   */
  footer?: { body: string; href: string; label: string };
}) {
  const [locale, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("winners.years"),
  ]);

  const others = years.filter(({ cycle }) => cycle.year !== current);
  if (others.length === 0) return null;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <h2 className="text-h1 text-balance">{title ?? t("otherYears")}</h2>

        <ul className="mt-10 border-t border-navy-900/20 lg:mt-12">
          {others.map(({ cycle, medalCount }) => {
            const edition = ceremonies.find((row) => row.year === cycle.year) ?? null;
            const city = edition?.city[locale];

            return (
              <li key={cycle.id} className="border-b border-navy-900/20">
                <Link
                  href={`/winners/${cycle.year}`}
                  className="group flex items-center gap-x-6 py-6 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:py-7"
                >
                  {/* Landscape and fixed, so every row keeps the same rhythm -
                      1.6 found square cropped a night skyline to its darkest
                      part and the thumbnail read as a black block. A year with
                      no frame still gets the block rather than collapsing its
                      row out of line with the others.

                      `alt=""`: which edition a frame was shot at is not
                      recorded (`fixtures/content.ts` says so), and the year
                      beside it is text.

                      The ceremony frame, never a winner's portrait: a year is
                      the night it was conferred at, and one winner's face
                      standing for a whole edition would say something the page
                      has no business saying. */}
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-navy-950 sm:h-16 sm:w-24">
                    {edition?.image ? (
                      <Image
                        src={edition.image.src}
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
                    <span className="flex items-center gap-2 font-display text-coord uppercase text-navy-600 transition-colors group-hover:text-blue-700">
                      <Medal aria-hidden className="size-4 shrink-0" />
                      {t("medals", { count: medalCount })}
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

        {footer ? (
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:mt-10">
            <p className="max-w-[58ch] text-body-sm text-navy-600">
              {footer.body}
            </p>
            <Link
              href={footer.href}
              className="group inline-flex w-fit shrink-0 items-center gap-2 font-display text-coord uppercase text-blue-700 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {footer.label}
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
