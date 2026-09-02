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
 * The reading column is `page-shell-prose`, which is narrower than the page
 * shell on purpose: a 1,600px measure is unreadable, and the covers and the
 * film are the only things that take the full width.
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
          <div className="page-shell flex flex-col gap-8 pb-14 pt-[calc(var(--chrome-h)-var(--announce-h)+1.5rem)] lg:pb-16 lg:pt-[calc(var(--chrome-h)-var(--announce-h)+3rem)]">
            <p className="font-display text-coord uppercase">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-cream-200/85 underline underline-offset-4 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" strokeWidth={2.5} />
                {t("backToNews")}
              </Link>
            </p>

            <div className="max-w-[46rem]">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-coord uppercase text-cream-200/85">
                <span>{t(`kind.${post.kind}`)}</span>
                {category ? (
                  <>
                    <span aria-hidden className="size-[3px] shrink-0 bg-cream-200/55" />
                    <span>{category.name[locale]}</span>
                  </>
                ) : null}
                <span aria-hidden className="size-[3px] shrink-0 bg-cream-200/55" />
                <time dateTime={post.publishedAt}>{date}</time>
                {post.readMinutes ? (
                  <>
                    <span aria-hidden className="size-[3px] shrink-0 bg-cream-200/55" />
                    <span>{t("readTime", { minutes: post.readMinutes })}</span>
                  </>
                ) : null}
              </p>
              <h1 className="mt-5 text-display-md leading-[1.05] text-balance">
                {post.title[locale]}
              </h1>
              <p className="mt-6 text-body-lg text-cream-100/90">{post.excerpt[locale]}</p>
            </div>
          </div>
        </header>

        {post.imageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-950">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
        ) : null}

        {person ? (
          <section aria-labelledby="interviewee-title" className="bg-white text-navy-900">
            <div className="page-shell section-y">
              <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <h2
                    id="interviewee-title"
                    className="font-display text-coord uppercase text-navy-600"
                  >
                    {t("interviewWith")}
                  </h2>
                  <div className="mt-6 flex items-start gap-5">
                    <DrawnPortrait
                      seed={person.portraitSeed}
                      title={person.name[locale]}
                      className="size-24 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-h3 leading-tight">{person.name[locale]}</p>
                      <p className="mt-2 font-display text-coord uppercase text-blue-700">
                        {person.role[locale]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 lg:col-start-6">
                  <InterviewPlayer
                    src={person.videoUrl}
                    poster={person.posterUrl}
                    title={post.title[locale]}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="bg-white text-navy-900">
          <div className="page-shell-prose section-y">
            {(post.body ?? []).map((section, i) => (
              <section key={i} className={i > 0 ? "mt-12" : undefined}>
                {section.heading ? (
                  <h2 className="text-h2 leading-tight text-balance">{section.heading[locale]}</h2>
                ) : null}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className={
                      // The opening paragraph is the standfirst and is set larger.
                      i === 0 && j === 0 && !section.heading
                        ? "text-body-lg leading-relaxed text-navy-900"
                        : "mt-5 text-body-md leading-relaxed text-navy-600"
                    }
                  >
                    {p[locale]}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>

        {person ? (
          <section aria-labelledby="transcript-title" className="bg-mist text-navy-900">
            <div className="page-shell-prose section-y">
              <h2 id="transcript-title" className="text-h2 leading-tight">
                {t("transcript")}
              </h2>
              <p className="mt-3 font-display text-coord uppercase text-navy-600">
                {t("transcriptNote")}
              </p>
              {person.transcript.map((section, i) => (
                <div key={i} className="mt-10 border-t border-navy-900/15 pt-8">
                  {section.heading ? (
                    <h3 className="font-display text-coord uppercase text-blue-700">
                      {section.heading[locale]}
                    </h3>
                  ) : null}
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="mt-4 text-body-md leading-relaxed text-navy-600">
                      {p[locale]}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {related.length ? (
        <section aria-labelledby="related-title" className="bg-white text-navy-900">
          <div className="page-shell section-y">
            <h2
              id="related-title"
              className="flex items-center gap-4 font-display text-coord uppercase text-navy-600"
            >
              <span aria-hidden className="h-px w-10 shrink-0 bg-blue-700" />
              {t("related")}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
