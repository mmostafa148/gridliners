import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { EntryCover } from "@/components/account/entry-cover";
import {
  AccountEmptyState,
  AccountStack,
  Eyebrow,
  Figure,
  ItemTitle,
  Meta,
  accountAction,
  accountStep,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "votes" });
  return { title: t("title") };
}

/**
 * 2.10 — what this account has voted for.
 *
 * **Read-only, and deliberately narrow.** The vote record carries an email
 * hash, an IP hash, an OTP timestamp and a fraud flag; none of those is this
 * participant's business and none of them reaches this page. What is shown is
 * the project, who entered it, its category and when the vote was cast.
 *
 * **Matched on the address, not on the account.** A vote is cast with an email
 * during public voting and is never tied to an account, so this looks up the
 * signed-in address against the same normalized hash the dedup rule uses. Votes
 * cast from a different address genuinely cannot be found, and the note says so
 * rather than leaving somebody to wonder where they went.
 */
export default async function MyVotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tPhase, format] = await Promise.all([
    getTranslations("votes"),
    getTranslations("cyclePhase"),
    getFormatter(),
  ]);

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const asked = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(asked) && asked > 0 ? asked : 1;

  const [listing, cycle] = await Promise.all([
    api.votes.forEmail(participant.email, { page, pageSize: PAGE_SIZE }),
    api.cycles.getActive(),
  ]);

  // The projects voted for, resolved one by one. Only the public facts.
  const rows = await Promise.all(
    listing.items.map(async (vote) => {
      const entry = await api.entries.getById(vote.entryId);
      if (!entry) return null;
      const [maker, subCategories] = await Promise.all([
        api.participants.getById(entry.participantId),
        api.taxonomy.subCategories(),
      ]);
      const sub = subCategories.find((s) => s.id === entry.baseSubCategoryId);
      return {
        entry,
        parentId: sub?.parentId ?? "",
        voteId: vote.id,
        castAt: vote.otpVerifiedAt ?? vote.requestedAt,
        title: entry.title,
        slug: entry.slug,
        maker: maker?.name ?? "",
        category: sub?.name[locale] ?? "",
        // Only a shortlisted entry has a public page to link to.
        public: entry.state === "shortlisted",
      };
    }),
  );
  const votes = rows.filter((r): r is NonNullable<typeof r> => Boolean(r));

  const { base: step, on, off } = accountStep;

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <div className="border-b border-navy-900/12 pb-6">
          <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
          <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
        </div>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        <AccountStack className="gap-6">
          {/* The page's signature is a ballot receipt: the programme's dark
              ground carries the current cycle, while the two facts on the end
              keep the record useful without turning it into a KPI dashboard. */}
          <section
            aria-labelledby="vote-record-title"
            className="relative overflow-hidden bg-navy-950 text-cream-50"
          >
            <span
              aria-hidden
              className="absolute start-0 top-0 h-1 w-24 bg-blue-700 after:absolute after:start-full after:top-0 after:h-1 after:w-8 after:bg-campaign-yellow"
            />
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.78fr)]">
              <div className="px-6 py-8 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                <Eyebrow tone="onNavy">{t("ballotEyebrow", { year: cycle.year })}</Eyebrow>
                <h2
                  id="vote-record-title"
                  className="mt-3 max-w-[18ch] font-display text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.04] text-cream-50"
                >
                  {t("ballotTitle")}
                </h2>
                <p className="mt-3 max-w-[54ch] text-body-sm text-cream-200/80">
                  {t("ballotLead")}
                </p>
              </div>

              <dl className="grid grid-cols-2 border-t border-cream-50/15 lg:border-s lg:border-t-0">
                <div className="flex min-h-36 flex-col justify-end border-e border-cream-50/15 p-6 sm:p-8 lg:min-h-0">
                  <dt className="text-caption text-cream-200/65">{t("votesRecorded")}</dt>
                  <dd className="mt-2">
                    <Figure size="lg" className="text-[clamp(2.4rem,5vw,4.5rem)] leading-none text-cream-50">
                      {format.number(listing.total)}
                    </Figure>
                  </dd>
                </div>
                <div className="flex min-h-36 flex-col justify-between p-6 sm:p-8 lg:min-h-0">
                  <div>
                    <dt className="text-caption text-cream-200/65">{t("votingCloses")}</dt>
                    <dd className="mt-2 font-data text-body-md tabular-nums text-cream-50">
                      {format.dateTime(new Date(cycle.votingWindow.end), { dateStyle: "medium" })}
                    </dd>
                  </div>
                  <p className="mt-6 inline-flex items-center gap-2 text-caption text-cream-200/75">
                    <span aria-hidden className="size-1.5 bg-campaign-yellow" />
                    {tPhase(cycle.phase)}
                  </p>
                </div>
              </dl>
            </div>
          </section>

          {listing.total === 0 ? (
            <AccountEmptyState
              title={t("noneTitle")}
              body={t("noneBody")}
              action={
                <Link href={`/finalists/${cycle.year}`} className={accountAction.primary}>
                  {t("exploreProjects")}
                  <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
                </Link>
              }
            />
          ) : (
            <section aria-label={t("galleryLabel")}>
              <ul className="grid gap-5 xl:grid-cols-2">
                {votes.map((vote, index) => {
                  const cover = (
                    <EntryCover
                      entry={vote.entry}
                      parentId={vote.parentId}
                      priority={index < 2}
                      className="aspect-[16/10] w-full transition-transform duration-300 group-hover:scale-[1.018] motion-reduce:transition-none"
                      sizes="(max-width: 1280px) 92vw, 44vw"
                    />
                  );

                  return (
                    <li
                      key={vote.voteId}
                      className={cn(
                        "group flex min-w-0 flex-col border border-navy-900/10 bg-white",
                        "transition-colors duration-200 hover:border-navy-900/30 focus-within:border-blue-700/45",
                      )}
                    >
                      <div className="relative overflow-hidden border-b border-navy-900/10 bg-mist">
                        {vote.public ? (
                          <Link href={`/projects/${vote.slug}`} tabIndex={-1} aria-hidden>
                            {cover}
                          </Link>
                        ) : (
                          cover
                        )}
                        <span
                          aria-hidden
                          className="absolute bottom-0 start-0 h-1 w-20 bg-blue-700 after:absolute after:start-full after:top-0 after:h-1 after:w-7 after:bg-campaign-yellow"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <Meta className="block">{vote.category}</Meta>
                        {vote.public ? (
                          <Link
                            href={`/projects/${vote.slug}`}
                            className="mt-2 w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            <ItemTitle className="transition-colors hover:text-blue-700">
                              {vote.title}
                            </ItemTitle>
                          </Link>
                        ) : (
                          <ItemTitle className="mt-2">{vote.title}</ItemTitle>
                        )}

                        <dl className="mt-5 border-t border-navy-900/10 pt-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                            <dt className="text-caption text-navy-600">{t("entity")}</dt>
                            <dd className="text-body-sm font-medium text-navy-900">{vote.maker}</dd>
                          </div>
                        </dl>

                        <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="inline-flex items-center gap-2 text-caption text-navy-600">
                            <span className="inline-flex size-5 items-center justify-center bg-blue-700/8 text-blue-800">
                              <Check aria-hidden className="size-3.5" strokeWidth={2.2} />
                            </span>
                            {t("castAt")} {format.dateTime(new Date(vote.castAt), { dateStyle: "medium" })}
                          </p>
                          {vote.public ? (
                            <Link href={`/projects/${vote.slug}`} className={accountAction.secondary}>
                              {t("viewProject")}
                              <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {listing.pages > 1 ? (
            <nav aria-label={t("pagination")} className="flex flex-wrap items-center gap-4">
              <p className="text-body-sm text-navy-600">
                {t("pageOf", { page: listing.page, pages: listing.pages })}
              </p>
              <ul className="flex flex-wrap items-center gap-2">
                <li>
                  {listing.page > 1 ? (
                    <Link href={`/my-votes?page=${listing.page - 1}`} rel="prev" className={cn(step, off)}>
                      {t("previous")}
                    </Link>
                  ) : (
                    <span aria-disabled className={cn(step, accountStep.disabled)}>
                      {t("previous")}
                    </span>
                  )}
                </li>
                {Array.from({ length: listing.pages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <Link
                      href={n === 1 ? "/my-votes" : `/my-votes?page=${n}`}
                      aria-current={n === listing.page ? "page" : undefined}
                      aria-label={t("page", { page: n })}
                      className={cn(step, n === listing.page ? on : off)}
                    >
                      {n}
                    </Link>
                  </li>
                ))}
                <li>
                  {listing.page < listing.pages ? (
                    <Link href={`/my-votes?page=${listing.page + 1}`} rel="next" className={cn(step, off)}>
                      {t("next")}
                    </Link>
                  ) : (
                    <span aria-disabled className={cn(step, accountStep.disabled)}>
                      {t("next")}
                    </span>
                  )}
                </li>
              </ul>
            </nav>
          ) : null}
        </AccountStack>
      </div>
    </AccountShell>
  );
}
