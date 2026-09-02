import {
  ArrowRight,
  Camera,
  Film,
  LayoutTemplate,
  MonitorSmartphone,
  Package,
  Shapes,
  Type as TypeMark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { PixelGrid } from "@/components/brand/pixel-grid";
import { EmptyState } from "@/components/shared/status-patterns";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ParentCategory, SubCategory } from "@/lib/api/types";
import { categoryImage } from "@/lib/media";
import { usd } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * One mark per parent, from `lucide-react` — already a dependency, ISC-licensed
 * with no attribution to carry, and the same source the tier marks on How to
 * Enter draw from.
 *
 * They identify rather than rank. The seven parents are peers: an entry is only
 * ever ranked inside its own Sub-category x Tier group, so nothing here may
 * imply an order or a size. One object each, one weight, one size.
 *
 * Keyed by the frozen parent id, the way `PARENT_CODE` in `coordinates.ts` is.
 * An unmapped parent falls back to the generic mark rather than crashing, so a
 * taxonomy that grows an eighth parent renders before anyone picks its icon.
 */
const PARENT_MARK: Record<string, LucideIcon> = {
  "visual-identity": Shapes,
  packaging: Package,
  type: TypeMark,
  photography: Camera,
  film: Film,
  digital: MonitorSmartphone,
  layout: LayoutTemplate,
};

function CategoryMark({ parentId }: { parentId: string }) {
  const Icon = PARENT_MARK[parentId] ?? Shapes;
  return (
    <Icon
      aria-hidden
      className="size-9 shrink-0 text-navy-900"
      strokeWidth={1.5}
    />
  );
}

/**
 * The frozen taxonomy, as the page's structure.
 *
 * Each parent is its own full-width section: the work on one side, what the
 * category is and what it costs on the other.
 *
 * The photography is the point. `categoryImage` has held an art-directed frame
 * per parent since Phase 1.1 — a stationery flat-lay for Visual Identity, a
 * drawn letterform for Type, a crew on location for Film — and until now nothing
 * imported them. They answer this page's first question faster than any sentence
 * can: a designer looking for where their work belongs recognises the kind of
 * work before they finish reading the name.
 *
 * It is also what makes a full-width section work at all. The first attempt at
 * this page was full width and was abandoned because the identity column filled
 * about half its own width and left a wide dead gap beside the rows. The picture
 * is exactly what belongs in that space.
 *
 * **The section carries the rule.** Addendum §1.2 says an additional
 * sub-category must sit in the same parent as the base one, and the shape
 * states it: everything listed under one parent is a legal addition to anything
 * else under it, and nothing outside the section is. The rule is written once
 * in the block above; here it is structural, so it does not have to be repeated
 * seven times.
 *
 * It used to be carried by the codes, where every key sharing a prefix was a
 * legal addition. Those were retired site-wide (§1.3 `[map-update]`,
 * 2026-08-25); the containment says the same thing without an encoding.
 *
 * The section holds a parent **with** its sub-categories, which is the shape the
 * model actually has: no border falls between a parent and its own children, and
 * the section's own ground is the boundary that does exist. It is the
 * same-parent rule drawn — everything inside one section is what a base entry
 * there may add.
 *
 * **The picture keeps its side, it does not alternate.** Flipping image and copy
 * down a page is the most templated layout on the web, and this screen's brief
 * ruled out seven repetitive boxes. A reference page should teach the eye one
 * place to look for the copy and let it stay there. The rhythm comes from the
 * ground alternating underneath instead, which changes the page without moving
 * anything the reader is tracking.
 *
 * **The motif is the seam.** Where the ground meets the photograph it breaks
 * into the picture as pixel cells, which is the poster system's own logic and
 * the same device the honorary block below uses at its top edge. Seeded per
 * parent, so seven seams break seven ways.
 *
 * Frames are shown in full colour and contained rather than bled. Grading them
 * to navy would cost the stationery shot the red it is built on and the film set
 * its autumn, which is the only thing either picture is saying; containing them
 * keeps seven vivid frames from overrunning a navy, blue and cream identity.
 *
 * The fee on each row is the **additional** fee — what that sub-category costs
 * to add to an entry, per `SubCategory.additionalFeeUsd`. It is not the entry
 * price, which is tier and window dependent and belongs to How to Enter; the
 * label says so rather than leaving a bare number to be read as the cost of
 * entering.
 *
 * Every name, id and fee arrives through `api.taxonomy`. Nothing about the
 * taxonomy is written into this file.
 */
