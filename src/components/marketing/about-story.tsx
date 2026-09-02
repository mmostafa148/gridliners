import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { media } from "@/lib/media";

/**
 * The awards, and who stands behind them.
 *
 * A split: the copy takes one half of the page and the photograph takes the
 * other. White ground — the page runs navy either side of this section, and one
 * light plate in the middle of it is what stops the run reading as a single
 * unbroken block.
 *
 * The photograph is inset by a fixed 24px on every side, including the page
 * edge, so it reads as something placed on the plate rather than a hole cut
 * through it. Fixed rather than fluid on purpose: the inset is a mount, and a
 * mount that grows with the viewport stops looking like one.
 *
 * The copy still sets the section's height. The picture fills whatever that
 * leaves, which is why it is `object-cover` on an absolutely positioned layer
 * inside the mount rather than an aspect box — an aspect box would dictate the
 * type's measure in order to make its own ratio work.
 *
 * It mirrors by swapping which half holds the picture, which the grid does on
 * its own; nothing here is positioned physically.
 *
 * The photograph is `community-panel`: five people mid-conversation on the
 * Gridliners stage under the logotype. Real client coverage, used nowhere else
 * on the site, and the only frame in the library that shows the programme being
 * run rather than the prizes being handed out — which is what this heading is
 * about. `alt=""`, because the copy beside it already says the thing.
 *
 * Below `lg` the split becomes a stack, picture first: on a phone a half-width
 * photograph is a stripe, and a stripe is worse than no picture.
 */
export async function AboutStory() {
  const t = await getTranslations("about.story");

  return (
    <section className="bg-white text-navy-900">
      <div className="grid lg:grid-cols-2">
        {/* The picture, in its mount. First in the source so it leads on a
            phone, and pushed to the end half at `lg` so the reader meets the
            words first on a wide screen. */}
        <div className="p-6 lg:order-2">
          <div className="relative h-full min-h-[18rem] w-full overflow-hidden bg-navy-950">
            <Image
              src={media.communityPanel.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              // Held near the start of the source. The logotype on the back
              // screen is what makes this frame say Gridliners rather than "a
              // panel discussion", and the supplied photograph already clips it
              // at its own edge — so the crop shows as much of it as exists
              // instead of cutting it again into a two-letter fragment.
              className="object-cover object-[8%_58%]"
            />
          </div>
        </div>

        {/* The words. `page-edge-pad` aligns the start edge to the page shell
            while the block itself runs to the halfway line, so the type sits on
            the same measure as every other section without this half being a
            shell of its own with a second gutter on its inside edge. */}
        <div className="page-edge-pad section-y pe-[var(--gutter)] lg:order-1 lg:flex lg:flex-col lg:justify-center lg:pe-[max(var(--gutter),4vw)]">
          <h2 className="max-w-[18ch] text-h1 text-balance">{t("title")}</h2>

          <p className="mt-9 max-w-[46ch] text-body-lg text-navy-800">
            {t("body1")}
          </p>

          <p className="mt-6 max-w-[46ch] text-body-md text-navy-600">
            {t("body2")}
          </p>

          <p className="mt-9 flex max-w-[46ch] items-start gap-3 border-t border-navy-900/15 pt-6 text-body-sm text-navy-600">
            <span
              className="mt-[0.55em] size-1.5 shrink-0 bg-blue-700"
              aria-hidden
            />
            <span>{t("associationNote")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
