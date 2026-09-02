import { getTranslations } from "next-intl/server";

import { PixelGrid } from "@/components/brand/pixel-grid";

/**
 * What we are for: Mission and Vision, facing each other across the motif.
 *
 * Two attempts at this section failed the same way. Split into coloured halves
 * it was two boxes; set on overlapping planes it was two blocks floating on a
 * field with dead space between them. Both were trying to make the *containers*
 * express a relationship the type should express on its own.
 *
 * So there are no containers. The two statements sit side by side on one
 * ground, at the same size, on the same measure, with the same heading level
 * and the same marker. Nothing is holding them; they are simply both true.
 *
 * A pixel divider and then a pixel band were tried between them and both were
 * cut: `PixelGrid` jitters one boundary per lane, so anything narrower than
 * about six lanes renders as a solid slab with a notch rather than a dissolve.
 * The motif survives at marker size instead, where three hand-placed squares
 * say the same thing and weigh nothing.
 *
 * `about.purpose.title` becomes a visible heading rather than an `aria-label`.
 * The section had no heading a sighted reader could see, which made two
 * unattributed statements out of what is actually one answer to one question.
 * The labels drop to `h3` under it, so the outline reads the way the page does.
 */
export async function MissionVision() {
  const t = await getTranslations("about.purpose");

  const faces = [
    { key: "mission", title: t("missionTitle"), body: t("missionBody") },
    { key: "vision", title: t("visionTitle"), body: t("visionBody") },
  ];

  return (
    <section className="relative overflow-hidden bg-navy-950 text-cream-100">
      {/* A floor: solid along the bottom edge and breaking upward, running the
          full width and off both ends. Dissolving on the vertical axis means
          the lanes are columns, and there are two dozen of them, so the
          staircase actually reads — which is what a narrow divider and a
          three-row band could not do here.

          It sits under the statements rather than between them, so it gives the
          section a base without dividing a pair that is meant to be read as
          one answer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      >
        <PixelGrid
          direction="up"
          seed={5}
          cols={30}
          rows={3}
          density={0.5}
          cellSize="clamp(1.5rem, 3.4vw, 3.5rem)"
          cellClassName="bg-blue-700/35"
        />
      </div>

      {/* The extra bottom padding is the floor's height, reserved. Type over
          the staircase is legible but reads as an accident. */}
      <div className="page-shell section-y relative pb-[calc(var(--section-y)+7rem)]">
        <h2 className="text-h1 text-cream-50">{t("title")}</h2>

        <div className="mt-14 grid gap-x-16 gap-y-14 lg:mt-20 lg:grid-cols-2">
          {/* Mission first in the source, so it is the one met first in either
              direction. */}
          <Face {...faces[0]} />
          <Face {...faces[1]} />
        </div>
      </div>
    </section>
  );
}

/**
 * Three squares stepping down in weight — the motif at marker size.
 *
 * Hand-placed rather than a `PixelGrid`, because `PixelGrid` jitters one
 * boundary per lane and a mark this small has one or two lanes: it renders as a
 * solid bar with a notch, which is what a divider column and then a band both
 * turned into here before they were cut. At three cells the dissolve is the
 * composition, so it is written out.
 */
function Mark() {
  return (
    <span aria-hidden className="flex gap-1">
      <span className="size-2.5 bg-blue-600" />
      <span className="size-2.5 bg-blue-600/55" />
      <span className="size-2.5 bg-blue-600/25" />
    </span>
  );
}

function Face({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <Mark />
      <h3 className="mt-5 font-display text-coord uppercase text-cream-200/70">
        {title}
      </h3>
      {/* `text-h2`, not `text-h3`. The h3 step resolves to 1.15vw, which is
          20px at 1440 — body size with a heavier weight, which is why the pair
          read as flat however they were arranged. A statement this section is
          named after has to be a size a reader stops at. */}
      <p className="mt-6 max-w-[34ch] text-h2 text-cream-100">{body}</p>
    </div>
  );
}
