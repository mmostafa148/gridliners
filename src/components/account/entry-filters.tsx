import { getTranslations } from "next-intl/server";

import { accountStep } from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { EntryState } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * My Entries' whole query, as links.
 *
 * **The URL is the state.** `?state=&cycle=&query=&page=` is all of it, exactly
 * as 1.11's listing works, so a pasted link, a refresh and the back button land
 * on the same view. Search is the one control that needs a form, because a text
 * field cannot be a link; everything else is an anchor and works with
 * JavaScript off.
 *
 * **Changing a filter drops the page.** Staying on page 3 while switching to a
 * state that has one page is how somebody ends up looking at an empty list.
 */

export interface EntriesQuery {
  /** Several states at once, since the filter is a multi-select. */
  states?: EntryState[];
  cycles?: string[];
  query?: string;
  page?: number;
}

/**
 * The listing's URL, rebuilt.
 *
 * Repeated parameters for the multi-selects — `?state=draft&state=submitted` —
 * which is what a checkbox group posts and what the page reads back.
 */
export function entriesHref(q: EntriesQuery): string {
  const params = new URLSearchParams();
  for (const state of q.states ?? []) params.append("state", state);
  for (const cycle of q.cycles ?? []) params.append("cycle", cycle);
  if (q.query) params.set("query", q.query);
  if (q.page && q.page > 1) params.set("page", String(q.page));
  const qs = params.toString();
  return qs ? `/entries?${qs}` : "/entries";
}

/** Numbered paging that carries the filters with it. */
export async function EntryPagination({
  page,
  pages,
  current,
}: {
  page: number;
  pages: number;
  current: EntriesQuery;
}) {
  const t = await getTranslations("entries");
  if (pages <= 1) return null;

  const window = new Set([1, pages, page, page - 1, page + 1]);
  const shown = [...window].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  const { base: step, on, off } = accountStep;

  return (
    <nav aria-label={t("pagination")} className="flex flex-wrap items-center gap-4">
      <p className="text-body-sm text-navy-600">{t("pageOf", { page, pages })}</p>
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={entriesHref({ ...current, page: page - 1 })} rel="prev" className={cn(step, off)}>
              {t("previous")}
            </Link>
          ) : (
            <span aria-disabled className={cn(step, accountStep.disabled)}>
              {t("previous")}
            </span>
          )}
        </li>
        {shown.map((n, i) => (
          <li key={n} className="flex items-center gap-2">
            {i > 0 && n - shown[i - 1] > 1 ? (
              <span aria-hidden className="px-1 text-navy-600">
                …
              </span>
            ) : null}
            <Link
              href={entriesHref({ ...current, page: n })}
              aria-current={n === page ? "page" : undefined}
              aria-label={t("page", { page: n })}
              className={cn(step, n === page ? on : off)}
            >
              {n}
            </Link>
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={entriesHref({ ...current, page: page + 1 })} rel="next" className={cn(step, off)}>
              {t("next")}
            </Link>
          ) : (
            <span aria-disabled className={cn(step, accountStep.disabled)}>
              {t("next")}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
