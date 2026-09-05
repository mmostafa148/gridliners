import {
  Building2,
  Frame,
  GraduationCap,
  Leaf,
  PenTool,
  School,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { HonoraryDesignationOption } from "@/lib/api/types";

/**
 * One mark per designation, keyed by `HonoraryType`.
 *
 * The marks name the subject each award is attached to rather than dressing it:
 * a graduate, a person who draws, an organisation, a piece of work, a school, an
 * audience, a leaf. Addendum §1.4 is explicit that a designation belongs to a
 * person or an entity and not to an entry, and that is the one thing these can
 * usefully say.
 *
 * Nothing here may look like a medal. Rank is what the categories above compete
 * for and what these sit outside of, so no cups, no laurels, no stars — and no
 * gold, which on this site means current-or-awarded and is not free for
 * decoration.
 */
const HONORARY_MARK: Record<string, LucideIcon> = {
  student_of_the_year: GraduationCap,
  designer_of_the_year: PenTool,
  best_agency: Building2,
  best_project: Frame,
  best_university: School,
  audience_award: Users,
  sustainability_innovation: Leaf,
};

/**
 * The seven awards nobody enters.
 *
 * Addendum §1.4: honorary designations are jury and Admin designated, never
 * paid, attached to a person or an organisation rather than to an entry, and
 * they sit outside the vote-ranking model entirely. So the one thing this block
 * must not do is read as an eighth category.
 *
 * It is built to be a different system rather than a different colour of the
 * same one:
 *
 *  - **No coordinate.** Every enterable sub-category above carries one, because
 *    a coordinate is what you hold a position in. There is no group to be
 *    ranked inside here, so there is no code, and its absence is the clearest
 *    statement on the page that this is not part of that matrix.
 *  - **No fee, anywhere.** The bands above put a number on every row. This
 *    block has no money column at all, which says "never paid" more plainly
 *    than a row of struck-through zeroes could.
 *  - **Not seven cards.** The seven run across in one ruled row, taken in at
 *    once, where the categories above are seven full-width photographic
 *    sections you scroll through and choose between. Boxes here would face those
 *    sections one for one and invite exactly the parallel reading this has to
 *    avoid, so nothing is drawn around them at all: the marks and one shared
 *    baseline do the grouping.
 *  - **Inverted ground**, so the change of system registers before a word is
 *    read.
 *
 * The names come from `api.taxonomy.honoraryOptions()`, not from the
 * `honoraryType` message namespace. Both exist and both are bilingual; the
 * fixtures are the record the Admin menu is built from, and build-state's split
 * rule puts changeable records behind the API and leaves the message files to
 * editorial prose.
 */
export async function HonoraryAwards({
  options,
}: {
  options: HonoraryDesignationOption[];
}) {
  const [locale, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("categories.honorary"),
  ]);

  if (options.length === 0) return null;

  const ordered = [...options].sort((a, b) => a.order - b.order);

  return (
    <section className="relative overflow-hidden bg-navy-950 text-cream-100">
      <div className="page-shell section-y relative">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-h1 text-balance text-cream-50">
              {t("title")}
            </h2>
            {/* Stated once for the whole block. Repeated on seven rows it would
                stop being a rule and become a texture. */}
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
              {(["notEnterable", "notPaid", "chosen"] as const).map((key) => (
                <li
                  key={key}
                  className="border border-cream-200/30 px-3 py-1.5 font-display text-coord uppercase text-cream-100"
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          {/* Both sentences together: what these are, then who they attach to.
              Split across the two columns they read as two unrelated remarks. */}
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-[52ch] text-body-md text-cream-200/80">
              {t("body")}
            </p>
            <p className="mt-4 max-w-[52ch] text-body-md text-cream-200/80">
              {t("scope")}
            </p>
          </div>
        </div>

        {/* The seven across, not down.

            Nothing is drawn around them: no tile, no rule, no plate. Seven
            boxes facing the seven photographic category sections above would
            invite exactly the parallel reading this block has to avoid, and
            these are a set to be taken in at once rather than seven things to
            choose between. The mark, one shared baseline and the grid are
            enough to group them.

            Seven across only at `xl`, where each item still has room for a name
            like Sustainability & Innovation; four, three and two below that. */}
        <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:mt-16 lg:grid-cols-4 xl:grid-cols-7">
          {ordered.map((option) => {
            const Mark = HONORARY_MARK[option.id] ?? Frame;
            return (
              <li key={option.id}>
                <Mark
                  aria-hidden
                  className="size-7 text-blue-400"
                  strokeWidth={1.5}
                />
                {/* No coordinate and no figure, which is the whole point: an
                    enterable row carries both, and the absence here says these
                    are neither ranked in a group nor paid for. */}
                <p className="mt-5 text-body-md text-cream-50">
                  {option.name[locale]}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
