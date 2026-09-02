import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { CardTrack } from "@/components/marketing/card-track";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Juror, ParentCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Jury highlights.
 *
 * On the same track as the winners and the news, so the three card sections on
 * this page are read and operated the same way. It was a four-up grid, which
 * meant the panel was capped at whatever fitted a row: on a track the whole
 * cohort is here and the row still only shows four at a time.
 *
 * Nothing sits on the portraits. Each card is a photograph, a hairline, and a
 * block of facts on one baseline: name, role, then the categories that juror
 * actually scores. The rule takes the hover rather than the picture.
 *
 * The controls are the dark tone, and the section's link is given the same
 * treatment by hand: the outline variant is a light box and would be a hole in
 * a navy section.
 */
export async function JuryHighlights({
  jurors,
  parentCategories,
}: {
  jurors: Juror[];
  parentCategories: ParentCategory[];
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.juryHighlights");

  if (!jurors.length) return null;

  const categoryName = new Map(parentCategories.map((c) => [c.id, c.name[locale]]));

  return (
    // One provider for the section rather than one per chip: they share a
    // delay and only one tooltip is ever open.
    <TooltipProvider delayDuration={120}>
      <section className="bg-navy-950 text-cream-100">
        <div className="page-shell section-y">
          <CardTrack
            tone="dark"
            prevLabel={t("prev")}
            nextLabel={t("next")}
            heading={
              <div className="max-w-2xl">
                <h2 className="text-h1 text-cream-100">{t("title")}</h2>
                <p className="mt-4 text-body-md text-cream-200/75">{t("description")}</p>
              </div>
            }
            action={
              <Button
                asChild
                variant="outline"
                size="cta"
                className="border-cream-100/40 bg-transparent text-cream-100 hover:bg-cream-100 hover:text-navy-900"
              >
                <Link href="/jury-panel">{t("link")}</Link>
              </Button>
            }
          >
            {jurors.map((juror) => (
              <li
                key={juror.id}
                className={cn(
                  "group shrink-0 snap-start",
                  "basis-[78%] sm:basis-[calc((100%-1.5rem)/2)]",
                  "lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]",
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                  <Image
                    src={juror.photoUrl}
                    alt={juror.name[locale]}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1280px) 45vw, 24vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>

                {/* The rule takes the hover, not the picture. */}
                <span
                  className="mt-6 block h-px w-full bg-cream-100/20 transition-colors duration-300 group-hover:bg-gold"
                  aria-hidden
                />

                <div className="pt-5">
                  <h3 className="text-h4 text-cream-50">{juror.name[locale]}</h3>
                  <p className="mt-1.5 text-body-sm text-cream-200/70">{juror.title[locale]}</p>
                </div>

                {/* Two letters are only shorthand if you already know them, and
                    this section sits above the categories that teach them. The
                    name is on the chip for anything reading the page aloud, and
                    on hover for anything looking at it. */}
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {juror.assignedParentCategoryIds.map((id) => (
                    <li key={id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                          // relative, for the sr-only name inside it. sr-only is
                          // position:absolute with no insets, so its containing
                          // block is the nearest positioned ancestor: with none
                          // inside the track it resolved outside the scroller,
                          // escaped the clipping, and sat at its static x on the
                          // last card. That gave the whole document 367px of
                          // horizontal scroll pointing at nothing.
                          className="relative block cursor-default border border-cream-100/25 px-2 py-1 font-data text-coord text-cream-100/85 transition-colors hover:border-cream-100/60 hover:text-cream-50"
                        >
                            {categoryName.get(id) ?? id}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          // Light, square, and on the display face. The default is
                          // bg-foreground, which on this section is navy on navy;
                          // the arrow is styled with it or it stays dark.
                          className="rounded-none bg-cream-100 font-display text-coord uppercase text-navy-900 [&_svg]:bg-cream-100 [&_svg]:fill-cream-100"
                        >
                          {categoryName.get(id) ?? id}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </CardTrack>
        </div>
      </section>
    </TooltipProvider>
  );
}
