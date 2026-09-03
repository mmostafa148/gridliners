import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { EntryTable } from "@/components/account/entry-table";
import {
  AccountEmptyState,
  AccountPanel,
  AccountStack,
  Meta,
  accountAction,
} from "@/components/account/system";
import { EntryPagination, entriesHref } from "@/components/account/entry-filters";
import { EntryStatus } from "@/components/account/entry-status";
import { FilterBar } from "@/components/account/filter-bar";
import { FilterMenu } from "@/components/account/filter-menu";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import type { EntryState } from "@/lib/api/types";
import { ENTRY_STATES } from "@/lib/api/types";
import { requireParticipant } from "@/lib/auth/guard";

const PAGE_SIZE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "entries" });
  return { title: t("title") };
}

/**
 * 2.3 — the body of work, by awards calendar.
 *
 * **Grouped, not merely filterable.** The sitemap's node is *"List of
 * submitted Projects by Awards Calendar"*, and §51 recorded that the build had
 * turned an organising principle into a filter chip. The page now carries a
 * heading per cycle and the entries under it. A calendar is the page's
 * structure, not a filter beside State, so it is never reduced to a chip.
 *
 * **The project image leads each record**, again from the sitemap: Project
 * Image, Project Title, Entry-ID, one CTA. State remains prominent in its own
 * readable column on desktop and beside the work on phone.
 *
 * Paging, URL state and the per-state action rules are unchanged.
 */
export default async function EntriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tState] = await Promise.all([
    getTranslations("entries"),
    getTranslations("entryState"),
  ]);

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  /** A checkbox group arrives as a repeated parameter, or as one value. */
  const many = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

  // A menu's own Clear submits `clear-<name>=1`, so the parameter it owns is
  // dropped while everything else on the form is kept.
  const states = one(sp["clear-state"])
    ? []
    : (many(sp.state).filter((v) =>
        (ENTRY_STATES as readonly string[]).includes(v),
      ) as EntryState[]);
  const query = one(sp.query)?.trim() || undefined;
  const asked = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(asked) && asked > 0 ? asked : 1;

  const [all, cycles, subCategories] = await Promise.all([
    api.entries.list({ participantId: participant.id }),
    api.cycles.list(),
    api.taxonomy.subCategories(),
  ]);

  const current = { states, query, page };

  const listing = await api.entries.page({
    participantId: participant.id,
    states: states.length ? states : undefined,
    search: query,
    page,
    pageSize: PAGE_SIZE,
  });

  const cycleYear = new Map(cycles.map((c) => [c.id, c.year]));
  const payments = await api.payments.forParticipant(participant.id);
  const paidFor = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "paid") continue;
    paidFor.set(p.entryId, (paidFor.get(p.entryId) ?? 0) + p.amountUsd);
  }

  // Which entries have a published result, so the row can offer "View results"
  // rather than "View entry". Read through the published boundary only.
  const finalized = new Set<string>();
  for (const c of cycles) {
    for (const row of await api.results.published(c.id)) {
      if (!row.withheld && row.level !== "did_not_place") finalized.add(row.entryId);
    }
  }

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      {/* The page names itself. The shell carries the account, not the page. */}
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        {all.length === 0 ? (
          <AccountEmptyState
            title={t("noneTitle")}
            body={t("noneBody")}
            action={
              <Link href="/entries/new" className={accountAction.primary}>
                {t("newEntry")}
              </Link>
            }
          />
        ) : (
          <AccountStack>
            {/* The calendar is the structure below. Search and State only
                narrow the records inside those calendar sections. */}
            <div className="border-y border-navy-900/12 py-4">
              <FilterBar
                action="/entries"
                placeholder={t("searchPlaceholder")}
                query={query ?? ""}
                hasAny={Boolean(query) || states.length > 0}
                clearAllHref={`/${locale}/entries`}
              >
                <FilterMenu
                  name="state"
                  label={t("filterState")}
                  selected={states}
                  options={ENTRY_STATES.filter((state) =>
                    all.some((e) => e.state === state),
                  ).map((state) => ({
                    value: state,
                    label: tState(state),
                    mark: <EntryStatus state={state} markOnly />,
                  }))}
                />
              </FilterBar>
            </div>

            {listing.items.length === 0 ? (
              <AccountPanel>
                <AccountEmptyState
                  title={t("emptyTitle")}
                  body={t("emptyBody")}
                  action={
                    <Link href={entriesHref({})} className={accountAction.secondary}>
                      {t("clear")}
                    </Link>
                  }
                />
              </AccountPanel>
            ) : (
              /* One panel per awards calendar, newest first. The grouping the
                 sitemap asks for is now a real boundary, not a heading. */
              [...new Set(listing.items.map((e) => e.cycleId))]
                .sort((a, b) => (cycleYear.get(b) ?? 0) - (cycleYear.get(a) ?? 0))
                .map((id) => {
                  const inYear = listing.items.filter((e) => e.cycleId === id);
                  const year = cycleYear.get(id) ?? "";
                  return (
                    <section key={id} className="border border-navy-900/10 bg-white">
                      <header className="grid border-b border-navy-900/10 md:grid-cols-[13rem_1fr]">
                        <div className="relative bg-navy-950 px-5 py-5 text-cream-50 sm:px-7 md:py-6">
                          <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
                            <span className="basis-[72%] bg-blue-700" />
                            <span className="basis-[14%] bg-gold" />
                          </span>
                          <h2>
                            <span className="block text-overline font-semibold uppercase tracking-[0.12em] text-cream-200/75">
                              {t("calendarEyebrow")}
                            </span>
                            <span className="mt-1 block font-data text-[2.75rem] leading-none tabular-nums">
                              {year}
                            </span>
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5 sm:px-7 md:py-6">
                          <div>
                            <p className="font-display text-account-card font-semibold text-navy-950">
                              {t("registerTitle")}
                            </p>
                            <p className="mt-1 max-w-[54ch] text-body-sm text-navy-600">
                              {t("registerLead")}
                            </p>
                          </div>
                          <Meta>
                            {inYear.length === 1
                              ? t("inCalendarOne")
                              : t("inCalendar", { count: inYear.length })}
                          </Meta>
                        </div>
                      </header>
                      <EntryTable
                        entries={inYear}
                        subCategories={subCategories}
                        paidFor={paidFor}
                        finalized={finalized}
                        locale={locale}
                      />
                    </section>
                  );
                })
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-body-sm text-navy-600" aria-live="polite">
                {listing.total === 1 ? t("resultsOne") : t("results", { count: listing.total })}
              </p>
              <EntryPagination page={listing.page} pages={listing.pages} current={current} />
            </div>
          </AccountStack>
        )}
      </div>
    </AccountShell>
  );
}
