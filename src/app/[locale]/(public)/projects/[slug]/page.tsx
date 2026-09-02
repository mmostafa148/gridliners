import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProjectHero } from "@/components/marketing/project-hero";
import { ProjectFilm } from "@/components/marketing/project-film";
import { ProjectGallery } from "@/components/marketing/project-gallery";
import { ProjectNarrative } from "@/components/marketing/project-narrative";
import { ProjectRecord } from "@/components/marketing/project-record";
import { ProjectShareDock } from "@/components/marketing/project-share-dock";
import { ProjectStanding } from "@/components/marketing/project-standing";
import { ProjectVoteProvider, VoteBar } from "@/components/marketing/project-vote";
import type { Locale } from "@/i18n/routing";
import { countryName } from "@/lib/display-names";
import { heroFilmFor } from "@/lib/hero-media";
import { projectBySlug, projectSlugs } from "@/lib/project";
import { SITE_URL } from "@/lib/site";

/**
 * One project, whole.
 *
 * The carry-forward every screen since 1.1 has pointed at. It is also the first
 * public screen that **takes an action** - a vote - and the first that publishes
 * a result for a single entry rather than for a year.
 *
 * **Only a shortlisted entry is public.** `lib/project.ts` returns null for
 * every other state - draft, pending payment, submitted, verified, not
 * shortlisted, excluded, cancelled, disqualified - and this route turns that
 * into the localized 404. An entry that was never announced must not be
 * addressable, and a page that 404s is the only honest answer for one.
 *
 * A server component calling `api.*` directly, like every other public screen:
 * Phase 1 is SEO-critical, so the work and its standing belong in the HTML
 * rather than arriving after hydration. Only the two things that need a browser
 * - the vote and the share - are client components.
 *
 * `/awards/[resultId]` stays the Phase 3.1 carry-forward and is not linked from
 * here; a medal on this page states the fact without claiming a page for it.
 */

export async function generateStaticParams() {
  const slugs = await projectSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * `dynamicParams` stays on.
 *
 * 390 shortlisted entries across two locales is a large prerender and it is
 * measured rather than assumed. If it ever has to be bounded, the fallback is
 * prerendering the running cycle and serving the archives on demand - and with
 * this left on, every valid slug is still a real page either way.
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  // `projectBySlug` is awaited on its own and `tMeta` is its own name, both for
  // `check-messages`: it binds one namespace per variable NAME per file and
  // reads `Promise.all` positionally, so a non-`getTranslations` member here
  // would shift the bindings, and reusing `t` would check `project.meta`'s keys
  // against the `project` namespace the page body binds.
  const project = await projectBySlug(decodeURIComponent(slug));
  if (!project) return {};
  const tMeta = await getTranslations({ locale, namespace: "project.meta" });

  const group = project.standings[0]?.subCategory.name[locale] ?? "";
  const title = tMeta("title", { project: project.entry.title });
  const description = tMeta("description", {
    project: project.entry.title,
    maker: project.maker ?? "",
    year: project.cycle.year,
    group,
  });

  // Absolute, built from SITE_URL rather than from `metadataBase`, which the
  // root layout does not set (`lib/site.ts` records the gap). Relative Open
  // Graph URLs would not resolve without it.
  const canonical = `${SITE_URL}/${locale}/projects/${encodeURIComponent(project.entry.slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      locale,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = await projectBySlug(decodeURIComponent(slug));
  if (!project) notFound();

  const { entry, cycle, tier, maker, standings } = project;
  const canonical = `${SITE_URL}/${locale}/projects/${encodeURIComponent(entry.slug)}`;

  return (
    <>
      {/* The work, its name and the vote, in one opening. `PageHeader` is not
          used on this screen: see `ProjectHero` for why, and build-state §24
          for the client instruction that licensed the deviation.

          The provider wraps both surfaces because they are one vote: the hero
          carries the action, the bar takes it over once the hero scrolls away,
          and a single count moves in both. */}
      <ProjectVoteProvider
        entryId={entry.id}
        projectTitle={entry.title}
        votes={project.votes}
        state={project.votingState}
      >
        <ProjectHero
          slug={entry.slug}
          cover={project.cover}
          title={entry.title}
          contentLanguage={entry.contentLanguage}
          contentDir={project.contentDir}
          year={cycle.year}
          maker={maker}
          country={countryName(entry.country, locale)}
          tier={tier}
          subCategories={standings.map((s) => s.subCategory)}
          medals={standings.map((s) => s.medal).filter((m) => m !== null)}
          externalUrl={project.externalUrl}
          locale={locale}
        />
        <VoteBar />
      </ProjectVoteProvider>

      {/* The story and the record are one band, because they are one subject:
          what the work is, and the facts about the work. Splitting them into
          two full-width sections spent a screen on four short lines. */}
      <section className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <ProjectNarrative
            description={entry.description}
            contentLanguage={entry.contentLanguage}
            contentDir={project.contentDir}
            story={project.story}
            locale={locale}
          />

          <div className="mt-16 lg:mt-20">
            <ProjectRecord
              contentLanguage={entry.contentLanguage}
              contentDir={project.contentDir}
              credits={project.credits}
              // The hand-written story client is bilingual and wins where it
              // exists; `entry.client` covers every other public project.
              client={project.story?.client?.[locale] ?? entry.client ?? null}
              owner={maker}
              country={countryName(entry.country, locale)}
              subCategories={standings.map((s) => s.subCategory)}
              locale={locale}
            />
          </div>
        </div>
      </section>

      {/* The film, at full measure, ahead of the frames.
          It is the largest thing a project can hand a reader after the work
          itself, so it leads the picture section rather than trailing it - and
          the gallery's own top spacing keeps the two apart. */}
      <section className="bg-mist">
        <div className="page-shell pt-[var(--section-y)]">
          <ProjectFilm
            href={project.videoUrl}
            local={heroFilmFor(entry.slug)}
            cover={project.cover}
            title={entry.title}
          />
        </div>
      </section>

      <ProjectGallery images={project.gallery} title={entry.title} />

      {/* The standing closes the page's argument: these are the groups it stood
          in and this is what they gave it. The count that ranked them has been
          at the top of the screen the whole way down. */}
      <ProjectStanding
        standings={standings}
        state={project.votingState}
        locale={locale}
      />

      {/* Share is a docked square now, not a closing band: the band asked at
          the one moment a reader had already decided to leave. */}
      <ProjectShareDock url={canonical} title={entry.title} />
    </>
  );
}
