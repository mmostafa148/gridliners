import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { CardTrack } from "@/components/marketing/card-track";
import type { Locale } from "@/i18n/routing";
import type { Testimonial } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Testimonials, on the page's carousel.
 *
 * The last pass opened one panel and squeezed the other two, which is an
 * accordion wearing a carousel's controls. This is the same track the winners,
 * the news and the jury run on: scroll-snap, one card per page, the browser
 * owning the motion so a swipe carries its own momentum and RTL needs no second
 * implementation. Three sections on this page already work that way and there
 * was no reason for a fourth mechanism.
 *
 * Six cards rather than three. Three is not enough to be worth a track — that
 * was the whole problem with the first version of this section — and there were
 * three more mechanisms worth a quote: the price a cycle holds once an entry
 * starts, the vote confirmed by a code, and an entry whose state is visible at
 * every step.
 *
 * ── The colourways ─────────────────────────────────────────────────────────
 *
 * The deck runs full-page colourways in the secondary palette across pages 41
 * to 49 and nothing in the build had used that system. The palette is flagged
 * campaign-accents-only rather than base UI; a marketing section is the campaign
 * surface and the deck's own layout pages are the precedent, and nothing
 * structural takes these values.
 *
 * Not every colourway can sit on this ground. A card has to separate from the
 * section behind it or it reads as a hole rather than a card, and measured
 * against the navy: lime 16.75:1, cream 17.07:1, yellow 13.94:1, teal 10.54:1,
 * orange 6.86:1 — but purple only 2.57:1. Purple is a dark magenta on a
 * near-black ground and it barely draws an edge, so it is not in the rotation
 * here. It works on the light sections that use it elsewhere; it does not work
 * on this one.
 *
 * Teal is the errata swatch. The deck labels it #5a0038, a dark maroon, and the
 * token holds the value sampled from the rendered page instead. As sampled it
 * measures 10.54:1 here. If the corrected hex comes back as the label it lands
 * at 1.40:1 against this ground and this card disappears, so that conflict is
 * this section's to re-check when the design team answers it.
 *
 * Five grounds across six cards, so one repeats. Orange takes index 1 and index
 * 5, which with three cards in view are never on screen together.
 *
 * Ink is per card because the grounds do not agree on one: navy on lime
 * 14.58:1, on yellow 12.13:1, on teal 9.17:1, on orange 5.97:1, on cream
 * 14.85:1.
 *
 * Portraits are greyscale. At this size the deck's placeholder photography is
 * no liability, but six full-colour photographs across six different grounds
 * would each argue with their own.
 *
 * The structure is in the content: six people each naming a different
 * mechanism, so each card is labelled with the part it is about. Not numbered —
 * six mechanisms are a set, not a sequence.
 */

const NAVY_INK = {
  quiet: "text-navy-900/75",
  rule: "border-navy-900/25",
  mark: "bg-navy-900",
};

const COLORWAYS = [
  { panel: "bg-campaign-lime text-navy-900", ...NAVY_INK },
  {
    panel: "bg-campaign-orange text-navy-900",
    ...NAVY_INK,
    quiet: "text-navy-900/80",
  },
  { panel: "bg-campaign-teal text-navy-900", ...NAVY_INK },
  { panel: "bg-campaign-yellow text-navy-900", ...NAVY_INK },
  {
    panel: "bg-cream-100 text-navy-900",
    quiet: "text-navy-600",
    rule: "border-navy-900/20",
    mark: "bg-blue-700",
  },
  {
    panel: "bg-campaign-orange text-navy-900",
    ...NAVY_INK,
    quiet: "text-navy-900/80",
  },
];

export async function Testimonials({ items }: { items: Testimonial[] }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.testimonials");

  if (!items.length) return null;

  return (
    <section className="bg-navy-950 text-cream-100">
      <div className="page-shell section-y">
        <CardTrack
          tone="dark"
          prevLabel={t("prev")}
          nextLabel={t("next")}
          heading={
            <div className="max-w-2xl">
              <h2 className="text-h1 text-cream-100">{t("title")}</h2>
              <p className="mt-4 text-body-md text-cream-200/75">{t("lead")}</p>
            </div>
          }
        >
          {items.map((item, i) => {
            const way = COLORWAYS[i % COLORWAYS.length];

            return (
              <li
                key={item.id}
                className={cn(
                  "shrink-0 snap-start",
                  "basis-[85%] sm:basis-[calc((100%-1.5rem)/2)]",
                  "lg:basis-[calc((100%-3rem)/3)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-full min-h-[26rem] flex-col p-8 lg:min-h-[28rem] lg:p-10",
                    way.panel,
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* The identity's square, the same device the partnership
                        tiers use for their inclusions. */}
                    <span
                      className={cn("size-1.5 shrink-0", way.mark)}
                      aria-hidden
                    />
                    {item.topic ? (
                      <p
                        className={cn(
                          "font-display text-coord uppercase",
                          way.quiet,
                        )}
                      >
                        {item.topic[locale]}
                      </p>
                    ) : null}
                  </div>

                  <blockquote className="mt-8">
                    <p className="font-display text-[clamp(1.125rem,1.15vw,1.375rem)] leading-[1.28]">
                      {item.quote[locale]}
                    </p>
                  </blockquote>

                  {/* mt-auto rather than justify-between: unequal quotes spread
                      evenly start at a different height in every card. Pinned to
                      the top they share a line and the footers sit on the floor,
                      which is what makes a row of six read as one set. */}
                  <footer
                    className={cn(
                      "mt-auto flex items-center gap-4 border-t pt-6",
                      way.rule,
                    )}
                  >
                    {item.imageUrl ? (
                      // Square, like everything else the identity draws.
                      <span className="relative size-14 shrink-0 overflow-hidden bg-navy-900">
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover object-top grayscale"
                        />
                      </span>
                    ) : null}
                    <div>
                      <p className="text-body-sm">{item.author[locale]}</p>
                      <p className={cn("text-body-sm", way.quiet)}>
                        {item.role[locale]}
                      </p>
                    </div>
                  </footer>
                </div>
              </li>
            );
          })}
        </CardTrack>
      </div>
    </section>
  );
}