export async function CategoryGroups({
  parents,
  subCategories,
}: {
  parents: ParentCategory[];
  subCategories: SubCategory[];
}) {
  const [locale, t, format] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("categories"),
    getFormatter(),
  ]);

  const groups = parents
    .map((parent) => ({
      parent,
      subs: subCategories
        .filter((sub) => sub.parentId === parent.id)
        .sort((a, b) => a.order - b.order),
    }))
    // A parent with nothing under it is not a category a reader can enter, and
    // an empty band would read as a section that failed to load.
    .filter((group) => group.subs.length > 0);

  if (groups.length === 0) {
    return (
      <section className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      </section>
    );
  }

  // A fragment, not a wrapper: each parent owns its own ground now, and a
  // wrapping section would paint one colour behind all seven and defeat the
  // alternation.
  return (
    <>
      {(
          groups.map(({ parent, subs }, i) => {
            // Alternating ground is the page's rhythm, since the picture never
            // changes sides. The seam's cells are painted in the section's own
            // ground so it is the page breaking into the photograph, not a
            // third colour arriving between them.
            const ground = i % 2 === 0 ? "bg-white" : "bg-mist";
            const seam = i % 2 === 0 ? "bg-white" : "bg-mist";
            const image = categoryImage[parent.id];

            return (
              <section
                key={parent.id}
                id={parent.id}
                className={cn(
                  "scroll-mt-28 text-navy-900 md:scroll-mt-32",
                  ground,
                )}
              >
                <div className="page-shell py-14 lg:py-20">
                  <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                    {/* The work itself. `alt=""` because the section names the
                        category in the heading beside it: the frame illustrates
                        a thing the copy already states, which is the house rule
                        for every photograph on this build that is not a record
                        of a real event. */}
                    {image ? (
                      <div className="relative lg:col-span-5">
                        <div className="relative aspect-[5/4] overflow-hidden">
                          <Image
                            src={image.src}
                            alt=""
                            fill
                            // Half the shell from lg, full width below it.
                            sizes="(min-width: 1024px) 42vw, 100vw"
                            className="object-cover"
                          />
                        </div>

                        {/* The ground breaking into the picture on the edge that
                            faces the copy. Logical inset, so it moves to the
                            other edge under RTL with the rest of the grid. */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 end-0 hidden overflow-hidden lg:block"
                        >
                          <PixelGrid
                            direction="start"
                            seed={parent.order * 7}
                            cols={4}
                            rows={14}
                            density={0.34}
                            cellSize="clamp(1rem, 2.2vw, 2.25rem)"
                            cellClassName={seam}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className={image ? "lg:col-span-7" : "lg:col-span-12"}>
                      {/* The mark and the code, with the way in on the far edge
                          of the same line: what identifies the category, and the
                          one thing a reader can do about it. */}
                      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
                        <div className="flex items-center gap-4">
                          {/* The mark identifies, it does not rank: seven peers,
                              one object each, at one weight. */}
                          <CategoryMark parentId={parent.id} />
                          {/* The mark alone. A two-letter code stood beside it
                              and, spelled out, was simply the title repeated a
                              line above itself (§1.3 `[map-update]`,
                              2026-08-25). */}
                        </div>

                        {/* A link, not a filled button. Seven filled buttons
                            down one page would out-shout the closing band and
                            turn a reference page into a sales sheet; this is the
                            treatment `SectionHeading` and the terms link use.

                            It points at How to Enter because that is where an
                            entry actually starts today. Carrying the category
                            into the entry form is Phase 2 work, recorded as
                            such. */}
                        <Link
                          href="/how-to-enter"
                          className="inline-flex items-center gap-2 font-display text-coord uppercase text-blue-700 underline-offset-4 transition-colors hover:text-blue-800 hover:underline"
                        >
                          {t("group.apply")}
                          {/* Logical rotation: the arrow points along the
                              reading direction and flips with the page. */}
                          <ArrowRight
                            aria-hidden
                            className="size-4 shrink-0 transition-transform rtl:-scale-x-100"
                          />
                        </Link>
                      </div>

                      <h3 className="mt-7 text-h1 text-balance">
                        {parent.name[locale]}
                      </h3>
                      <p className="mt-1 font-display text-coord uppercase text-navy-600">
                        {t("group.count", { count: subs.length })}
                      </p>

                      {/* From the taxonomy record, not from page copy: what
                          belongs in this category is the taxonomy's own
                          editorial field. */}
                      <p className="mt-4 max-w-[52ch] text-body-md text-navy-600">
                        {parent.description[locale]}
                      </p>

                      {/* Term is the sub-category, definition is what it costs
                          to add. A definition list rather than a table: one
                          column of values against one column of names, not a
                          matrix, and table markup would promise a second axis
                          that is not there.

                          No column header. The number is explained once, by rule
                          04 in the block above, and the currency is in the
                          figure itself; a header per section was seven copies of
                          one sentence. */}
                      <dl className="mt-8 border-t border-navy-900/15">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-navy-900/10 py-3.5"
                          >
                            {/* The name and its fee. The row led with the
                                sub-category's code and then named it; the code
                                is retired, and its own name twice is not a
                                row. */}
                            <dt className="min-w-0 flex-1 text-body-md text-navy-900">
                              {sub.name[locale]}
                            </dt>
                            {/* `min-w`, never a fixed `ch`: Arabic renders the
                                currency after the figure, so a box sized to
                                "$120" does not hold its Arabic equivalent. */}
                            <dd className="min-w-[5ch] shrink-0 text-end font-data text-data-md tabular-nums text-navy-900">
                              {usd(format, sub.additionalFeeUsd)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              </section>
            );
          })
      )}
    </>
  );
}
