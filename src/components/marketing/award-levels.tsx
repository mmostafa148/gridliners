import { getTranslations } from "next-intl/server";

import { AwardBadge } from "@/components/brand/brand-assets";
import { SectionHeading } from "@/components/marketing/section-heading";
import { api } from "@/lib/api";
import { TIERS } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The three award levels, as three bands of metal.
 *
 * Twice this section was built as artwork placed on a page: ribbons in a row,
 * then ribbons in a framed panel. Both were correct and both read as filler,
 * because at ribbon size the metal is a detail and the page is still mostly
 * ground. Here the metal IS the page. Each level takes a full-bleed band in its
 * own colour, the name is set at display size on it, and the only thing left
 * over is a navy block at the band's end holding the ribbon itself.
 *
 * The ribbon needs that block. It is metal artwork, and a gold ribbon on a gold
 * band is invisible — the block is the same pixel device the rest of the
 * identity is built from, doing an actual job.
 *
 * The foils in public/brand/texture are deliberately not used here; see the note
 * on FOIL in brand-assets. Flat brand colour, not a JPEG of a print effect.
 */

const BANDS = [
  { level: "gold", rank: "01", ground: "bg-gold" },
  { level: "silver", rank: "02", ground: "bg-silver" },
  // Bronze at 80% over the section's cream. At full strength it is a mid-tone
  // that no ink clears 4.5:1 on: navy reaches 3.72:1 and cream only 4.17:1.
  // Lightened it takes navy at 5.2:1, and it also stops being the odd one out
  // in a ramp where gold and silver are both far lighter than it.
  { level: "bronze", rank: "03", ground: "bg-bronze/80" },
] as const;

export async function AwardLevels() {
  const [t, subCategories] = await Promise.all([
    getTranslations("home.awards"),
    api.taxonomy.subCategories(),
  ]);

  const subs = subCategories.length;
  const groups = subs * TIERS.length;
  // Fixed, not sampled: a cell picked at render would move between the server
  // and the client and the two paints would disagree.
  const cell = subs + Math.floor(subs / 2);

  return (
    <section className="bg-cream-100 text-navy-900">
      <div className="page-shell section-y">
        <div className="max-w-3xl">
          <SectionHeading title={t("title")} description={t("description")} />
        </div>
      </div>

      {/* Full bleed: the bands are the section, so they run to the viewport
          edge and only their contents sit on the page grid. */}
      <ul className="scene">
        {BANDS.map(({ level, rank, ground }) => (
          <li key={level} className={cn("group relative", ground)}>
            {/* The end cap runs to the viewport edge, not the shell's. Stopped
                at the gutter it left a strip of metal beyond it and read as
                something floating on the band rather than closing it. Full
                bleed, the three of them stack into a navy column down the
                page's end edge. */}
            <div
              aria-hidden
              className="absolute inset-y-0 end-0 z-10 hidden w-48 items-center justify-center bg-navy-900 sm:flex"
            >
              <div className="tilt group-hover:tilt-flat">
                <AwardBadge colorway={level} height={116} alt="" />
              </div>
            </div>

            <div
              className={cn(
                "page-shell grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-5 py-9",
                // Three tracks once there is room: the line goes to the far end
                // rather than under the name, so the band is used across its
                // whole width instead of holding 800px of empty metal between
                // the copy and the cap.
                "sm:grid-cols-[auto_auto_1fr] sm:gap-x-12 sm:py-12 sm:pe-64",
              )}
            >
              {/* aria-hidden: the rank is said in words by the line beneath it.
                  This is the same fact at the size the band can carry. */}
              <span
                aria-hidden
                className={cn(
                  "font-display leading-none tabular-nums text-navy-900/35",
                  "text-[clamp(2.25rem,4.5vw,4rem)] transition-colors duration-300",
                  "group-hover:text-navy-900/60",
                )}
              >
                {rank}
              </span>

              <h3 className="font-display text-[clamp(1.875rem,3.6vw,3.25rem)] uppercase leading-none">
                {t(`${level}.name`)}
              </h3>

              {/* Solid navy, no opacity. The line is normal-size text on a
                  coloured ground, so it needs the full 4.5:1 and has none to
                  spare; the hierarchy is carried by the size difference against
                  the name, which is enormous. */}
              <p
                className={cn(
                  "col-span-2 max-w-[26rem] text-[clamp(1rem,1.25vw,1.25rem)] text-navy-900",
                  "sm:col-span-1 sm:justify-self-end",
                )}
              >
                {t(`${level}.body`)}
              </p>

              {/* Narrow screens get the same block in flow, since a cap pinned
                  to the end edge has nowhere to go once the band is one column
                  wide. The ribbon needs a navy ground either way: it is metal
                  artwork, and a gold ribbon on a gold band is invisible. */}
              <div className="col-span-2 w-fit bg-navy-900 px-6 py-5 sm:hidden">
                <AwardBadge colorway={level} height={72} alt="" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="page-shell grid gap-7 py-16 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 md:py-20">
        {/* The matrix at one square per group, in the identity's own pixel. The
            picked cell is the group the three bands above describe: the section
            shows the levels at full size, then where one set of them sits in the
            whole. Real rather than illustrative, so its shape changes when the
            taxonomy does. */}
        {/* A definite width, not w-full. The track is auto-sized and the grid's
            own columns are all minmax(0,1fr), so there is no intrinsic width to
            resolve against and the whole diagram collapsed to nothing. */}
        <div
          aria-hidden
          className="grid w-[22rem] max-w-full gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${subs}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: groups }, (_, i) => (
            <span
              key={i}
              className={cn(
                "aspect-square",
                // gold-deep, not gold: the picked cell has to be the darkest
                // thing in the grid, and flat gold on cream is lighter than the
                // squares around it, which reads as a hole rather than as the
                // one that counts.
                i === cell ? "bg-gold-deep" : "bg-navy-900/18",
              )}
            />
          ))}
        </div>
        {/* The number is the argument. "Fair" is a claim anyone can print; a
            count of how many separate podiums the cycle actually runs is
            checkable, and it is the one fact the heading does not carry. */}
        <p className="max-w-md text-body-sm text-navy-600">
          {t("matrix", { groups, subs, tiers: TIERS.length })}
        </p>
      </div>
    </section>
  );
}
