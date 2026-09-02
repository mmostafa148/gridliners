import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { PixelGrid } from "@/components/brand/pixel-grid";
import { CeremonyFrames } from "@/components/marketing/ceremony-frames";
import type { Locale } from "@/i18n/routing";
import type { CeremonyEdition } from "@/lib/api/types";

/**
 * One year's ceremony, in the tense the year is actually in.
 *
 * About's `CeremonyGallery` shows every edition at once and is the story of the
 * programme. This is the opposite scope: one night, on the page for its year.
 *
 * Two genuinely different sections rather than one section with a switch in it,
 * because the two states are not the same thing at different sizes:
 *
 *  - **held** - a boxed edition: the photograph is the frame, the city sits on
 *    it, and the rest of the coverage opens in a viewer beneath;
 *  - **still to come** - a full-bleed hero on the *host city*, which is the one
 *    thing an unheld ceremony can honestly be pictured by.
 *
 * **Why the city and not the ceremony.** Until 2026-08-26 this section rendered
 * ceremony photographs on every year that had them, the running one included,
 * so `/finalists/2026` carried frames of a lit stage under a venue field
 * reading "Venue to be announced". A ceremony that has not happened cannot be
 * photographed; the city it will be held in can. `CeremonyEdition.cityImage` is
 * a separate field from `image` for exactly that reason - conflating the two is
 * how the original error happened.
 *
 * `cityImage` is null on every edition today and no city photograph is
 * invented: the hero falls back to the pixel grid, and takes the photograph the
 * moment the client supplies one.
 *
 * **The film is conditional and nothing stands in for it.** `videoUrl` is null
 * on every edition today because the client has supplied no footage and there
 * is no video file in the repository. When one arrives the slot renders; until
 * then it is absent, with no poster frame, no play button over a still and no
 * "coming soon" plate. A control that cannot do anything is worse than no
 * control.
 *
 * Photographs are rendered straight rather than through `DuotoneImage`, the
 * call About already made about these exact frames: grading a stage lit in the
 * brand's own violet throws away the only thing making it read as a stage.
 *
 * Omitted entirely when the year has no edition record at all.
 */
export async function EventOverview({
  edition,
  held,
}: {
  edition: CeremonyEdition | null;
  held: boolean;
}) {
  if (!edition) return null;
  return held ? <HeldEdition edition={edition} /> : <UpcomingHero edition={edition} />;
}

/**
 * The year still to come, as a full-bleed hero on its host city.
 *
 * Boxed first, and that was the wrong shape: the section's job on this year is
 * to say where the cycle ends up, and a contained plate makes that a footnote
 * between the voting banner and the archive. Full bleed is the statement.
 *
 * **The ground is the only thing that changes when the photograph lands.** The
 * label row, the city, the venue and the lead are already where they belong.
 *
 * The motif's solid mass sits at the **top** rather than under the copy, which
 * is the opposite of the boxed plate it replaced, and the reason is the section
 * above it: on the open year `VotingBanner` is navy-950 and so is this hero, so
 * two dark grounds would meet with nothing between them. Blue at the join
 * separates them, and it gives the label row a ground of its own - which is
 * what the boxed version was using the mass at the bottom for.
 */
