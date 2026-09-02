import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The winner, standing in front of the brand's own winner-card field.
 *
 * **The field is Home's, transcribed cell for cell.** `featured-winner.tsx` has
 * carried it since 1.1: a 7 x 5 grid on a 51.15 unit taken from
 * `winner-card-background-gold.svg` - a stepped solid polygon with eight loose
 * cells around it at four strengths, one of them on overlay. A generated field
 * was built here first and was the wrong answer: the site already draws a
 * winner's pixel field, and inventing a second one gave the same page two
 * versions of one motif.
 *
 * Duplicated rather than lifted out of `featured-winner.tsx`, which belongs to
 * approved, closed 1.1 - extracting a shared component would mean editing it.
 * Logged as a `[dupe]` in build-state beside the mark-map and `Scrim`
 * duplicates, with the same reasoning.
 *
 * **The field is behind the winner, not over them.** That is the one thing this
 * does differently from Home, and it is what the client asked for. All four
 * supplied portraits are true cut-outs - RGBA, the figure isolated on full
 * transparency, alpha mean 112 of 255 - so the cells paint first and the person
 * paints on top. The stepped mass sits behind the figure and the loose cells
 * break off it to the end side.
 *
 * Home's field is bottom-anchored at `358.06/205` and takes its height from the
 * card's width, so the cells here are the same relative size as Home's rather
 * than a fifth of the frame each. The rows are squatter than the columns for
 * the reason Home gives: at the artwork's native 358.06 x 255.85 the field
 * swallows the figure.
 *
 * **The portrait is desaturated so the metal is the only colour in the frame.**
 * That is what makes a gold, a silver and a bronze read apart at a glance down
 * a page: one colour against grey.
 *
 * **One photograph per level, framed differently per winner.** `05`-`08` in
 * `public/images` are byte-identical duplicates of `01`-`04`, so the four
 * supplied winner mockups are all there is. A page publishing five golds cannot
 * show five faces it does not have, so the crop is seeded from the entry's slug
 * - the one thing that still varies now the field is the brand's fixed
 * composition - and the duplication is logged rather than disguised. Real
 * entrant photography replaces it.
 *
 * **The frame fills its column and no more.** An earlier pass set
 * `aspect-[4/5]` on a box that also had `h-full`: an item with an aspect ratio
 * does not stretch to its grid track, so it took its width from its height
 * instead - 436px inside a 320px column - and, being positioned, painted the
 * overflow straight over the winner's name. Height comes from the row and width
 * from the track; nothing here derives one from the other.
 */

/** Deterministic 32-bit hash - the same one the rest of the build uses. */
function hash(seed: number, x: number, y: number): number {
  let h = (seed * 374761393 + x * 668265263 + y * 2246822519) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 9973;
}

/** Cells are [column, row], zero-indexed from the field's top start corner. */
const SOLID: [number, number][] = [
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
  [0, 4], [1, 4], [2, 4],
];

/** [column, row, opacity, overlay?] */
const LOOSE: [number, number, number, boolean?][] = [
  [0, 0, 0.4], [1, 0, 0.7],
  [4, 2, 0.7], [5, 2, 0.7, true],
  [4, 3, 0.9], [6, 3, 0.2],
  [3, 4, 0.7], [5, 4, 0.7],
];

