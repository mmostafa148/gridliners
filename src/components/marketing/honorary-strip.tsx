import { getLocale, getTranslations } from "next-intl/server";

import { WinnerPortrait } from "@/components/marketing/winner-portrait";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type {
  HonoraryDesignation,
  HonoraryDesignationOption,
} from "@/lib/api/types";

/**
 * The honorary designations of one year.
 *
 * **A different award system, and the section says so by being separate.**
 * Addendum §21: honorary awards are not enterable and never paid, are
 * jury/Admin-designated, attach to a **person or entity** rather than
 * necessarily to an entry, use the **black** colorway, and their certificate
 * omits the Tier line. They live outside the vote-ranking model entirely.
 *
 * So they are never mixed into a podium, never carry a medal chip, and never
 * sit under a tier heading. Putting a Designer of the Year inside a
 * Gold/Silver/Bronze group would state that it was won the same way, by votes
 * inside a `sub-category × tier` group, which is exactly what it was not.
 *
 * `api.results.honorary()` already filters to `published`, so an unannounced
 * designation cannot reach this component.
 *
 * The citation is the designation's own bilingual text and is the only thing
 * here that explains a choice - which is right for an award that was chosen
 * rather than counted.
 */
/** The two supplied honorary portraits, alternated by position. */
const HONORARY_PORTRAITS = [
  "/media/winners/honorary.webp",
  "/media/winners/honorary.webp",
];

export async function HonoraryStrip({
  designations,
  options,
}: {
  designations: HonoraryDesignation[];
  /** Taxonomy names for each designation type, in the taxonomy's own order. */
  options: HonoraryDesignationOption[];
}) {
  const [locale, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("winners.honorary"),
  ]);

  if (!designations.length) return null;

  const nameOf = new Map(options.map((option) => [option.id, option.name]));
  const order = new Map(options.map((option) => [option.id, option.order]));
  const ordered = [...designations].sort(
    (a, b) => (order.get(a.type) ?? 99) - (order.get(b.type) ?? 99),
  );

  return (
    <section className="bg-navy-950 text-cream-100">
      {/* The fourth chapter band, and it pins like the three tiers do.
       *
       * **navy-950 where the tiers are navy-900.** The tonal step is the
       * separation §21 asks for: the tiers are chapters of one contest and this
       * is a different award system, so it sits on the page's deepest ground
       * rather than alongside them. It follows light cards, so unlike a tier
       * band it needs no hairline to be seen.
       *
       * The lead travels with its title into the band rather than being left
       * behind above it - it is the one line that says these are chosen rather
       * than counted, which is exactly what a reader scrolling a set of
       * honorary cards needs kept in view.
       */}
      {/* Offset from `--chrome-h`, not from a hard-coded 2.5rem + 4.5rem. The
      announcement bar is 2.5rem **when there is an announcement** and renders
      nothing when there is not, and `site-frame.tsx` already publishes exactly
      that: `--chrome-h` is `calc(0rem + 4.5rem)` with no bar and `calc(2.5rem +
      4.5rem)` with one. Hard-coding the bar parked this band 40px below the
      header on every page where no announcement was live, with the content
      scrolling through the gap. The fixture's only announcement expired on
      2026-08-30, so the site had been in that state since. */}
      <div className="bg-navy-950 lg:sticky lg:top-[calc(var(--chrome-h)+1px)] lg:z-20">
        <div className="page-shell py-9 lg:py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-12 gap-y-3">
            <h2 className="text-h1 text-balance">{t("title")}</h2>
            <p className="max-w-[54ch] text-body-sm text-cream-200/85">
              {t("lead")}
            </p>
          </div>
        </div>
      </div>
      {/* The cards take the medals' treatment exactly - full-bleed tiles on the
          alternating light grounds - so the page has one card language. What
          keeps the separation §21 asks for is the navy band above them, which
          no tier heading has, and the black colorway, which finally reads:
          `#161616` on navy was a darker patch on a dark ground, and on mist and
          white it is the colorway the addendum actually specifies.

          Columns follow the designations, never a fixed count. 2024 designates
          one recipient, and at `grid-cols-3` it left two empty tracks beside
          it - the same defect the podium grid had, and the same fix. */}
      <ul className="grid">
        {ordered.map((designation, i) => (
          <li
            key={designation.id}
            className={cn(
              // The ground bleeds, the content lines up with the shell, one
              // designation to a row - the same arrangement the medals take, so
              // the two sections read as one page.
              "flex border-t border-navy-900/12 page-edge-pad page-edge-pad-end",
              i % 2 === 0 ? "bg-mist" : "bg-white",
            )}
          >
            <article
              data-honorary={designation.type}
              className="group @container flex h-full w-full flex-col text-navy-900"
            >
              {/* The medals' composition in the black colorway: the recipient
                  in front of a field of honorary cells, the record beside them.
                  What it does not take is a rank plate - an honorary
                  designation is not placed inside a group and has no rank to
                  print. */}
              <div className="grid min-h-[22rem] flex-1 @2xl:min-h-[34rem] @2xl:grid-cols-[1fr_2fr]">
                <WinnerPortrait
                  photo={HONORARY_PORTRAITS[i % HONORARY_PORTRAITS.length]}
                  slug={designation.id}
                  metal="bg-honorary"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="h-full bg-transparent"
                />

                <div className="flex flex-col gap-5 p-7 @2xl:gap-6 @2xl:p-10">
                  <span className="flex items-center gap-5">
                    <span className="shrink-0 font-display text-coord uppercase text-navy-600">
                      {t("label")}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-honorary" />
                  </span>

                  <h3 className="leading-tight text-h2 @lg:text-h1 @2xl:text-display-md">
                    {designation.subject.name}
                  </h3>

                  <p className="flex flex-wrap items-baseline gap-x-3 font-display text-coord uppercase text-navy-600">
                    <span className="text-navy-900">
                      {nameOf.get(designation.type)?.[locale] ??
                        designation.type}
                    </span>
                    <span aria-hidden className="text-navy-900/30">
                      /
                    </span>
                    <span>{t(`subject.${designation.subject.kind}`)}</span>
                  </p>

                  {/* The rule spans the column and the citation is measured
                      inside it. With the cap on the `<p>` itself the border
                      stopped where the text did, which on a full-width card
                      read as a stray line halfway across.

                      No `mt-auto`. It existed to line the citations of two
                      cards in a row up with each other, and there are no rows
                      of two any more - all it did on a full-width card was
                      push a two-line citation to the foot and open 250px of
                      nothing above it. */}
                  <div className="border-t border-navy-900/15 pt-5">
                    <p className="max-w-[54ch] text-body-sm text-navy-600">
                      {designation.citation[locale]}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
