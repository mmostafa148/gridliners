import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { Criterion, ParentCategory } from "@/lib/api/types";

/**
 * What an entry is judged on — its own section since the juror grid was
 * promoted above it (§1.5 `[map-update]`, 2026-08-23). It was the tail of the
 * "how judging works" block; the map gives the criteria their own bullet so they
 * stay a requirement in their own right rather than something a later edit to
 * the intro could quietly drop.
 */
export async function ScoreSheets({
  parents,
  criteria,
}: {
  parents: ParentCategory[];
  criteria: Criterion[];
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("jury.judging");

  const byParent = parents
    .map((parent) => ({
      parent,
      set: criteria
        .filter((c) => c.parentCategoryId === parent.id)
        .sort((a, b) => b.weight - a.weight),
    }))
    .filter((g) => g.set.length > 0);

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        {/* The instrument, not a chart of it.

            Five attempts came before this and every one of them was a *display
            of the data*: an inline run of percentages, cells sized by weight, a
            five-column table, a hundred-cell bar, a disclosure list. Each was
            tidier than the last and each got the same note back, because the
            problem was never the arrangement. A reader does not want a
            visualisation of the weights. They want to know what happens to their
            entry.

            So this shows the thing itself: the scorecard a juror is handed for
            one entry in one category. The line items are the criteria, the
            number after each slash is the most that line can earn, and the slot
            before it is **blank** — because a juror writes it, and an empty box
            says that without a sentence. The total is summed from the data, so
            the sheet proves its own arithmetic.

            Seven cards is a set of instruments rather than seven repeated slabs:
            a deck of scorecards genuinely is seven cards, and each carries
            different lines. Three up at `xl`, two at `sm`, one on a phone. */}
        <div>
          <h2 className="text-h1 text-balance">{t("frameworkTitle")}</h2>
          <p className="mt-4 max-w-[62ch] text-body-md text-navy-600">
            {t("frameworkBody")}
          </p>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 xl:grid-cols-3">
            {byParent.map(({ parent, set }) => {
              const total = set.reduce((sum, c) => sum + c.weight, 0);
              return (
                <li key={parent.id} className="flex">
                  <article className="flex w-full flex-col bg-mist">
                    {/* The card's masthead, the way a real form carries one:
                        what the sheet is, and which category it belongs to. */}
                    <div className="bg-navy-950 px-6 py-4 text-cream-100">
                      <p className="font-display text-coord uppercase text-cream-200/70">
                        {t("sheetLabel")}
                      </p>
                      {/* The category, once. Its two-letter code stood beside
                          the name and, spelled out, was the same words twice
                          (§1.3 `[map-update]`, 2026-08-25). */}
                      <h4 className="mt-2 text-h4 text-cream-50">
                        {parent.name[locale]}
                      </h4>
                    </div>

                    <dl className="flex flex-1 flex-col px-6 pt-2 pb-5">
                      {set.map((criterion, i) => (
                        <div
                          key={criterion.id}
                          className="flex items-baseline gap-x-4 border-b border-navy-900/12 py-3"
                        >
                          <span
                            aria-hidden
                            // navy-600, never navy-500: build-state records
                            // navy-500 at 3.45:1, below the 4.5 floor for text
                            // this size.
                            className="font-data text-caption tabular-nums text-navy-600"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <dt className="flex-1 text-body-sm text-navy-900">
                            {criterion.name[locale]}
                          </dt>
                          {/* The blank is the point. A juror writes a mark in
                              it, and the number after the slash is the most that
                              line can carry. */}
                          <dd className="flex shrink-0 items-baseline gap-1.5 font-data text-data-sm tabular-nums">
                            <span
                              aria-hidden
                              className="inline-block w-7 border-b border-navy-900/35"
                            />
                            <span className="text-navy-600">/</span>
                            <span className="text-navy-900">
                              {criterion.weight}
                            </span>
                          </dd>
                        </div>
                      ))}

                      <div className="mt-auto flex items-baseline gap-x-4 pt-4">
                        <dt className="flex-1 font-display text-coord uppercase text-navy-600">
                          {t("totalLabel")}
                        </dt>
                        <dd className="flex shrink-0 items-baseline gap-1.5 font-data text-data-md tabular-nums">
                          <span
                            aria-hidden
                            className="inline-block w-7 border-b-2 border-navy-900/50"
                          />
                          <span className="text-navy-600">/</span>
                          <span className="text-navy-900">{total}</span>
                        </dd>
                      </div>
                    </dl>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
