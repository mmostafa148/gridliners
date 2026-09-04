import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { TierMark } from "@/components/brand/tier-mark";
import { WinnerPortrait } from "@/components/marketing/winner-portrait";
import { ProjectPlaceholder } from "@/components/shared/project-placeholder";
import { EmptyState } from "@/components/shared/status-patterns";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { countryName } from "@/lib/display-names";
import type {
  WinnerLevelView,
  WinnerTierView,
  WinnerView,
} from "@/lib/winners";
import { cn } from "@/lib/utils";

/**
 * The winners of one year, by tier and then by group.
 *
 * **The first pass was a register, and this is the correction.** It set every
 * place in an equal white box with a 40px metal strip along the top, the
 * project title at `text-h4` - smaller than the heading above it - and all
 * three tiers in one undifferentiated white slab. It carried no imagery at all,
 * which made the peak of the site its plainest page while Categories,
 * Finalists and About all carry photography. And rank was expressed only by a
 * word and a strip of colour, so a podium read as three equal cells.
 *
 * Four things changed, and each one is the site's own settled language:
 *
 *  - **The metal carries the card.** `AwardLevels` already decided this for the
 *    build - "here the metal IS the page" - so the plate is the card's ground
 *    rather than a chip on it, and gold, silver and bronze are read before the
 *    words are.
 *  - **Rank is scale.** Gold takes the wide frame and the display-size title;
 *    silver and bronze sit beneath it at half its measure. A podium that ranks
 *    by size does not need to be read to be understood.
 *  - **The work is shown.** Every place carries its project's frame, the way a
 *    finalist row does, resolved in `lib/winners.ts`.
 *  - **The tiers alternate grounds**, white then mist then white, which is §1A's
 *    reading rhythm and what every approved screen does.
 *
 * **All three tiers, always, and shown rather than selected.** 1.7's own
 * arithmetic: 2025 publishes 13 results in 5 groups and 2024 publishes 3 in 2.
 * A tier a year awarded nothing in still renders, named and empty.
 *
 * **A non-placer never reaches this component** - `lib/winners.ts` drops
 * `did_not_place` rows - so nothing here has to remember that finalized groups
 * still carry the people who did not place.
 */
