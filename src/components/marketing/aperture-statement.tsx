import { getTranslations } from "next-intl/server";

import { DuotoneImage } from "@/components/marketing/duotone-image";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { media } from "@/lib/media";

/**
 * The judging promise.
 *
 * The G is a square with a bite taken out of it, which makes it a viewport
 * rather than a letter — so the work is shown *through* it. That is the one
 * device here another awards programme cannot copy, since it is their own
 * letterform doing the framing, and it only says anything if the photograph
 * is inside the mark rather than behind a plate of it.
 *
 * The medals used to sit under this copy. They have their own section now: at
 * ribbon size and without a word of explanation they were ornament beside an
 * argument, and the argument is the point here.
 */

export async function ApertureStatement() {
  const t = await getTranslations("home.aperture");

  return (
    // A floor on the height, because the panel's height is what caps the mark
    // and the copy alone no longer supplies enough of it — with the badges
    // moved out and the title down to two lines the section shrank to 577px,
    // taking the mark from 740 to 529 with it. Centred rather than top-aligned,
    // or the copy sits in the corner of the space the floor creates.
    <section className="relative isolate overflow-hidden bg-white text-navy-900 lg:flex lg:min-h-[46rem] lg:items-center">
      {/* The art hangs off the screen edge rather than the shell's, so the
          panel is positioned rather than placed in the grid — a grid column
          stops at the page gutter by definition, and this is meant to run past
          it. 24px clear on three sides.

          Anchored to the inline end rather than a physical side, since the copy
          keeps the start side in both directions and the panel should follow it
          across when the page mirrors.

          justify-end, not centre: the mark is capped by the panel's height, so
          on a wide screen the panel is wider than the mark needs and centring
          left 127px of nothing between it and the edge it is supposed to be
          aligned to. */}
      <div
        className="absolute inset-y-6 end-6 z-0 hidden w-[46%] items-center justify-end lg:flex"
        // Size containment, not the default inline-size: the mark is sized off
        // min(100cqw, 100cqh), and cqh does not resolve without it. The panel
        // has a definite box on both axes, which is what size containment needs.
        style={{ containerType: "size" }}
        aria-hidden
      >
        {/* Sized off the panel's own box, so the mark fits whichever way the
            panel is proportioned and stays square either way. Arabic's copy is
            more compact, which makes its section shorter than the panel is
            wide; width-driven the square overflowed and lost the mark's bottom
            arm, and aspect-ratio with a max-width cap does not preserve the
            ratio — it clamped the width and left the height, giving a 740x790
            letterform. */}
        <div className="relative size-[min(100cqw,100cqh)]">
            {/* Two squares of the motif, set behind the mark so it has
                something to sit against on a flat cream ground. */}
            <span
              aria-hidden
              className="absolute end-0 top-[6%] block size-[18%] bg-blue-700/15"
            />
            <span
              aria-hidden
              className="absolute bottom-[4%] start-[8%] block size-[12%] bg-navy-900/10"
            />

            {/* The mark first, then the photograph on top of it.
                Nothing of the picture is covered: the counter of the G works
                out to exactly the middle half of the mark, so the image is
                placed there and the letterform wraps it. Measured off the
                path rather than eyeballed — the counter runs 181.32..213.60 of
                a 64.57 box that starts at 165.18, which is 25% to 75% on both
                axes. */}
            {/* Blue, not navy. The mark is a near-solid square with a bite out
                of it, so at this size it is not a letterform on the page, it is
                a slab of whatever colour it is filled with — and filled navy it
                ran straight into the navy section below and read as one mass.
                #2123bc is the identity's own UI blue and was not carrying a
                single surface on this page. */}
            <div className="g-aperture absolute inset-0 bg-blue-700" aria-hidden />

            {/* The counter is an L, not a square: it runs the full width of the
                mark across its upper band and stops at the tongue below. Filling
                that shape rather than the largest square inside it gives the
                photograph half again as much room, and still nothing sits on
                top of it.

                Physical sides, deliberately. The mark is a letterform and is
                never mirrored, so its counter is in the same place in Arabic —
                a logical inset would flip the picture out of it. */}
            <div
              className="absolute inset-[25%_0%_25%_25%]"
              style={{
                clipPath:
                  "polygon(0% 0%, 100% 0%, 100% 50%, 66.667% 50%, 66.667% 100%, 0% 100%)",
              }}
            >
              <DuotoneImage
                asset={media.winnersStage}
                alt=""
                sizes="(max-width: 1024px) 68vw, 30vw"
                className="absolute inset-0"
                imageClassName="object-[50%_35%]"
                intensity="soft"
              />
            </div>
        </div>
      </div>

      <div className="page-shell section-y relative z-10 w-full lg:pe-[52%]">
        <Reveal>
          {/* text-h1, matching SectionHeading. This is the one section title
              that does not come through that component, so it has to be kept in
              step by hand — it was already the odd size out once, at display-lg,
              which put it above the page's own h1.

              24ch, which is what breaks it over two lines rather than three:
              the measure has to be about half the sentence, and text-balance
              then evens the two. */}
          <h2 className="max-w-[24ch] text-h1 text-balance">{t("title")}</h2>
          {/* Back on body-lg. The claim wanted more said, not the same said
              louder. */}
          {/* 2xl rather than md. The column has room to about 900px here, and
              a 448px measure against a heading twice that wide read as a
              caption sitting under it. */}
          <div className="mt-6 max-w-2xl space-y-5 text-body-lg text-navy-700">
            <p>{t("body")}</p>
            <p>{t("bodyMore")}</p>
          </div>

          <div className="mt-10">
            <Button asChild variant="award" size="cta">
              <Link href="/how-to-enter">{t("action")}</Link>
            </Button>
          </div>

        </Reveal>

      </div>
    </section>
  );
}
