import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { AwardMark } from "@/components/account/award-mark";
import { EntryCover } from "@/components/account/entry-cover";
import { EntryStatus } from "@/components/account/entry-status";
import { Obligations } from "@/components/account/obligations";
import {
  AccountEmptyState,
  AccountPanel,
  AccountStack,
  Figure,
  Meta,
  PANEL_X,
  accountAction,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { ENTRY_STATES } from "@/lib/api/types";
import { nextActions } from "@/lib/account/next-actions";
import { deliverablesFor } from "@/lib/account/files/deliverables";
import { requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title") };
}

/**
 * The participant's desk: decision, work, then account detail.
 *
 * Counts are a quiet standing rail rather than four equal dashboard cards. The
 * first open obligation owns the only dark stage on the page, while recognition
 * sits on the work inside one portfolio instead of repeating it in a second
 * gallery. State totals and payments remain available, but they are supporting
 * records rather than the page's opening argument.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tPhase, tStatus, tStanding, format] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("cyclePhase"),
    getTranslations("paymentStatus"),
    getTranslations("accountStanding"),
    getFormatter(),
  ]);

  const [entries, cycles, actions, payments, subCategories, deliverables] = await Promise.all([
    api.entries.list({ participantId: participant.id }),
    api.cycles.list(),
    nextActions(participant.id),
    api.payments.forParticipant(participant.id),
    api.taxonomy.subCategories(),
    deliverablesFor(participant.id, locale),
  ]);

  const cycle = cycles.find((c) => c.status === "active") ?? cycles[0];
  const pricing = cycle ? await api.pricing.config(cycle.id) : null;
  const inCycle = entries.filter((e) => e.cycleId === cycle?.id);
  const submittedThisCycle = inCycle.filter((e) => e.submittedAt).length;
  const nextNumber = submittedThisCycle + 1;

  const rules = [...(pricing?.loyaltyRules ?? [])].sort(
    (a, b) => a.fromSubmissionNumber - b.fromSubmissionNumber,
  );
  const earned = [...rules].reverse().find((r) => nextNumber >= r.fromSubmissionNumber);
  const upcoming = rules.find((r) => r.fromSubmissionNumber > nextNumber);

  const totals = ENTRY_STATES.map((state) => ({
    state,
    count: entries.filter((e) => e.state === state).length,
  })).filter((row) => row.count > 0);

  const recent = [...payments]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);
  const titleOf = new Map(entries.map((e) => [e.id, e.title]));
  const parentOf = new Map(subCategories.map((s) => [s.id, s.parentId]));
  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const entryById = new Map(entries.map((e) => [e.id, e]));

  // The count is every shortlisted entry; the strip shows the first six. A card
  // that counted the capped array would understate the account.
  const shortlisted = entries.filter((e) => e.state === "shortlisted");
  const awardedEntries = deliverables.flatMap((deliverable) => {
    const entry = entryById.get(deliverable.entryId);
    return entry ? [entry] : [];
  });
  const portfolioEntries = [
    ...new Map([...shortlisted, ...awardedEntries].map((entry) => [entry.id, entry])).values(),
  ].slice(0, 6);
  const awardByEntry = new Map(deliverables.map((deliverable) => [deliverable.entryId, deliverable]));

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <div className="flex flex-col gap-5 border-b border-navy-900/12 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
            <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("leadNamed")}</p>
          </div>
          {cycle ? (
            <Meta className="shrink-0 pb-0.5">
              {t("cycleLine", { year: cycle.year, phase: tPhase(cycle.phase) })}
            </Meta>
          ) : null}
        </div>

        {/* A standing rail, not four dashboard cards. The figures are context
            for the work below rather than four competing destinations. */}
        <dl className="grid grid-cols-2 border-b border-navy-900/12 md:grid-cols-4">
          <Link
            href="/entries"
            className="group border-e border-navy-900/10 py-5 pe-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 md:py-6"
          >
            <dt className="text-caption text-navy-600 group-hover:text-blue-700">
              {tStanding("entries")}
            </dt>
            <dd className="mt-1 font-data text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-navy-900">
              {entries.length}
            </dd>
          </Link>
          <Link
            href="/entries?state=shortlisted"
            className="group py-5 ps-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 md:border-e md:border-navy-900/10 md:px-5 md:py-6"
          >
            <dt className="text-caption text-navy-600 group-hover:text-blue-700">
              {tStanding("inVoting")}
            </dt>
            <dd className="mt-1 font-data text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-navy-900">
              {shortlisted.length}
            </dd>
          </Link>
          <Link
            href="/my-awards"
            className="group border-e border-t border-navy-900/10 py-5 pe-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 md:border-t-0 md:px-5 md:py-6"
          >
            <dt className="text-caption text-navy-600 group-hover:text-blue-700">
              {tStanding("awards")}
            </dt>
            <dd className="mt-1 font-data text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-gold-deep">
              {deliverables.length}
            </dd>
          </Link>
          <div className="border-t border-navy-900/10 py-5 ps-5 md:border-t-0 md:py-6">
            <dt className="text-caption text-navy-600">{tStanding("discount")}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-data text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-navy-900">
                {earned ? `${earned.percentOff}%` : "0%"}
              </span>
              <span className="text-caption text-navy-600">
                {upcoming
                  ? `${upcoming.percentOff}% ${t("atEntry", { n: upcoming.fromSubmissionNumber })}`
                  : t("maxReached")}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-5">
        {entries.length === 0 ? (
          <AccountEmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={
              <Link href="/entries/new" className={accountAction.primary}>
                {t("newEntry")}
              </Link>
            }
          />
        ) : (
          <AccountStack className="gap-7">
            {/* The desk's signature: one dark field reserved for the next
                decision. The rest of the account never competes with it. */}
            <section className="relative overflow-hidden bg-navy-950 text-cream-50">
              <span
                aria-hidden
                className="absolute start-0 top-0 h-1 w-24 bg-blue-700 after:absolute after:start-full after:top-0 after:h-1 after:w-8 after:bg-campaign-yellow"
              />
              <div className={cn("border-b border-cream-50/15 py-5", PANEL_X)}>
                <h2 className="font-display text-account-section text-cream-50">
                  {t("attentionTitle")}
                </h2>
              </div>
              <div className={cn("py-7 sm:py-8", PANEL_X)}>
                <Obligations actions={actions} entries={entries} subCategories={subCategories} />
              </div>
            </section>

            {/* One portfolio, not two galleries that repeat the same work. */}
            {portfolioEntries.length ? (
              <AccountPanel
                title={t("portfolioTitle")}
                lead={t("portfolioLead")}
                action={
                  <Link href="/entries" className={accountAction.quiet}>
                    {t("viewPortfolio")}
                  </Link>
                }
                padded={false}
              >
                <ul className="grid gap-px border-t border-navy-900/10 bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolioEntries.map((entry) => {
                    const award = awardByEntry.get(entry.id);
                    return (
                      <li key={entry.id} className="min-w-0 bg-white">
                        <Link
                          href={`/projects/${entry.slug}`}
                          className={cn(
                            "group flex h-full flex-col p-4 transition-colors hover:bg-mist/55 sm:p-5",
                            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                          )}
                        >
                          <span className="relative block overflow-hidden">
                            <EntryCover
                              entry={entry}
                              parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                              className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none"
                              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                            />
                            {award ? (
                              <AwardMark
                                level={award.level}
                                year={award.cycleYear}
                                size="xs"
                                className="absolute end-2 top-0"
                              />
                            ) : null}
                          </span>
                          <span className="mt-4 flex items-baseline justify-between gap-4">
                            <span className="min-w-0 font-display text-account-card text-navy-900 transition-colors group-hover:text-blue-700">
                              {entry.title}
                            </span>
                            <Figure size="sm" className="shrink-0 text-navy-500">
                              {entry.id}
                            </Figure>
                          </span>
                          <span className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                            <EntryStatus state={entry.state} />
                            <span className="min-w-0 truncate text-caption text-navy-600">
                              {subById.get(entry.baseSubCategoryId)?.name[locale]}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccountPanel>
            ) : null}

            {/* ---- the account's own facts ------------------------------- */}
            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              {/* Where every entry stands. A breakdown, and a way into the
                  filtered list — but not a headline: the headline is above. */}
              <AccountPanel title={t("indexTitle")} titleAs="h3" padded={false}>
                <ul className="flex flex-col">
                  {totals.map((row) => (
                    <li key={row.state} className="border-b border-navy-900/8 last:border-b-0">
                      <Link
                        href={`/entries?state=${row.state}`}
                        className={cn(
                          "flex items-center gap-5 py-3 transition-colors hover:bg-mist/60",
                          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                          PANEL_X,
                        )}
                      >
                        <EntryStatus state={row.state} className="min-w-0 flex-1" />
                        <Figure className="text-body-sm text-navy-900">{row.count}</Figure>
                        <Meta className="w-14 text-end">
                          {t("ofEntries", { total: entries.length })}
                        </Meta>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div
                  className={cn(
                    "flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-navy-900/10 py-4",
                    PANEL_X,
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <Meta>{t("submissionsThisCycle")}</Meta>
                    <Figure className="text-body-sm text-navy-900">{submittedThisCycle}</Figure>
                  </span>
                  <span className="flex items-baseline gap-2">
                    <Meta>{t("lifetime")}</Meta>
                    <Figure className="text-body-sm text-navy-900">
                      {participant.lifetimeSubmissions}
                    </Figure>
                  </span>
                </div>
              </AccountPanel>

              {/* ---- recent activity ------------------------------------- */}
              <AccountPanel
                title={t("activityTitle")}
                titleAs="h3"
                action={
                  <Link href="/billing" className={accountAction.quiet}>
                    {t("viewAll")}
                  </Link>
                }
                padded={recent.length === 0}
              >
                {recent.length === 0 ? (
                  <p className="text-body-sm text-navy-600">{t("activityEmpty")}</p>
                ) : (
                <ul className="flex flex-col">
                  {recent.map((payment) => (
                    <li
                      key={payment.id}
                      className={cn(
                        "flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-navy-900/8 py-3.5 last:border-b-0",
                        PANEL_X,
                      )}
                    >
                      <Figure size="sm" className="w-24 shrink-0 text-navy-600">
                        {payment.id}
                      </Figure>
                      <span className="min-w-[12rem] flex-1 truncate text-body-sm text-navy-900">
                        {titleOf.get(payment.entryId) ?? payment.entryId}
                      </span>
                      <Meta className="w-28 shrink-0">
                        {format.dateTime(new Date(payment.createdAt), { dateStyle: "medium" })}
                      </Meta>
                      <Meta className="w-24 shrink-0">{tStatus(payment.status)}</Meta>
                      <Figure className="w-24 shrink-0 text-end text-body-sm text-navy-900">
                        ${payment.amountUsd.toLocaleString("en-US")}
                      </Figure>
                    </li>
                  ))}
                </ul>
                )}
              </AccountPanel>
            </div>
          </AccountStack>
        )}
      </div>
    </AccountShell>
  );
}
