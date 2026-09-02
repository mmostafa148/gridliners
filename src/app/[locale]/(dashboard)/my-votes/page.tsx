import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { EntryCover } from "@/components/account/entry-cover";
import {
  AccountEmptyState,
  AccountPanel,
  AccountStack,
  CountPill,
  ItemTitle,
  Meta,
  StatusChip,
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

  const [t, format] = await Promise.all([getTranslations("votes"), getFormatter()]);

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const asked = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(asked) && asked > 0 ? asked : 1;

  const listing = await api.votes.forEmail(participant.email, { page, pageSize: PAGE_SIZE });

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
      {/* The page names itself once. The count is a fact about the list, not
          a headline. */}
      <div className="account-shell pt-7 md:pt-9">
        {/* The total sits beside the title it totals, not floated to the far
            end of a panel header where it reads as an orphan. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
          {listing.total ? (
            <CountPill>
              {listing.total === 1 ? t("resultsOne") : t("results", { count: listing.total })}
            </CountPill>
          ) : null}
        </div>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        <AccountStack>
          {listing.total === 0 ? (
            <AccountPanel>
              <AccountEmptyState title={t("noneTitle")} body={t("noneBody")} />
            </AccountPanel>
          ) : (
            /* No panel title: the page is already called My Votes, and a panel
               repeating its own page's h1 is chrome for its own sake. The count
               and the matching note lead the panel instead. */
            <AccountPanel>

              {/* Horizontal records, two across.
                  A four-column grid of 4:3 covers left two dead columns for an
                  account with two votes, and blew each cover up to ~470px —
                  the size at which a drawn stand-in stops looking like a work
                  and starts looking like an artboard. A square cover at 128px
                  is the size these read at, and a horizontal card fills the row
                  at any number of votes. */}
              <ul className="grid gap-4 xl:grid-cols-2">
                {votes.map((vote) => (
                  <li key={vote.voteId}>
                    <div
                      className={cn(
                        "flex h-full flex-col gap-4 border border-navy-900/10 bg-mist/40 p-4",
                        "sm:flex-row sm:gap-5",
                        "transition-colors hover:border-navy-900/25 hover:bg-white",
                      )}
                    >
                      {vote.public ? (
                        <Link
                          href={`/projects/${vote.slug}`}
                          tabIndex={-1}
                          aria-hidden
                          className="block w-full shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
                        >
                          <EntryCover
                            entry={vote.entry}
                            parentId={vote.parentId}
                            className="aspect-[3/2] w-full ring-1 ring-navy-900/10 sm:aspect-square sm:size-32"
                            sizes="(max-width: 640px) 100vw, 128px"
                          />
                        </Link>
                      ) : (
                        <EntryCover
                          entry={vote.entry}
                          parentId={vote.parentId}
                          className="aspect-[3/2] w-full shrink-0 ring-1 ring-navy-900/10 sm:aspect-square sm:size-32"
                          sizes="(max-width: 640px) 100vw, 128px"
                        />
                      )}

                      <div className="flex min-w-0 flex-1 flex-col">
                        {vote.public ? (
                          <Link
                            href={`/projects/${vote.slug}`}
                            className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            <ItemTitle className="transition-colors hover:text-blue-700">
                              {vote.title}
                            </ItemTitle>
                          </Link>
                        ) : (
                          <ItemTitle>{vote.title}</ItemTitle>
                        )}
                        <p className="mt-1 truncate text-body-sm text-navy-700">{vote.maker}</p>
                        <Meta className="mt-0.5 block truncate">{vote.category}</Meta>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4">
                          <StatusChip
                            tone="good"
                            className="min-w-0 whitespace-normal"
                            label={`${t("castAt")} ${format.dateTime(new Date(vote.castAt), {
                              dateStyle: "medium",
                            })}`}
                          />
                          {vote.public ? (
                            <Link
                              href={`/projects/${vote.slug}`}
                              className={cn(accountAction.quiet, "gap-1.5")}
                            >
                              {t("viewProject")}
                              <ExternalLink aria-hidden className="size-3.5" />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </AccountPanel>
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
