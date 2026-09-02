import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NewsKind, PostCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Filters and pagination, built entirely from links.
 *
 * **No JavaScript is required for either.** Every filter chip and every page
 * control is an anchor carrying the full query, so the listing works from a
 * pasted URL, survives a refresh, moves correctly under browser back and
 * forward, and is reachable with a keyboard because it is made of links rather
 * than of click handlers.
 *
 * **Changing a filter drops the page.** Staying on page 4 while switching to a
 * category that has two pages is how a reader ends up looking at an empty grid
 * and concluding the site is broken.
 *
 * **Category is the only control.** There was a second row of chips for kind -
 * news, article, interview, event - and the client removed it: two filter rows
 * above a grid is a database query, not a media centre, and the kind is already
 * printed on every card. `?kind=` still filters and is still carried through
 * paging, so a link that names one keeps working; nothing in the interface
 * builds one any more.
 */

export interface NewsQuery {
  kind?: NewsKind;
  category?: string;
  page?: number;
}

export function newsHref(q: NewsQuery): string {
  const params = new URLSearchParams();
  if (q.kind) params.set("kind", q.kind);
  if (q.category) params.set("category", q.category);
  if (q.page && q.page > 1) params.set("page", String(q.page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

const chip =
  "inline-flex h-10 items-center border px-5 font-display text-coord uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const on = "border-navy-900 bg-navy-900 text-cream-50";
const off = "border-navy-900/20 bg-white text-navy-700 hover:border-navy-900/50";

export async function NewsFilters({
  categories,
  current,
  locale,
}: {
  categories: PostCategory[];
  current: NewsQuery;
  locale: Locale;
}) {
  const t = await getTranslations("news");

  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-coord uppercase text-navy-600" id="filter-category">
        {t("filterCategory")}
      </p>
      <ul aria-labelledby="filter-category" className="flex flex-wrap gap-2">
        <li>
          <Link
            href={newsHref({ kind: current.kind })}
            aria-current={!current.category ? "true" : undefined}
            className={cn(chip, !current.category ? on : off)}
          >
            {t("all")}
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={newsHref({ kind: current.kind, category: c.slug })}
              aria-current={current.category === c.slug ? "true" : undefined}
              className={cn(chip, current.category === c.slug ? on : off)}
            >
              {c.name[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Numbered pages, with the window trimmed around the current one.
 *
 * A listing of six pages shows all six; a listing of forty shows the ends and a
 * window, because a control that wraps onto three lines is not navigation.
 */
export async function NewsPagination({
  page,
  pages,
  current,
}: {
  page: number;
  pages: number;
  current: NewsQuery;
}) {
  const t = await getTranslations("news");
  if (pages <= 1) return null;

  const window = new Set<number>([1, pages, page, page - 1, page + 1]);
  const shown = [...window].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  const step =
    "inline-flex h-11 min-w-11 items-center justify-center border px-4 font-display text-coord uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-between gap-4">
      <p className="font-display text-coord uppercase text-navy-600">
        {t("pageOf", { page, pages })}
      </p>

      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={newsHref({ ...current, page: page - 1 })} className={cn(step, off)} rel="prev">
              {t("previous")}
            </Link>
          ) : (
            <span aria-disabled className={cn(step, "border-navy-900/10 text-navy-900/65")}>
              {t("previous")}
            </span>
          )}
        </li>

        {shown.map((n, i) => (
          <li key={n} className="flex items-center gap-2">
            {i > 0 && n - shown[i - 1] > 1 ? (
              <span aria-hidden className="px-1 text-navy-600">…</span>
            ) : null}
            <Link
              href={newsHref({ ...current, page: n })}
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
            <Link href={newsHref({ ...current, page: page + 1 })} className={cn(step, off)} rel="next">
              {t("next")}
            </Link>
          ) : (
            <span aria-disabled className={cn(step, "border-navy-900/10 text-navy-900/65")}>
              {t("next")}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