export function WinnerPortrait({
  photo,
  slug,
  metal,
  dir = "ltr",
  className,
}: {
  /** null for a ranked place that took no medal - there is no winner to show. */
  photo: string | null;
  slug: string;
  /** The metal's cell class: `bg-gold`, `bg-silver`, `bg-bronze`, `bg-honorary`. */
  metal: string;
  /**
   * The page's direction.
   *
   * `object-position` is physical and the field's grid is logical, so without
   * this the two mirror apart: the mass moves to the end side in Arabic and the
   * winner stays where they were, standing on it.
   */
  dir?: "ltr" | "rtl";
  className?: string;
}) {
  // The winner stands toward the END of their box, which is the other half of
  // keeping the mass clear. A cover crop wider than its box chooses a slice: a
  // low percentage takes a slice left of centre, which puts a centred figure to
  // the right of it. 18% to 30%, seeded, so the four repeated photographs are
  // at least framed differently from card to card.
  //
  // Anchored to the head vertically: on a short frame a foot-anchored `cover`
  // crops from the top and takes the winner's head off.
  const x = Math.round(18 + hash(seedFrom(slug), 99, 99) * 12);
  const focus = `${dir === "rtl" ? 100 - x : x}% top`;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-navy-950",
        // Stacked on a phone the frame has only this to give it height. A frame
        // with no winner in it needs far less: a place that took no medal would
        // otherwise open with a 320px void above its own name.
        photo ? "min-h-80" : "min-h-40",
        className,
      )}
    >
      {/* First in the DOM, so the winner below stands in front of it.
       *
       * **Capped, not full-bleed across the frame.** Home draws this field on a
       * card about 300px wide, which puts its cells at roughly 43px. Spanning
       * the frame here made them 68px at 1440 and 98px on a wide monitor - the
       * same composition at nearly twice the scale, which is not the same
       * motif. The cap holds the cells at Home's size at any card width, and
       * below it the field simply spans what there is. */}
      <div
        data-field
        className="absolute bottom-0 start-0 grid aspect-[358.06/255.85] w-full max-w-[22rem] grid-cols-7 grid-rows-5"
      >
        {SOLID.map(([col, row]) => (
          <span
            key={`s${col}-${row}`}
            aria-hidden
            className={metal}
            style={{ gridColumn: col + 1, gridRow: row + 1 }}
          />
        ))}
        {LOOSE.map(([col, row, opacity, overlay]) => (
          <span
            key={`l${col}-${row}`}
            aria-hidden
            className={metal}
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              opacity,
              mixBlendMode: overlay ? "overlay" : undefined,
            }}
          />
        ))}
      </div>

      {/* The winner stands ON the field, not across all of it.
       *
       * Filling the frame was right while the field was generated and spread
       * over the whole of it. Home's composition is not spread: its solid mass
       * holds the start columns, which is exactly where a centred figure
       * stands, and at half measure the two instructions cancelled - the field
       * was there and none of it could be seen. Insetting the figure toward the
       * end side leaves the mass clear and puts the winner in front of the part
       * of the field that breaks off it, which is the interlock the reference
       * asked for in the first place.
       *
       * `start`/`end`, so the figure and the field mirror together: the grid's
       * column 1 is the start column in either direction. */}
      {/* **Translated, not resized.** The box keeps its 78% width and moves 9%
          toward the start. Changing `start` alone widened it, and on a wide
          monitor - where the frame is 586px and `cover` is width-constrained
          rather than height-constrained - a wider box renders the winner 12%
          rescaled. Measured at 2053 with the figure's own pixels: the original
          box put it at 239..468 and 229 wide, `start-13 end-0` put it at
          243..421 and 178 wide - rescaled and barely moved - and this puts it
          at 186..415 and 229 wide, the same size 53px further toward the start.

          At 1440 the frame is 443px, `cover` is height-constrained, and the
          same edit changes nothing - which is why measuring there proved
          nothing and the first attempt looked correct. */}
      {photo ? (
        <span className="absolute inset-y-0 end-[9%] start-[13%] block">
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 30vw, 25vw"
            style={{ objectPosition: focus }}
            // `object-cover`. The cut-out canvas is 1792x2400 with the figure
            // inside a wide transparent margin, so `contain` fits the MARGIN to
            // the box and leaves the winner small in the middle of it; cover
            // crops the margin away and fills it with the person. Desaturated,
            // so the metal is the only colour in the frame.
            className="object-cover grayscale"
          />
        </span>
      ) : null}
    </div>
  );
}
