import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { AwardMark } from "@/components/account/award-mark";
import { CollectAward } from "@/components/account/collect-award";
import { EntryCover } from "@/components/account/entry-cover";
import {
  AccountEmptyState,
  CountPill,
  Eyebrow,
  Meta,
  accountAction,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { deliverablesFor } from "@/lib/account/files/deliverables";
import { requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "awards" });
  return { title: t("title") };
}

const LEVEL_RAIL = {
  gold: "bg-gold",
  silver: "bg-silver",
  bronze: "bg-bronze",
} as const;

/**
 * 2.7 — an awards cabinet, not a download manager.
 *
 * A medal is an occasion: its work takes one edge of a full-width band while
 * the level, group and single Collect action carry the other. Awards are
 * grouped by cycle because the year is part of the achievement, not metadata
 * repeated in five unrelated cards.
 *
 * Finalist recognition is deliberately quieter and denser. An honorary title
 * belongs to the participant rather than a work, so it closes the page as an
 * institutional statement on navy.
 */
export default async function MyAwardsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tTier, tLevel, deliverables, entries, cycles, subCategories] = await Promise.all([
    getTranslations("awards"),
    getTranslations("tier"),
    getTranslations("awardLevel"),
    deliverablesFor(participant.id, locale),
    api.entries.list({ participantId: participant.id }),
    api.cycles.list(),
    api.taxonomy.subCategories(),
  ]);

  const finalists = entries.filter((entry) => entry.state === "shortlisted");
  const yearOf = new Map(cycles.map((cycle) => [cycle.id, cycle.year]));
  const parentOf = new Map(subCategories.map((sub) => [sub.id, sub.parentId]));
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const awardYears = [...new Set(deliverables.map((award) => award.cycleYear))].sort((a, b) => b - a);

  const honorary = (await Promise.all(cycles.map((cycle) => api.results.honorary(cycle.id))))
    .flat()
    .filter((award) => award.published && award.subject.name === participant.name);

  const nothing = deliverables.length === 0 && finalists.length === 0 && honorary.length === 0;

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-account-title text-navy-950">{t("title")}</h1>
          {deliverables.length ? <CountPill>{deliverables.length}</CountPill> : null}
        </div>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        {nothing ? (
          <AccountEmptyState title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <div className="space-y-10 md:space-y-14">
            {deliverables.length ? (
              <section aria-labelledby="award-cabinet-title">
                <div className="mb-5 grid items-end gap-4 border-b border-navy-900/15 pb-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <Eyebrow tone="gold">{t("cabinetEyebrow")}</Eyebrow>
                    <h2 id="award-cabinet-title" className="mt-1.5 font-display text-account-section text-navy-950">
                      {t("cabinetTitle")}
                    </h2>
                  </div>
                  <p className="max-w-[54ch] text-body-sm leading-relaxed text-navy-600 md:text-end">
                    {t("provisionalBody")}
                  </p>
                </div>

                <div className="space-y-10">
                  {awardYears.map((year) => {
                    const yearAwards = deliverables.filter((award) => award.cycleYear === year);
                    return (
                      <section key={year} aria-labelledby={`award-year-${year}`}>
                        <header className="mb-3 flex items-end justify-between gap-5">
                          <h3 id={`award-year-${year}`} className="font-data text-[2.75rem] leading-none text-navy-950 sm:text-[3.5rem]">
                            {year}
                          </h3>
                          <Meta>{t("awardsInYear", { count: yearAwards.length })}</Meta>
                        </header>

                        <div className="space-y-4 sm:space-y-5">
                          {yearAwards.map((award, index) => {
                            const entry = entryById.get(award.entryId);
                            const reverse = index % 2 === 1;
                            return (
                              <article
                                key={award.resultId}
                                className="relative grid border border-navy-900/15 bg-white lg:grid-cols-[42%_58%] xl:grid-cols-2"
                              >
                                <span aria-hidden className={cn("absolute inset-x-0 top-0 z-10 h-1", LEVEL_RAIL[award.level])} />
                                <div
                                  className={cn(
                                    "relative min-h-60 bg-navy-900/8 sm:min-h-72 lg:row-start-1 lg:min-h-[23rem]",
                                    reverse ? "lg:col-start-2" : "lg:col-start-1",
                                  )}
                                >
                                  {entry ? (
                                    <EntryCover
                                      entry={entry}
                                      parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                                      className="absolute inset-0 size-full"
                                      sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 42vw, 100vw"
                                      priority={year === awardYears[0] && index === 0}
                                    />
                                  ) : null}
                                  <AwardMark
                                    level={award.level}
                                    year={award.cycleYear}
                                    size="lg"
                                    className="absolute end-5 top-0 z-20 shadow-[0_10px_24px_rgba(8,24,55,0.18)]"
                                  />
                                </div>

                                <div
                                  className={cn(
                                    "flex min-w-0 flex-col p-6 sm:p-8 lg:row-start-1 lg:p-10",
                                    reverse ? "lg:col-start-1" : "lg:col-start-2",
                                  )}
                                >
                                  <Eyebrow tone="gold">{tLevel(award.level)}</Eyebrow>
                                  <h4 className="mt-2 max-w-[22ch] font-display text-[clamp(1.75rem,3vw,3rem)] font-semibold leading-[1.02] text-navy-950">
                                    {award.entryTitle}
                                  </h4>
                                  <p className="mt-4 max-w-[54ch] text-body-md text-navy-700">{award.group}</p>
                                  <p className="mt-1 text-body-sm text-navy-600">
                                    {tTier(award.tier as "students")} · {award.entryId}
                                  </p>

                                  <nav
                                    aria-label={award.entryTitle}
                                    className="mt-8 flex flex-wrap gap-3 border-t border-navy-900/12 pt-5 lg:mt-auto lg:pe-[11.125rem]"
                                  >
                                    <Link href={`/awards/${award.resultId}`} className={cn(accountAction.secondary, "min-h-11 px-3")}>{t("publicPage")}</Link>
                                    <Link href={`/projects/${award.entrySlug}`} className={cn(accountAction.secondary, "min-h-11 px-3")}>{t("viewWork")}</Link>
                                  </nav>
                                </div>

                                <CollectAward
                                  resultId={award.resultId}
                                  level={award.level}
                                  cycleYear={award.cycleYear}
                                  locale={locale}
                                  contentSide={reverse ? "start" : "end"}
                                />
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {finalists.length ? (
              <section aria-labelledby="finalist-recognition-title">
                <header className="border border-navy-900/12 bg-white px-5 py-5 sm:px-7">
                  <Eyebrow>{t("finalistTitle")}</Eyebrow>
                  <h2 id="finalist-recognition-title" className="mt-1.5 font-display text-account-section text-navy-950">{t("recognitionTitle")}</h2>
                  <p className="mt-1.5 text-body-sm text-navy-600">{t("finalistLead")}</p>
                </header>

                <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {finalists.map((entry) => (
                    <li key={entry.id} className="group relative border border-navy-900/12 bg-white p-5 sm:p-6">
                      <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-blue-700 transition-transform group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none" />
                      <div className="flex gap-4">
                        <EntryCover
                          entry={entry}
                          parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                          className="h-20 w-28 shrink-0 ring-1 ring-navy-900/10"
                          sizes="112px"
                        />
                        <div className="min-w-0">
                          <h3 className="text-body-md font-semibold text-navy-950">{entry.title}</h3>
                          <Meta className="mt-1 block">{t("year")} {yearOf.get(entry.cycleId)}</Meta>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-navy-900/10 pt-4">
                        <a href={`/${locale}/downloads/finalist-badge/${entry.id}`} className={cn(accountAction.secondary, "min-h-11 gap-2")}>
                          <Download aria-hidden className="size-4" />
                          {t("badge")}
                        </a>
                        <Link href={`/entries/${entry.id}`} className={accountAction.quiet}>{t("viewEntry")}</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {honorary.length ? (
              <section aria-labelledby="honorary-title" className="relative overflow-hidden bg-navy-950 text-cream-50">
                <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
                <div className="border-b border-cream-100/15 px-6 py-5 sm:px-9">
                  <Eyebrow tone="goldOnNavy">{t("honoraryEyebrow")}</Eyebrow>
                  <h2 id="honorary-title" className="mt-1.5 font-display text-account-section text-cream-50">{t("honoraryTitle")}</h2>
                </div>
                <ul>
                  {honorary.map((award) => (
                    <li key={award.id} className="grid gap-7 px-6 py-8 sm:px-9 md:grid-cols-[auto_1fr] md:items-center md:py-10">
                      <AwardMark level="honorary" size="lg" className="ring-1 ring-cream-100/20" />
                      <div className="min-w-0">
                        <Eyebrow tone="onNavy">{award.type.replace(/_/g, " ")}</Eyebrow>
                        <h3 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-cream-50">{award.subject.name}</h3>
                        <p className="mt-3 max-w-[68ch] text-body-md leading-relaxed text-cream-200/85">{award.citation[locale]}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