export async function WinnersBoard({ tiers }: { tiers: WinnerTierView[] }) {
  const [locale, tTier, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("tier"),
    getTranslations("winners"),
  ]);

  return (
    <>
      {tiers.map((tier) => (
        <section
          key={tier.tier}
          id={`tier-${tier.tier}`}
          aria-labelledby={`h-${tier.tier}`}
          // The tier no longer carries the alternation; the cards do, row by
          // row, and two alternations running at once would fight. What tells a
          // reader they have moved to another judging population is the named
          // heading band and the rule under it.
          className="bg-white text-navy-900"
        >
          {/* **The tier is a chapter band, not a label on a white field.**
              It was a heading floating in its own vertical padding with a
              hairline under it - and the hairline stopped at the page shell
              while the cards below ran to the viewport edge, so the one line
              meant to separate them disagreed with the thing it was separating.
              There was a screen of empty white above it as well.

              The band is the site's own ceremonial ground, which is what the
              page header above it and the honorary section below it are already
              made of. Three of them divide the page into chapters, the light
              tiles are their content, and the change of ground does the
              separating that a rule was failing to do. Nothing floats and
              nothing needs a line under it. */}
          {/* navy-900, one step up from the page header's navy-950, and a
              cream hairline across the top. Both are needed: the first band
              sits directly under the header, and at the same value the two
              merged into one continuous navy block, so the tier read as part of
              the page's own title rather than as the first chapter under it. */}
          {/* **Pinned while you are inside the tier.** The longest tier is 3.8
              screens at 1440 and the page is 14.2, so the band is worth keeping
              in view - and keeping it here rather than moving it to a rail
              beside the cards is what lets the winner's frame go on starting at
              the shell gutter. A sticky rail needs a reserved column, which is
              exactly the full-bleed the cards were given.

              Sticky inside its own `<section>`, so each band holds until the
              next tier pushes it off rather than stacking. The offset is the
              announcement bar plus the docked rail, the same one the shortlist
              filter slab uses. `lg` up only: on a phone the rail is not docked
              and a pinned band would spend screen a 390px viewport has not got.

              `z-20` because the cards below carry `relative`. */}
          {/* Offset from `--chrome-h`, not from a hard-coded 2.5rem + 4.5rem.
          The announcement bar is 2.5rem **when there is an announcement** and
          renders nothing when there is not, and `site-frame.tsx` already
          publishes exactly that: `--chrome-h` is `calc(0rem + 4.5rem)` with no
          bar and `calc(2.5rem + 4.5rem)` with one. Hard-coding the bar parked
          this band 40px below the header on every page where no announcement
          was live, with the content scrolling through the gap. The fixture's
          only announcement expired on 2026-08-30, so the site had been in that
          state since. */}
          <div className="border-t border-cream-100/20 bg-navy-900 text-cream-100 lg:sticky lg:top-[calc(var(--chrome-h)+1px)] lg:z-20">
            <div className="page-shell py-9 lg:py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
                <h2
                  id={`h-${tier.tier}`}
                  className="flex items-center gap-4 text-h1 text-cream-50"
                >
                  {/* Cream, never a metal. `TierSeparation` settled this for the
                      build: a metal on a tier says a company is gold and a
                      student is bronze, which is the opposite of what the tiers
                      mean. */}
                  <TierMark
                    tier={tier.tier}
                    className="size-7 shrink-0 text-cream-200/70"
                  />
                  {tTier(tier.tier)}
                </h2>
                <p className="font-display text-coord uppercase text-cream-200/85">
                  {t("tierCount", {
                    medals: tier.medalCount,
                    groups: tier.groupCount,
                  })}
                </p>
              </div>
            </div>
          </div>
          {tier.levels.length === 0 ? (
            <div className="page-shell py-16 lg:py-24">
              <EmptyState
                title={t("tierEmpty.title")}
                description={t("tierEmpty.description")}
              />
            </div>
          ) : (
            <div>
              {tier.levels.map((level, n) => {
                // The ground alternates across the WHOLE tier, not inside one
                // level. Each level is its own `ul`, so `nth-child` restarts at
                // 1 in every one of them - and a tier of single-medal levels
                // came out entirely mist. What carries over is the count of
                // cards before this block, which is also the count of rows now
                // that every card takes a row of its own.
                const cardsBefore = tier.levels
                  .slice(0, n)
                  .reduce((k, l) => k + l.places.length, 0);
                return (
                  <LevelBlock
                    key={level.level}
                    level={level}
                    locale={locale}
                    cardParity={cardsBefore % 2}
                  />
                );
              })}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

/**
 * One award level inside one tier: all its Golds, or all its Silvers.
 *
 * **Grouped by level rather than by group heading** (§1.7 `[map-update]`,
 * 2026-08-28). 2025 has five groups, several holding one or two cards, and a
 * heading over each turned the page into a run of fragmented little grids. The
 * group a medal was won in has not changed and is not dropped - every card
 * names its own sub-category, so it is stated on the card instead of above it.
 *
 * Levels group **inside a tier, never across the site**: a flat list of every
 * Gold would state a ranking across tiers that does not exist.
 *
 * Within a level the places keep taxonomy order, so Gold reads down the
 * categories in the same sequence Silver does.
 */
async function LevelBlock({
  level,
  locale,
  cardParity,
}: {
  level: WinnerLevelView;
  locale: Locale;
  /** Cards before this block in the tier, mod 2 - where the ground starts. */
  cardParity: number;
}) {
  const t = await getTranslations("winners");
  const levelName = t(`level.${level.level}`);

  return (
    /* No visible heading. The sheet prints "GOLD WINNER" on its own metal, so
       a label beside the row said it a second time - and the tier heading above
       already carries the counts. The grouping is still real and still
       announced: `aria-label` names it for a screen reader, which is the only
       reader the cards do not already tell.

       The 7rem label column went with it, so a section now takes the whole
       measure. */
    <section data-level-block={level.level} aria-label={levelName}>
      {/* **One winner to a row, at every width.** Two-up was tried and set
          aside: a winner is a section, and a section that stops halfway across
          the page is a column. At full measure the frame carries the field at a
          size that reads, the record has the room it needs, and the run down the
          page is one rhythm rather than a grid.

          Edge to edge with no gutter of its own - the ground runs off both
          edges of the viewport and only the content inside it lines up with the
          page shell. The hairline between cards is what separates one winner
          from the next, since there is no gap left to do it. */}
      <ul className="grid">
        {level.places.map((place, i) => (
          <li
            key={place.resultId}
            className={cn(
              "flex border-t border-navy-900/12 page-edge-pad page-edge-pad-end",
              // A row is one card, so the ground simply alternates. The parity
              // shifts where the pattern starts so it runs continuously across
              // the tier's levels rather than restarting in each `ul`.
              cardParity === 0
                ? "odd:bg-mist even:bg-white"
                : "odd:bg-white even:bg-mist",
            )}
          >
            <Place place={place} index={i} locale={locale} label={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One awarded place: the winner in front of the brand's field, the record
 * beside them and the work under it.
 *
 * **There are three levels and there is no fourth.** 1.7 was planned and built
 * to publish a withheld place as an explicit "no medal awarded" card, and that
 * was wrong twice over: Addendum §36 says a withheld medal is "simply not
 * awarded", so there is no award for a winners page to publish, and §60 files
 * medal withholding in the admin audit log rather than in anything public. It
 * also invented a fourth level on a page that has three, and published a
 * negative fact about a named entrant among the winners. `lib/winners.ts` drops
 * those rows now, so this component only ever sees a medal.
 *
 * `MedalBadge`'s own `withheld` mode was evaluated and not used either, for a
 * reason that no longer arises: it strikes through the level word, and the one
 * withheld row carries `level: did_not_place`, so it would have printed a
 * struck-through "Did not place" over a ranked entrant.
 */
/** The rank numeral per level, the pairing `AwardLevels` already sets. */
const RANK: Record<"gold" | "silver" | "bronze", string> = {
  gold: "01",
  silver: "02",
  bronze: "03",
};

/** The metal: as cells over the portrait, as a rule, and as a plate. */
const METAL: Record<
  "gold" | "silver" | "bronze",
  { cell: string; rule: string; plate: string }
> = {
  gold: { cell: "bg-gold", rule: "bg-gold", plate: "bg-gold text-navy-900" },
  silver: {
    cell: "bg-silver",
    rule: "bg-silver",
    plate: "bg-silver text-navy-900",
  },
  bronze: {
    cell: "bg-bronze",
    rule: "bg-bronze",
    plate: "bg-bronze text-white",
  },
};

/** The two supplied portraits per level, alternated by position. */
const PORTRAITS: Record<"gold" | "silver" | "bronze", string[]> = {
  gold: ["/media/winners/gold.webp", "/media/winners/gold.webp"],
  silver: ["/media/winners/silver.webp", "/media/winners/silver.webp"],
  bronze: ["/media/winners/bronze.webp", "/media/winners/bronze.webp"],
};

async function Place({
  place,
  index,
  locale,
  label,
}: {
  place: WinnerView;
  index: number;
  locale: Locale;
  label: Awaited<ReturnType<typeof getTranslations<"winners">>>;
}) {
  const contentDir = place.contentLanguage === "ar" ? "rtl" : "ltr";
  const metal = METAL[place.level];
  const photo = PORTRAITS[place.level][index % PORTRAITS[place.level].length];

  return (
    /* The winner under the grid, the work beside them, the record between.
     *
     * Four passes kept one skeleton - a portrait next to a column of type in a
     * hairline box - and changed its ornament each time, which is why each read
     * as basic. This is the client's own reference: a monochrome portrait
     * interlocked with a field of coloured squares, which happens to be this
     * brand's motif exactly.
     *
     * The card carries three things rather than two, and that is what closes
     * the space the earlier passes left empty: **the winner** under the metal
     * field, **the record** - rank, title, group, maker, country, citation -
     * and **the work itself**, which had never appeared on this page at all.
     */
    <Link
      // The project, not the award record. This pointed at `/awards/[resultId]`,
      // which is a Phase 3.1 carry-forward that **has never been built** - so
      // every winner tile on this page resolved to the localized 404, seventeen
      // of them. `/projects/[slug]` is the page a reader wants from a winner
      // anyway: the work, its maker, its groups and its medals. Checked against
      // the fixtures rather than assumed - all 17 published medal winners are
      // `shortlisted` entries, which is exactly the set that has a project page.
      href={`/projects/${place.slug}`}
      data-level={place.level}
      className="group @container relative flex h-full w-full flex-col text-navy-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
    >
      {/* Container queries, not breakpoints. The card is the full measure now,
          but that measure is still a range - 2053px on a wide monitor, 1440,
          390 on a phone - and the split follows the card rather than the
          window.

          The section carries real height. Without a floor the card collapsed to
          the height of its own type, which left the winner cropped to a band. */}
      <div className="grid min-h-[22rem] flex-1 @2xl:min-h-[34rem] @2xl:grid-cols-[1fr_2fr]">
        <WinnerPortrait
          photo={photo}
          slug={place.slug}
          metal={metal.cell}
          dir={locale === "ar" ? "rtl" : "ltr"}
          // Transparent, so the frame takes the card's own alternating ground
          // rather than painting one of its own over it.
          className="h-full bg-transparent"
        />

        <div className="flex flex-col gap-5 p-7 @2xl:gap-6 @2xl:p-10">
          {/* The head: the award word at the start, a rule across the measure,
              the rank on its own metal plate at the far end. */}
          <span className="flex items-center gap-5">
            <span className="shrink-0 font-display text-coord uppercase text-navy-600">
              {label(`level.${place.level}`)}
            </span>
            <span aria-hidden className={cn("h-px flex-1", metal.rule)} />
            {/* aria-hidden: the award word at the other end of this rule says
                the same thing. */}
            <span
              aria-hidden
              className={cn(
                "shrink-0 px-4 py-1.5 font-data text-data-lg leading-none tabular-nums",
                metal.plate,
              )}
            >
              {RANK[place.level]}
            </span>
          </span>

          {/* The record on the start side, the work on the end side. The
              record is capped at its own measure and the card is the full
              width of the page, so everything past that cap was empty - which
              is where the project belongs, at a size worth looking at.

              One column until `@2xl`: below that the card is not wide enough to
              hold both, and the work goes back under the record. */}
          <div className="flex flex-1 flex-col gap-8 @2xl:flex-row @2xl:items-start @2xl:justify-between @2xl:gap-12">
            <div className="flex flex-col gap-5 @2xl:gap-6">
              {/* Entry content is never translated (§3.8) and carries its own
              `lang`/`dir`. `<bdi>` inline, inside a block that keeps the page's
              direction, so the column stays aligned to the page. */}
              <h4
                className={cn(
                  "text-balance leading-tight transition-colors group-hover:text-blue-700",
                  "text-h2 @lg:text-h1 @2xl:text-display-md",
                )}
              >
                <bdi lang={place.contentLanguage} dir={contentDir}>
                  {place.title}
                </bdi>
              </h4>

              <p className="flex flex-wrap items-baseline gap-x-3 font-display text-coord uppercase text-navy-600">
                <span className="text-navy-900">
                  {place.subCategory.name[locale]}
                </span>
                <span aria-hidden className="text-navy-900/30">
                  /
                </span>
                {place.maker ? (
                  <span>{label("by", { name: place.maker })}</span>
                ) : null}
                {place.maker ? (
                  <span aria-hidden className="text-navy-900/30">
                    /
                  </span>
                ) : null}
                <span>{countryName(place.countryCode, locale)}</span>
              </p>

              <p className="max-w-[54ch] text-body-sm text-navy-600">
                <bdi lang={place.contentLanguage} dir={contentDir}>
                  {place.description}
                </bdi>
              </p>
            </div>

            {/* The work. It is the one thing a winners page was missing: the
                earlier passes showed the person and the record and never the
                project that won. Square, because it sits beside the record
                rather than under it now, and a square holds its own against a
                column of type where a 4:3 letterbox read as a caption. */}
            <span className="relative block size-40 shrink-0 overflow-hidden bg-navy-950 @2xl:size-64">
              {place.cover ? (
                <Image
                  src={place.cover}
                  alt=""
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <ProjectPlaceholder
                  slug={place.slug}
                  title={place.title}
                  parentId={place.subCategory.parentId}
                  className="transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              )}
            </span>
          </div>

          {/* The vote line is what sits at the foot, not the thumbnail. With
              `mt-auto` on the cover the card pushed the picture down and opened
              a hole between it and the description - and the taller card made
              the hole bigger. The record reads top to bottom and the count
              closes it. */}
          <p className="mt-auto flex items-center gap-2 border-t border-navy-900/15 pt-4 font-display text-coord uppercase text-navy-600">
            <span className="font-data text-data-md tabular-nums text-navy-900">
              <span className="sr-only">
                {label("votes", { count: place.votes })}
              </span>
              <span aria-hidden>{place.votes}</span>
            </span>
            {label("votesUnit")}
            <ArrowRight
              aria-hidden
              className="ms-auto size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            />
          </p>
        </div>
      </div>
    </Link>
  );
}
