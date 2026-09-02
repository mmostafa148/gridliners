import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { AwardMark } from "@/components/account/award-mark";
import { EntryCover } from "@/components/account/entry-cover";
import { AccountStatCards } from "@/components/account/account-stat-cards";
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
 * 2.2 — the account's landing page, in Direction C.
 *
 * **Retuned 2026-09-01 from editorial to management weight.** The first pass
 * gave the account the website's devices — full-bleed navy and mist bands, a
 * 42px title, gallery-scale covers — and it read as a run of website sections
 * rather than a place to manage a profile. What changed: one surface instead of
 * four grounds, a 28px title, thumbnail-scale covers, and half the vertical
 * rhythm. Nothing was removed.
 *
 * **Identity establishes; work leads.** The masthead says whose account this
 * is and what it amounts to, and then the first functional thing on the page is
 * what needs doing — one section, not the three overlapping ones §51 rejected.
 *
 * Under it, the record: the work in public voting at gallery scale, what has
 * been awarded, and the account's own operational facts. That is the portfolio
 * reading — you, then your obligations, then your work.
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
  const voting = shortlisted.slice(0, 6);

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      {/* The masthead says whose account this is; the page still names itself,
          and it is the page that owns the h1. */}
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("leadNamed")}</p>

        {/* The four facts this page is opened for, on one row. The full state
            breakdown is further down, where a breakdown belongs. */}
        <AccountStatCards
          className="mt-6"
          stats={[
            {
              key: "entries",
              label: tStanding("entries"),
              value: String(entries.length),
              href: "/entries",
            },
            {
              key: "shortlisted",
              label: tStanding("inVoting"),
              value: String(shortlisted.length),
              href: "/entries?state=shortlisted",
            },
            {
              key: "awards",
              label: tStanding("awards"),
              value: String(deliverables.length),
              href: "/my-awards",
            },
            {
              key: "discount",
              label: tStanding("discount"),
              value: earned ? `${earned.percentOff}%` : "0%",
              hint: upcoming
                ? `${upcoming.percentOff}% ${t("atEntry", { n: upcoming.fromSubmissionNumber })}`
                : t("maxReached"),
            },
          ]}
        />
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
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
          <AccountStack>
            {/* ---- what needs doing. One panel, first. ------------------- */}
            <AccountPanel
              title={t("attentionTitle")}
              action={
                cycle ? (
                  <Meta>{t("cycleLine", { year: cycle.year, phase: tPhase(cycle.phase) })}</Meta>
                ) : null
              }
              padded={false}
            >
              <div className={cn("py-6", PANEL_X)}>
                <Obligations actions={actions} entries={entries} subCategories={subCategories} />
              </div>
            </AccountPanel>

            {/* ---- the work, and what it has won ------------------------- */}
            <div className="grid items-start gap-5 xl:grid-cols-2">
              {voting.length ? (
                <AccountPanel
                  title={t("recordTitle")}
                  lead={t("recordLead")}
                  action={
                    <Link href="/entries?state=shortlisted" className={accountAction.quiet}>
                      {t("shareAll")}
                    </Link>
                  }
                >
                  <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 xl:grid-cols-3">
                    {voting.map((entry) => (
                      <li key={entry.id} className="min-w-0">
                        <Link
                          href={`/projects/${entry.slug}`}
                          className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                        >
                          <EntryCover
                            entry={entry}
                            parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                            className="aspect-square w-full"
                            sizes="(max-width: 640px) 30vw, 15vw"
                          />
                          <span className="mt-2.5 block truncate text-body-sm font-medium text-navy-900">
                            {entry.title}
                          </span>
                        </Link>
                        <span className="mt-0.5 block truncate text-caption text-navy-600">
                          {subById.get(entry.baseSubCategoryId)?.name[locale]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccountPanel>
              ) : null}

              {deliverables.length ? (
                <AccountPanel
                  title={t("awardedTitle")}
                  action={
                    <Link href="/my-awards" className={accountAction.quiet}>
                      {t("viewAwards")}
                    </Link>
                  }
                >
                  <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 xl:grid-cols-3">
                    {deliverables.map((d) => {
                      const entry = entryById.get(d.entryId);
                      return (
                        <li key={d.resultId} className="min-w-0">
                          <span className="relative block">
                            {entry ? (
                              <EntryCover
                                entry={entry}
                                parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                                className="aspect-square w-full"
                                sizes="(max-width: 640px) 30vw, 15vw"
                              />
                            ) : null}
                            <AwardMark
                              level={d.level}
                              year={d.cycleYear}
                              size="xs"
                              className="absolute -top-1 end-1"
                            />
                          </span>
                          <span className="mt-2.5 block truncate text-body-sm font-medium text-navy-900">
                            {d.entryTitle}
                          </span>
                          <span className="mt-0.5 block truncate text-caption text-navy-600">
                            {d.group}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </AccountPanel>
              ) : null}
            </div>

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
