import { ArrowRight, Layers, LayoutGrid, Medal, Users } from "lucide-react";
import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { AboutStory } from "@/components/marketing/about-story";
import { AwardLevels } from "@/components/marketing/award-levels";
import { CategoryGroups } from "@/components/marketing/category-groups";
import { CategoryIndex } from "@/components/marketing/category-index";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { CycleRoute } from "@/components/marketing/cycle-route";
import { EntryCost } from "@/components/marketing/entry-cost";
import { PageHeader } from "@/components/marketing/page-header";
import { SubmissionGuidelines } from "@/components/marketing/submission-guidelines";
import { WinnerYears } from "@/components/marketing/winner-years";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { TIERS } from "@/lib/api/types";
import { winnerYears } from "@/lib/winners";

/**
 * The Awards hub.
 *
 * **Awards has a page now, and this reverses a recorded decision.** Build-state
 * §42 and this route's own absence were the result of reading the Sitemap as
 * giving Awards five branches and no page: the menu was pointed at existing
 * content instead, with Overview landing on `/about`. The client has overruled
 * that reading, so Awards gets the page the Sitemap draws.
 *
 * **Every branch is the section that already serves it, rendered here.** Two
 * passes of hand-written summaries were rejected as basic, and the instruction
 * that settled it was to use the sections as they are implemented on their own
 * pages rather than paraphrase them. So the Award Story is `/about`'s
 * `AboutStory`, Categories are `/categories`' `CategoryIndex` and
 * `CategoryGroups`, Fees is `/how-to-enter`'s `EntryCost`, How to Enter and
 * Benefits are its `SubmissionGuidelines`, the timetable is `CycleRoute` and
 * the archive is `WinnerYears`. **Nothing on this page is a second version of
 * a section that exists.**
 *
 * The one thing written for this page is the figure row, because the
 * programme's own totals are the fact a hub can state that none of the
 * branch pages does.
 *
 * **The order is set by ground colour as well as by the Sitemap**: each
 * section brings its own band, and sequenced naively two mist sections met and
 * read as one. No two adjacent bands share a ground.
 *
 * `/awards/<id>` remains the single-award record from 3.1. An index beside a
 * dynamic child does not shadow it.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "awardsHub.meta" });
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function AwardsHubPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const format = await getFormatter();
  const [t, tClosing, cycle, parents, subCategories, years, ceremonies] =
    await Promise.all([
      getTranslations("awardsHub"),
      getTranslations("awardsHub.closing"),
      api.cycles.getActive(),
      api.taxonomy.parentCategories(),
      api.taxonomy.subCategories(),
      winnerYears(),
      api.content.ceremonies(),
    ]);
  // Sequenced after the cycle: the pricing config is keyed by cycle id, so
  // there is nothing to fetch until that resolves.
  const pricing = await api.pricing.config(cycle.id);

  /**
   * The programme in four figures, all counted rather than written, so they
   * cannot go stale against the sections listing the same things below.
   */
  const figures = [
    { value: parents.length, label: t("figures.categories"), Icon: LayoutGrid },
    { value: subCategories.length, label: t("figures.groups"), Icon: Layers },
    { value: TIERS.length, label: t("figures.tiers"), Icon: Users },
    {
      value: years.reduce((n, y) => n + y.medalCount, 0),
      label: t("figures.medals"),
      Icon: Medal,
    },
  ];

  /** Each branch, and the screen that owns it. */
  const branches = [
    { href: "/about", label: t("overview.link") },
    { href: "/categories", label: t("categories.link") },
    { href: "/how-to-enter#fees", label: t("fees.link") },
    { href: "/how-to-enter", label: t("enter.link") },
    { href: "/winners", label: t("recordLink") },
  ];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* Overview, branch 1: the award story, as About tells it. */}
      <AboutStory />

      {/* The programme's own totals. The one section written for this page. */}
      <section className="bg-mist text-navy-900">
        <div className="page-shell section-y">
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {figures.map((f) => (
              <div key={f.label}>
                {/* The icons follow the ones already carrying these ideas
                    elsewhere: `Layers` is what `entry-cost` marks sub-categories
                    with, and `Medal` is what `WinnerYears` counts medals with
                    directly below. */}
                <f.Icon
                  aria-hidden
                  className="size-6 text-blue-700"
                  strokeWidth={1.75}
                />
                <dt className="sr-only">{f.label}</dt>
                <dd className="mt-5 font-data text-display-sm leading-none tabular-nums text-navy-950">
                  {format.number(f.value)}
                </dd>
                <p className="mt-3 font-display text-coord uppercase text-navy-600">
                  {f.label}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The three levels. Built in 1.1 and unused since: rejected on Jury
          because metal bands beside the tiers would state that corporate is
          gold, and passed over on Winners because it explains the levels
          rather than publishing results. Both objections are about those
          screens; this is the page that exists to explain the awards. */}
      <AwardLevels />

      {/* Overview, branch 2: the Award Timetable. */}
      <CycleRoute cycle={cycle} />

      {/* Branch 3: Categories, exactly as `/categories` builds them. */}
      <CategoryIndex parents={parents} subCategories={subCategories} />
      <CategoryGroups parents={parents} subCategories={subCategories} />

      {/* Branch 4: Fees & Deadlines, as `/how-to-enter` builds them. */}
      <EntryCost
        cycle={cycle}
        basePrices={pricing.basePrices}
        loyaltyRules={pricing.loyaltyRules}
        subCategories={subCategories}
      />

      {/* Branches 5 and 6: How to Enter, and the Benefits block inside it. */}
      <SubmissionGuidelines />

      {/* Overview, branch 3: Previous Successful Awards, the calendar of years.
          `current={0}` is not a year, so nothing is filtered and the whole
          archive lists. */}
      <WinnerYears
        years={years}
        ceremonies={ceremonies}
        current={0}
        title={t("previous")}
      />

      {/* Every branch, pointing at the screen that owns it. */}
      <section className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <p className="max-w-[58ch] text-body-md text-navy-600">
            {t("record")}
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {branches.map((b) => (
              <li key={b.href}>
                <Link
                  href={b.href}
                  className="group inline-flex items-center gap-2 font-display text-coord uppercase text-blue-700 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  {b.label}
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        groundAbove="bg-white"
        selfHref="/awards"
      />
    </>
  );
}
