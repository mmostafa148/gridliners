import { getLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { SubCategory } from "@/lib/api/types";

/**
 * All twenty-three sub-categories, moving.
 *
 * A grid of twenty-three tiles is a data dump, and a grid of seven parents
 * hides what is actually on offer. A marquee shows the whole range in one
 * band, at a size worth reading, and gives the page its only continuous
 * motion. The track renders the list twice so the loop has no seam.
 *
 * Direction is reversed for Arabic, so the text always travels the way the
 * script is read.
 */
export async function CategoryMarquee({
  subCategories,
}: {
  subCategories: SubCategory[];
}) {
  const locale = (await getLocale()) as Locale;
  const items = [...subCategories].sort((a, b) => a.parentId.localeCompare(b.parentId));

  const track = (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {items.map((sub) => (
        <li key={sub.id} className="flex items-center gap-6 whitespace-nowrap px-7">
          <span className="font-data text-data-sm text-blue-400">{sub.name[locale]}</span>
          <span className="font-display text-display-md text-cream-100/85">
            {sub.name[locale]}
          </span>
          <span className="size-2 shrink-0 bg-gold" />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="grain relative overflow-hidden border-y border-cream-100/10 bg-navy-950 py-10">
      <div className="grain-layer" aria-hidden />

      {/* Edge fade holds the band inside the page instead of letting it
          collide with the viewport edge. */}
      <div className="marquee-mask">
        <div className="marquee marquee-rtl flex w-max">
          {track}
          {track}
        </div>
      </div>

      {/* The real list for anyone not reading the animation. */}
      <ul className="sr-only">
        {items.map((sub) => (
          <li key={sub.id}>{sub.name[locale]}</li>
        ))}
      </ul>
    </section>
  );
}
