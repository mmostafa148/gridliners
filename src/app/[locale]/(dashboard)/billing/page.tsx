import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { AccountStatCards } from "@/components/account/account-stat-cards";
import { CreditTable } from "@/components/account/credit-table";
import { FilterBar } from "@/components/account/filter-bar";
import { FilterMenu } from "@/components/account/filter-menu";
import { PaymentTable } from "@/components/account/payment-table";
import {
  AccountEmptyState,
  AccountPanel,
  AccountStack,
  PANEL_X,
  Meta,
  accountAction,
  accountStep,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import type { PaymentKind, PaymentStatus } from "@/lib/api/types";
import { requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATUSES: PaymentStatus[] = ["paid", "pending", "expired", "refunded", "failed"];
const KINDS: PaymentKind[] = ["entry_fee", "tier_supplement"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "billing" });
  return { title: t("title") };
}

/**
 * The listing's URL, rebuilt.
 *
 * Repeated parameters for the multi-selects — `?status=paid&status=pending` —
 * which is what a checkbox group posts and what the page reads back.
 */
function billingHref(q: {
  statuses?: string[];
  kinds?: string[];
  query?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  for (const status of q.statuses ?? []) params.append("status", status);
  for (const kind of q.kinds ?? []) params.append("kind", kind);
  if (q.query) params.set("query", q.query);
  if (q.page && q.page > 1) params.set("page", String(q.page));
  const qs = params.toString();
  return qs ? `/billing?${qs}` : "/billing";
}

/**
 * 2.9 — the financial record.
 *
 * **Direction C contributes its typography and its identity here, and nothing
 * else.** The sitemap specifies a payments list with named columns, and
 * comparable numbers are compared down a column; decorative bands would make
 * that harder, so `PaymentTable` is a real table on desktop and a labelled
 * block per payment below `lg`. The account's own totals sit above it, which
 * is the one thing the identity direction genuinely adds: a participant should
 * see what they have spent before they read the rows.
 *
 * **Every payment carries the quote it was made against**, expandable in place.
 * That is the whole point of a frozen snapshot: a participant can see that the
 * $425 they paid in 2025 was $500 less a 15% loyalty discount, whatever the
 * pricing config says today.
 *
 * Credits sit under the payments rather than beside them: a credit is not a
 * payment, it is what a downgrade produced, and it is spent on a later entry.
 */
export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tStatus, tKind] = await Promise.all([
    getTranslations("billing"),
    getTranslations("paymentStatus"),
    getTranslations("paymentKind"),
  ]);

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  /** A checkbox group arrives as a repeated parameter, or as one value. */
  const many = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

  // A menu's own Clear submits `clear-<name>=1`, so the parameter it owns is
  // dropped while everything else on the form is kept.
  const statuses = one(sp["clear-status"])
    ? []
    : (many(sp.status).filter((v) => STATUSES.includes(v as PaymentStatus)) as PaymentStatus[]);
  const kinds = one(sp["clear-kind"])
    ? []
    : (many(sp.kind).filter((v) => KINDS.includes(v as PaymentKind)) as PaymentKind[]);
  const query = one(sp.query)?.trim() || undefined;
  const asked = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(asked) && asked > 0 ? asked : 1;
  const current = { statuses, kinds, query, page };

  const [listing, all, entries, credits, cycles] = await Promise.all([
    api.payments.page({
      participantId: participant.id,
      statuses: statuses.length ? statuses : undefined,
      kinds: kinds.length ? kinds : undefined,
      search: query,
      page,
      pageSize: PAGE_SIZE,
    }),
    api.payments.forParticipant(participant.id),
    api.entries.list({ participantId: participant.id }),
    api.pricing.allCreditsForParticipant(participant.id),
    api.cycles.list(),
  ]);

  const titleOf = new Map(entries.map((e) => [e.id, e.title]));
  const yearOf = new Map(cycles.map((c) => [c.id, c.year]));
  const { base: step, on, off } = accountStep;

  // What the account has actually spent, and what it still holds. The page used
  // to open on a filter bar; a financial record should open on its totals.
  const totalPaid = all
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountUsd, 0);
  const openCredit = credits
    .filter((c) => !c.redeemedAt)
    .reduce((sum, c) => sum + c.amountUsd, 0);

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        <AccountStack>
          {/* What the account amounts to financially, before the rows.
              The same stat cards Overview uses: three figures crammed into the
              start edge of a full-width panel left two thirds of it empty and
              made $750 look like a headline beside a 16px "7". */}
          {all.length ? (
            <AccountStatCards
              stats={[
                {
                  key: "paid",
                  label: t("totalPaid"),
                  value: `$${totalPaid.toLocaleString("en-US")}`,
                  href: billingHref({ statuses: ["paid"] }),
                },
                {
                  key: "payments",
                  label: t("paymentsCount"),
                  value: String(all.length),
                },
                {
                  key: "credits",
                  label: t("creditsAvailable"),
                  value: `$${openCredit.toLocaleString("en-US")}`,
                  hint: credits.length ? t("creditsHint", { n: credits.length }) : undefined,
                  href: "#account-credits",
                },
              ]}
            />
          ) : null}

          {all.length === 0 ? (
            <AccountEmptyState title={t("noneTitle")} body={t("noneBody")} />
          ) : (
            <>
              {/* Search and both filters on one line. Each clears itself. */}
              <AccountPanel>
                <FilterBar
                  action="/billing"
                  placeholder={t("searchPlaceholder")}
                  query={query ?? ""}
                  hasAny={Boolean(query) || statuses.length > 0 || kinds.length > 0}
                  clearAllHref={`/${locale}/billing`}
                >
                  <FilterMenu
                    name="status"
                    label={t("filterStatus")}
                    selected={statuses}
                    options={STATUSES.map((s) => ({ value: s, label: tStatus(s) }))}
                  />
                  <FilterMenu
                    name="kind"
                    label={t("filterKind")}
                    selected={kinds}
                    options={KINDS.map((k) => ({ value: k, label: tKind(k) }))}
                  />
                </FilterBar>
              </AccountPanel>

              <AccountPanel
                title={t("tableLabel")}
                lead={t("snapshotNote")}
                action={
                  <Meta aria-live="polite">
                    {listing.total === 1 ? t("resultsOne") : t("results", { count: listing.total })}
                  </Meta>
                }
                padded={listing.items.length === 0}
              >
                {listing.items.length === 0 ? (
                  <AccountEmptyState
                    title={t("emptyTitle")}
                    body={t("emptyBody")}
                    action={
                      <Link href={billingHref({})} className={accountAction.secondary}>
                        {t("clear")}
                      </Link>
                    }
                  />
                ) : (
                  <PaymentTable payments={listing.items} titleOf={titleOf} locale={locale} />
                )}
              </AccountPanel>

              {listing.pages > 1 ? (
                <nav
                  aria-label={t("pagination")}
                  className="flex flex-wrap items-center gap-4"
                >
                  <p className="text-body-sm text-navy-600">
                    {t("pageOf", { page: listing.page, pages: listing.pages })}
                  </p>
                  <ul className="flex flex-wrap items-center gap-2">
                    <li>
                      {listing.page > 1 ? (
                        <Link
                          href={billingHref({ ...current, page: listing.page - 1 })}
                          rel="prev"
                          className={cn(step, off)}
                        >
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
                          href={billingHref({ ...current, page: n })}
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
                        <Link
                          href={billingHref({ ...current, page: listing.page + 1 })}
                          rel="next"
                          className={cn(step, off)}
                        >
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
            </>
          )}

          {/* Credits: not payments, and not shown as if they were. */}
          <AccountPanel id="account-credits" title={t("creditsTitle")} padded={false}>
            {credits.length ? (
              <CreditTable credits={credits} titleOf={titleOf} yearOf={yearOf} />
            ) : (
              <p className={cn("py-6 text-body-sm text-navy-600", PANEL_X)}>{t("noCredits")}</p>
            )}
          </AccountPanel>
        </AccountStack>
      </div>
    </AccountShell>
  );
}
