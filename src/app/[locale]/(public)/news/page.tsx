import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CardTrack } from "@/components/marketing/card-track";
import { InterviewStrip } from "@/components/marketing/interview-strip";
import { NewsFilters, NewsPagination, newsHref } from "@/components/marketing/news-controls";
import { NewsletterBand } from "@/components/marketing/newsletter-band";
import { PageHeader } from "@/components/marketing/page-header";
import { PostCard } from "@/components/marketing/post-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import type { NewsKind } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The media centre.
 *
 * **One hub, three kinds, no second route.** The Sitemap puts News &
 * Highlights, Blog and Winner Interviews under one Media Center branch, and the
 * screen map (1.11) names one page. There is no `/blog` and no
 * `/winner-interviews`: both are `kind` values here, and inventing routes the
 * map does not ask for would fork the archive.
 *
 * Order: the header, then the **latest posts on a track** so the page opens on
 * something rather than on controls, then the filtered archive with its
 * pagination, then the interviews - which are also in the archive, and are
 * pulled out because the Sitemap gives them their own branch - and the
 * newsletter to close on blue.
 *
 * **The track shares Home's `CardTrack`.** The scroll arithmetic that pages by
 * exactly one card, and pages the right way in Arabic, is worth having in one
 * place rather than written a second time here.
 *
 * **The track's posts are not withheld from the archive beneath it.** A single
 * featured post could be lifted out without anybody noticing; six cannot -
 * page one would draw three cards and the count would stop matching the
 * pagination. The band is a shortcut to the newest, the grid is the whole
 * archive, and the band only exists on the bare listing anyway.
 *
 * **Everything about the listing lives in the URL.** `?kind=`, `?category=` and
 * `?page=` are the whole state; there is no client store, so a pasted link, a
 * refresh and the back button all land on the same view.
 */

const PAGE_SIZE = 9;
/** Enough for the track to be worth paging at every width, four fitting at xl. */
const LATEST_COUNT = 6;
const KINDS = new Set<NewsKind>(["news", "article", "interview", "event"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title"), description: t("lead") };
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawKind = one(sp.kind);
  const kind = rawKind && KINDS.has(rawKind as NewsKind) ? (rawKind as NewsKind) : undefined;
  const categorySlug = one(sp.category);
  // A page that is not a number, or is below one, is page one. An unknown
  // category filters nothing rather than 404s: a listing is not a resource.
  const requestedPage = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const t = await getTranslations("news");
  const categories = await api.content.postCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  const current = { kind, category: category?.slug, page };

  const [listing, latestSet, interviewSet] = await Promise.all([
    api.content.posts({
      kind,
      categoryId: category?.id,
      page,
      pageSize: PAGE_SIZE,
    }),
    api.content.posts({ pageSize: LATEST_COUNT }),
    api.content.posts({ kind: "interview", pageSize: 3 }),
  ]);

  const latest = latestSet.items;
  const unfiltered = !kind && !category && page === 1;

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {latest.length && unfiltered ? (
        <section aria-labelledby="latest-title" className="bg-white text-navy-900">
          <div className="page-shell section-y">
            <CardTrack
              heading={
                <h2 id="latest-title" className="text-h1 text-balance">
                  {t("latest")}
                </h2>
              }
              prevLabel={t("previous")}
              nextLabel={t("next")}
            >
              {latest.map((post) => (
                <li
                  key={post.slug}
                  className={cn(
                    "shrink-0 snap-start",
                    "basis-[82%] sm:basis-[calc((100%-1.5rem)/2)]",
                    "lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]",
                  )}
                >
                  <PostCard post={post} categories={categories} locale={locale} />
                </li>
              ))}
            </CardTrack>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="archive-title" className="bg-mist text-navy-900">
        <div className="page-shell section-y">
          {/* Visible now, and named for what it holds. It was `sr-only` while
              the section opened straight onto its filter row; a control row
              with no heading over it is a query builder, not a section. */}
          <h2 id="archive-title" className="text-h1 text-balance">
            {t("archiveTitle")}
          </h2>

          <div className="mt-10">
            <NewsFilters categories={categories} current={current} locale={locale} />
          </div>

          <p className="mt-8 font-display text-coord uppercase text-navy-600" aria-live="polite">
            {listing.total === 1 ? t("resultsOne") : t("results", { count: listing.total })}
          </p>

          {listing.items.length ? (
            <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
              {listing.items.map((post) => (
                <li key={post.slug} className="h-full">
                  <PostCard post={post} categories={categories} locale={locale} />
                </li>
              ))}
            </ul>
          ) : (
            /* An empty result is a state, not a blank. It says what happened
               and offers the one action that fixes it. */
            <div className="mt-10 border border-navy-900/15 bg-white p-10 text-center">
              <p className="text-h3 text-navy-900">{t("empty")}</p>
              <Link
                href={newsHref({})}
                className="mt-6 inline-flex h-11 items-center border border-navy-900 px-6 font-display text-coord uppercase text-navy-900 transition-colors hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {t("emptyAction")}
              </Link>
            </div>
          )}

          <div className="mt-14">
            <NewsPagination page={listing.page} pages={listing.pages} current={current} />
          </div>
        </div>
      </section>

      <InterviewStrip interviews={interviewSet.items} locale={locale} />

      <NewsletterBand title={t("newsletterTitle")} lead={t("newsletterLead")} />
    </>
  );
}