async function UpcomingHero({ edition }: { edition: CeremonyEdition }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finalists.event");

  return (
    /* The rule at the head belongs to this state and travels with it, which is
       why it is here rather than composed between the two sections in
       `FinalistsYear`: only a year still to come renders this hero, so only a
       year still to come draws the line. On the open year it lands exactly on
       the join with the voting banner, which is what it is for - two dark
       grounds meeting, one navy and one a night photograph.

       `campaign-lime`, the same accent as the "Still to come" marker a few
       lines below it, so the join and the status read as one decision. Gold is
       the other yellow this build has and it is not available here: it is a
       medal metal, and 1.6 is the screen where nothing has been awarded. */
    <section className="relative isolate overflow-hidden border-t-2 border-campaign-lime bg-navy-950 text-cream-100">
      {edition.cityImage ? (
        <>
          {/* The city, shown straight. It is a place, not an event, and nothing
              about it is a claim about the night. */}
          <Image
            src={edition.cityImage.src}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover"
          />
          {/* Two layers, and both are deliberately light. One flat scrim heavy
              enough to carry the copy was tried first and it cost the picture
              everything: a night skyline is already near black, so 75% navy
              over the whole frame left a dark smudge with a tower somewhere in
              it. A faint overall tint holds the frame to the palette, and the
              gradient does its work only where the type actually sits. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-navy-950/20" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-navy-950 via-navy-950/65 to-transparent"
          />
        </>
      ) : (
        /* A band across the top, not a field over the whole hero. Given the
           full height, the dissolve's loose pixels scattered down into the
           copy and sat behind the city name; five rows keeps every cell above
           it, so the bottom half is clean ground for the type.

           Twice, at two cell scales: `PixelGrid` sizes its cells as a fraction
           of container width, so 24 columns across a phone is a 15px cell and
           the motif collapses into a fine texture. */
        <>
          <PixelGrid
            variant="full-bleed"
            direction="down"
            cols={12}
            rows={5}
            density={0.35}
            seed={9}
            cellClassName="bg-blue-700"
            className="absolute inset-x-0 top-0 -z-10 sm:hidden"
          />
          <PixelGrid
            variant="full-bleed"
            direction="down"
            rows={5}
            density={0.35}
            seed={9}
            cellClassName="bg-blue-700"
            className="absolute inset-x-0 top-0 -z-10 hidden sm:grid"
          />
        </>
      )}

      <div className="page-shell section-y flex min-h-[26rem] flex-col justify-between gap-14 lg:min-h-[34rem]">
        {/* What this is, and when it is: opposite ends of one row rather than
            two stacked eyebrows, which is what they were - both set in the same
            small caps, one under the other, reading as a label repeated. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <h2 className="font-display text-coord uppercase text-cream-100">
            {t("title")}
          </h2>
          {/* `campaign-lime`, and the two colours it is not are the whole
              reason. Cream was tried first and the marker read as the label
              opposite it repeated. Gold followed, because gold is what this
              build uses for the live edition everywhere else - and the leak
              assertions rejected it, correctly: gold is a medal metal, and 1.6
              is the screen where nothing has been awarded. The campaign accent
              carries "now" without carrying a placing. */}
          <p className="font-display text-coord uppercase text-campaign-lime">
            {t("upcomingLabel")}
          </p>
        </div>

        <div>
          <p className="text-display-lg text-cream-50">{edition.city[locale]}</p>
          {edition.venue ? (
            <p className="mt-4 font-display text-coord uppercase text-cream-200">
              {edition.venue[locale]}
            </p>
          ) : null}
          <p className="mt-8 max-w-[54ch] text-body-md text-cream-200">
            {t("lead")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * A year already held: the photograph is the frame, and the city sits on it.
 *
 * The treatment About settled on ("every card carries its own city on the
 * frame"), which is also why there is no `City / Venue` list beside the lead
 * any more - once the frame carries the caption, the list was the same two
 * facts a second time.
 */
async function HeldEdition({ edition }: { edition: CeremonyEdition }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("finalists.event");

  return (
    /* A top rule, because the section above this one is the last tier section
       and both are white: on an archived year, where no voting banner sits
       between them, the ceremony otherwise ran straight on from the shortlist
       with no boundary at all and read as one more parent. */
    <section className="border-t border-navy-900/12 bg-white text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 text-balance lg:col-span-5">{t("title")}</h2>
          <p className="max-w-[54ch] text-body-md text-navy-600 lg:col-span-6 lg:col-start-7">
            {t("lead")}
          </p>
        </div>

        {/* The film, when there is one. */}
        {edition.videoUrl ? (
          <figure className="mt-12 lg:mt-16">
            <video
              controls
              preload="metadata"
              className="w-full bg-navy-950"
              style={{ aspectRatio: "16 / 9" }}
              src={edition.videoUrl}
            />
            <figcaption className="mt-3 font-display text-coord uppercase text-navy-600">
              {t("filmLabel")}
            </figcaption>
          </figure>
        ) : null}

        {edition.image ? (
          <CeremonyFrames
            frames={[edition.image, ...edition.gallery]}
            city={edition.city[locale]}
            caption={
              <div>
                <p className="text-display-md text-cream-50">
                  {edition.city[locale]}
                </p>
                {edition.venue ? (
                  <p className="mt-3 font-display text-coord uppercase text-cream-200/80">
                    {edition.venue[locale]}
                  </p>
                ) : null}
              </div>
            }
          />
        ) : null}
      </div>
    </section>
  );
}
