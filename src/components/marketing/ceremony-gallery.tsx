import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { CeremonyEdition } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The ceremony. The page's peak, and the only place its photography runs at
 * the size the photographs deserve.
 *
 * This replaced one large frame beside two thumbnails. The night the whole
 * programme builds to was rendered at the same width as a paragraph, and the
 * two previous nights at a quarter of that.
 *
 * Now the live edition takes the full shell width and most of a screen in
 * height, and the two editions behind it sit beneath it as a spaced pair.
 * Boxed, not bled: the frames are the width of everything else on the page. A
 * full-bleed pass was built first and the scale reads without it, so the
 * section keeps the page's measure.
 *
 * Every card carries its own city on the frame. The hierarchy is in the size
 * and in the gold on the live year, which is enough — an earlier pass reserved
 * the overlay for the live night and captioned the other two beneath, and on a
 * white ground those caption bars read as two dark strips rather than as part
 * of the pictures.
 *
 * The photographs are real client coverage, rendered straight rather than
 * through `DuotoneImage`. The hero already made that call about these exact
 * frames, which are art-directed as shot, and grading a stage lit in the
 * brand's own violet would throw away the only thing making it read as a
 * stage.
 *
 * Which makes the alt text content, not decoration. Every other photograph on
 * this build takes `alt=""` because it illustrates copy that already says the
 * thing; these say where and when, which a reader who cannot see them still
 * needs. Localized, interpolated from the record.
 *
 * The cities and venues are placeholders — no governing document names a city
 * any edition was held in — and `fixtures/content.ts` says so. The photographs
 * are not.
 */
export async function CeremonyGallery({
  editions,
}: {
  editions: CeremonyEdition[];
}) {
  const [t, locale] = await Promise.all([
    getTranslations("about.ceremony"),
    getLocale() as Promise<Locale>,
  ]);

  const withPhotos = editions.filter((edition) => edition.image !== null);
  if (!withPhotos.length) return null;

  const [live, ...archive] = withPhotos;

  const photo = (edition: CeremonyEdition, sizes: string, priority = false) => (
    <Image
      src={edition.image!.src}
      alt={t("photoAlt", { year: edition.year, city: edition.city[locale] })}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );

  const venue = (edition: CeremonyEdition) =>
    edition.venue ? edition.venue[locale] : t("venueTba");

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 lg:col-span-5">{t("title")}</h2>
          <p className="max-w-[52ch] text-body-md text-navy-600 lg:col-span-6 lg:col-start-7">
            {t("description")}
          </p>
        </div>

        {/* The live edition. Boxed rather than bled, so it is the width of
            everything else on the page, and still most of a screen tall.

            `svh` rather than `vh`: on a phone an address bar collapsing
            mid-scroll would otherwise resize the frame under the reader's
            thumb. */}
        <div className="relative mt-14 h-[52svh] min-h-[20rem] w-full overflow-hidden lg:mt-20 lg:h-[64svh]">
          {photo(live, "(max-width: 1024px) 100vw, 82vw")}
          <Scrim />

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 p-7 sm:p-9 lg:p-11">
            <div>
              <h3 className="text-display-md text-cream-50">
                {live.city[locale]}
              </h3>
              <p className="mt-3 font-display text-coord uppercase text-cream-200/80">
                {venue(live)}
              </p>
            </div>
            {/* Gold, because this is the current edition — the same token the
                live window and the live year use everywhere else. */}
            <p className="font-data text-data-lg tabular-nums text-gold">
              {live.year}
            </p>
          </div>
        </div>

        {/* The editions behind it, spaced rather than seamed, and captioned on
            the frame like the live one. Every card carries its own city now,
            so the ground between them is the section's white rather than a
            navy caption bar — which is what a seam turned into the moment the
            section stopped being dark. */}
        {archive.length ? (
          <ul
            className={cn(
              "mt-6 grid gap-6",
              archive.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1",
            )}
          >
            {archive.map((edition) => (
              <li
                key={edition.id}
                className="relative aspect-[3/2] w-full overflow-hidden"
              >
                {photo(edition, "(max-width: 640px) 100vw, 40vw")}
                <Scrim />

                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 p-6 sm:p-7">
                  <div>
                    <h3 className="text-h2 text-cream-50">
                      {edition.city[locale]}
                    </h3>
                    <p className="mt-2 font-display text-coord uppercase text-cream-200/80">
                      {venue(edition)}
                    </p>
                  </div>
                  <p className="font-data text-data-md tabular-nums text-cream-100">
                    {edition.year}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The one thing a caption on a photograph cannot do without.
 *
 * Two thirds of the frame, from the ground colour up. The captions are cream
 * on stage lighting that runs from near-black to a lit projection screen, and
 * the frames are art-directed as shot rather than graded, so the type has to
 * bring its own ground with it.
 */
function Scrim() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent"
    />
  );
}
