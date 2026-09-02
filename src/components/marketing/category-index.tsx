import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { ParentCategory, SubCategory } from "@/lib/api/types";

/**
 * How an entry is composed, and the key to reading the page under it.
 *
 * The four rules from Addendum §1.2 stated once, at the top, followed by the
 * seven parent codes. It is one block rather than two because the last rule and
 * the index are the same fact: additions must share your parent, and the code
 * is how you tell which those are. Splitting them put the rule a screen away
 * from the thing that demonstrates it.
 *
 * **It taught two-letter codes until 2026-08-25, and now names the categories
 * in full** (§1.3 `[map-update]`). The codes were the compact half of a group
 * key that the winners, jury and finalists screens all repeated; with them
 * retired there is one spelling of a category everywhere, and this block is the
 * key to the names rather than to an encoding of them.
 *
 * Each cell is still a cell. The identity is built on a grid of squares, so a
 * key made of them is the motif doing structural work rather than being applied
 * on top of it — what changed is what a cell holds, not that it is one.
 *
 * The cells are anchors into the bands below. Seven groups on a page this long
 * is enough to want a way down and nothing like enough to want a filter, a
 * search field or tabs: those would be invented behaviour, and this is plain
 * HTML that works before any script runs.
 */
export async function CategoryIndex({
  parents,
  subCategories,
}: {
  parents: ParentCategory[];
  subCategories: SubCategory[];
}) {
  const [locale, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTranslations("categories"),
  ]);

  const countFor = (parentId: string) =>
    subCategories.filter((sub) => sub.parentId === parentId).length;

  const rules = ["base", "additional", "sameParent", "fee"] as const;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <h2 className="text-h1 text-balance">{t("rules.title")}</h2>

        {/* Four rules, numbered, because they are a composition read in order:
            the base comes first and the fee follows from what you added. This
            is one of the few places on the site where numbering is honest. */}
        <ol className="mt-10 grid gap-x-14 gap-y-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {rules.map((rule, i) => (
            <li key={rule}>
              <p
                aria-hidden
                className="font-data text-data-md leading-none tabular-nums text-blue-700"
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-4 max-w-[38ch] text-body-sm text-navy-600">
                {t(`rules.${rule}`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 border-t border-navy-900/15 pt-9 lg:mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
            <h3 className="font-display text-coord uppercase text-navy-600">
              {t("index.label")}
            </h3>
            <p className="max-w-[52ch] text-body-sm text-navy-600">
              {t("index.legend")}
            </p>
          </div>

          {/* Squares, because the identity is a grid of them and a two-letter
              code is a square-shaped fact. Seven across at lg, so the row reads
              as one key rather than a wrapped list. */}
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {parents.map((parent) => (
              <li key={parent.id}>
                <a
                  href={`#${parent.id}`}
                  className="group flex h-full flex-col justify-between gap-6 bg-navy-950 px-5 py-5 text-cream-100 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  {/* The name, at the size the code used to sit at. The cell
                      was built around two letters and is now built around the
                      thing they stood for; nothing else about it changed. */}
                  <span className="text-h4 text-balance text-cream-50">
                    {parent.name[locale]}
                  </span>
                  <span className="font-display text-coord uppercase text-cream-200/70">
                    {t("group.count", { count: countFor(parent.id) })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
