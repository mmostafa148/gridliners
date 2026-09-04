import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DrawnPortrait } from "@/components/brand/drawn-marks";
import { InterviewPlayer } from "@/components/marketing/interview-player";
import { NewsletterBand } from "@/components/marketing/newsletter-band";
import { PostCard } from "@/components/marketing/post-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

/**
 * One post, whole.
 *
 * **Every kind renders from the same composition**, because they are one
 * content type. An interview adds two blocks - the film and the transcript -
 * and changes nothing else; a reader moving from a news item to an interview
 * should not feel they have moved to a different site.
 *
 * The body, film and transcript share one editorial measure. Interviews add a
 * compact, sticky contributor rail beside it on wide screens; on small screens
 * that rail returns to the normal document flow.
 *
 * **The transcript sits above the related posts and is always present on an
 * interview.** A film with no transcript is content that only exists for people
 * who can play it, and the page has no way of knowing whether the reader can.
 */

export async function generateStaticParams() {
  const { items } = await api.content.posts({ pageSize: 200 });
  return items.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await api.content.postBySlug(decodeURIComponent(slug));
  if (!post) return {};
  const canonical = `${SITE_URL}/${locale}/news/${encodeURIComponent(post.slug)}`;
  return {
    title: post.title[locale],
    description: post.excerpt[locale],
    alternates: { canonical },
    openGraph: {
      title: post.title[locale],
      description: post.excerpt[locale],
      url: canonical,
      type: "article",
      locale,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await api.content.postBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  const t = await getTranslations("post");
  const [categories, related] = await Promise.all([
    api.content.postCategories(),
    api.content.relatedPosts(post.slug, 3),
  ]);
  const category = categories.find((c) => c.id === post.categoryId);
  const date = new Date(post.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const person = post.interview;

  return (
    <>
      <article>
        <header className="bg-navy-950 text-cream-50">
          <div className="page-shell pt-[calc(var(--chrome-h)-var(--announce-h))]">
            <div
              className={
                post.imageUrl
                  ? "grid border-b border-cream-50/15 lg:min-h-[clamp(32rem,62vh,42rem)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
                  : "max-w-[64rem] border-b border-cream-50/15"
              }
            >
              <div className="flex flex-col py-9 lg:min-h-full lg:pe-14 lg:py-14 xl:pe-20">
                <p className="font-display text-coord uppercase">
                  <Link
                    href="/news"
                    className="inline-flex min-h-11 items-center gap-2 text-cream-200/85 underline underline-offset-4 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                  >
                    <ArrowLeft
                      aria-hidden
                      className="size-3.5 rtl:-scale-x-100"
                      strokeWidth={2.5}
                    />
                    {t("backToNews")}
                  </Link>
                </p>

                <div className="my-12 lg:my-auto lg:py-10">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-coord uppercase text-gold-500">
                    <span>{t(`kind.${post.kind}`)}</span>
                    {category ? (
                      <>
                        <span aria-hidden className="h-px w-7 shrink-0 bg-gold-500/70" />
                        <span>{category.name[locale]}</span>
                      </>
                    ) : null}
                  </p>
                  <h1 className="mt-6 max-w-[22ch] text-[clamp(2.25rem,3.1vw,3.625rem)] font-black leading-[1] tracking-[-0.03em] text-balance">
                    {post.title[locale]}
                  </h1>
                  <p className="mt-8 max-w-[52ch] text-body-lg leading-[1.65] text-cream-100/85">
                    {post.excerpt[locale]}
                  </p>
                </div>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-coord uppercase text-cream-200/75">
                  <time dateTime={post.publishedAt}>{date}</time>
                  {post.readMinutes ? (
                    <>
                      <span aria-hidden className="size-[3px] shrink-0 bg-cream-200/55" />
                      <span>{t("readTime", { minutes: post.readMinutes })}</span>
                    </>
                  ) : null}
                </p>
              </div>

              {post.imageUrl ? (
                <div className="relative min-h-[22rem] overflow-hidden border-t border-cream-50/15 lg:min-h-full lg:border-s lg:border-t-0">
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                    className="object-cover"
                  />
                  <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold-500" />
                  <p className="absolute bottom-0 start-0 bg-cream-50 px-5 py-3 font-display text-coord uppercase text-navy-950">
                    {t(`kind.${post.kind}`)} · {date}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="bg-white text-navy-900">
          <div className="page-shell py-[clamp(4.5rem,7vw,7rem)]">
            <div
              className={
                person
                  ? "grid items-start gap-12 lg:grid-cols-[17rem_minmax(0,60rem)] lg:justify-center lg:gap-16 xl:grid-cols-[18rem_minmax(0,62rem)] xl:gap-20"
                  : "mx-auto max-w-[52rem]"
              }
            >
              {person ? (
                <aside
                  aria-labelledby="interviewee-title"
                  className="bg-navy-950 p-7 text-cream-50 lg:sticky lg:top-[calc(var(--chrome-h)+2rem)] lg:p-8"
                >
                  <span aria-hidden className="mb-7 block h-1 w-16 bg-gold-500" />
                  <h2
                    id="interviewee-title"
                    className="font-display text-coord uppercase text-gold-500"
                  >
                    {t("interviewWith")}
                  </h2>
                  <div className="mt-7 flex items-start gap-5 lg:flex-col lg:gap-7">
                    <DrawnPortrait
                      seed={person.portraitSeed}
                      title={person.name[locale]}
                      className="size-24 shrink-0 bg-cream-50 lg:size-32"
                    />
                    <div className="min-w-0">
                      <p className="text-h2 leading-tight">{person.name[locale]}</p>
                      <p className="mt-3 font-display text-coord uppercase text-cream-200/75">
                        {person.role[locale]}
                      </p>
                    </div>
                  </div>
                </aside>
              ) : null}

              <div className="min-w-0">
                {person ? (
                  <section aria-labelledby="film-title">
                    <div className="mb-5 flex items-center gap-5">
                      <h2
                        id="film-title"
                        className="font-display text-coord uppercase text-blue-700"
                      >
                        {t("watchTitle")}
                      </h2>
                      <span aria-hidden className="h-px flex-1 bg-navy-900/25" />
                    </div>
                    <InterviewPlayer
                      src={person.videoUrl}
                      poster={person.posterUrl}
                      title={post.title[locale]}
                    />
                  </section>
                ) : null}

                <div className={person ? "mt-16 max-w-[52rem]" : undefined}>
                  {(post.body ?? []).map((section, i) => (
                    <section
                      key={i}
                      className={i > 0 ? "mt-16 border-t border-navy-900/15 pt-10" : undefined}
                    >
                      {section.heading ? (
                        <h2 className="text-[clamp(2rem,3vw,3.25rem)] font-black leading-[1.02] tracking-[-0.025em] text-balance">
                          {section.heading[locale]}
                        </h2>
                      ) : null}
                      {section.paragraphs.map((p, j) => (
                        <p
                          key={j}
                          className={
                            i === 0 && j === 0 && !section.heading
                              ? "border-s-4 border-gold-500 bg-cream-100 px-7 py-8 text-[clamp(1.25rem,2vw,1.75rem)] font-semibold leading-[1.55] text-navy-900 sm:px-9 sm:py-10"
                              : "mt-6 text-body-md leading-[1.85] text-navy-600"
                          }
                        >
                          {p[locale]}
                        </p>
                      ))}
                    </section>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

        {person ? (
          <section aria-labelledby="transcript-title" className="bg-navy-950 text-cream-50">
            <div className="page-shell py-[clamp(4.5rem,7vw,7rem)]">
              <div className="grid gap-12 lg:grid-cols-[17rem_minmax(0,60rem)] lg:justify-center lg:gap-16 xl:grid-cols-[18rem_minmax(0,62rem)] xl:gap-20">
                <header>
                  <span aria-hidden className="mb-7 block h-1 w-16 bg-gold-500" />
                  <h2 id="transcript-title" className="text-display-md leading-[1.02]">
                    {t("transcript")}
                  </h2>
                  <p className="mt-6 font-display text-coord uppercase leading-relaxed text-cream-200/70">
                    {t("transcriptNote")}
                  </p>
                </header>

                <ol className="border-b border-cream-50/20">
                  {person.transcript.map((section, i) => (
                    <li
                      key={i}
                      className="grid gap-5 border-t border-cream-50/20 py-9 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-8 sm:py-11"
                    >
                      <span aria-hidden className="font-data text-h3 text-gold-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        {section.heading ? (
                          <h3 className="text-h2 leading-tight text-cream-50">
                            {section.heading[locale]}
                          </h3>
                        ) : null}
                        {section.paragraphs.map((p, j) => (
                          <p
                            key={j}
                            className="mt-5 text-body-md leading-[1.85] text-cream-100/75"
                          >
                            {p[locale]}
                          </p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        ) : null}
      </article>

      {related.length ? (
        <section aria-labelledby="related-title" className="bg-cream-50 text-navy-900">
          <div className="page-shell py-[clamp(3.5rem,5vw,5rem)]">
            <h2
              id="related-title"
              className="flex items-end gap-5 text-display-md leading-none"
            >
              <span aria-hidden className="mb-1.5 h-3 w-3 shrink-0 bg-gold-500" />
              {t("related")}
            </h2>
            <ul className="mt-9 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="h-full">
                  <PostCard post={r} categories={categories} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <NewsletterBandForPost locale={locale} />
    </>
  );
}

// `tNews` rather than `t`: `check-messages` binds one namespace per variable
// NAME per file, so a second `t` here would rebind every use above it to this
// namespace and report the whole page as missing keys.
async function NewsletterBandForPost({ locale }: { locale: Locale }) {
  const tNews = await getTranslations({ locale, namespace: "news" });
  return <NewsletterBand title={tNews("newsletterTitle")} lead={tNews("newsletterLead")} />;
}
