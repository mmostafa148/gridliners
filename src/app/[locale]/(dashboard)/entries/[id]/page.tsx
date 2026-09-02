import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { CopyLink } from "@/components/account/copy-link";
import { AccountShell } from "@/components/account/account-shell";
import { Money } from "@/components/account/docket";
import { EntryCover } from "@/components/account/entry-cover";
import { EntryStatus } from "@/components/account/entry-status";
import {
  AccountDataList,
  AccountDatum,
  AccountPanel,
  AccountStack,
  Eyebrow,
  Figure,
  ItemTitle,
  Meta,
  accountAction,
  accountRow,
} from "@/components/account/system";
import { EntryTimeline } from "@/components/account/entry-timeline";
import { MedalBadge } from "@/components/shared/medal-badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { effectiveTier } from "@/lib/api/types";
import { discardDraftAction, settleUpgradeAction } from "@/lib/account/entry-actions-server";
import { requireOwnEntry, requireParticipant } from "@/lib/auth/guard";
import { countryName } from "@/lib/display-names";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const { participant } = await requireParticipant();
  const entry = await api.entries.getById(id);
  if (!entry || entry.participantId !== participant.id) return { title: id };
  void locale;
  return { title: entry.title };
}

/**
 * 2.6 — one entry, and everything true about it.
 *
 * **The state drives the page, not a tab bar.** Nine states and three
 * settlement outcomes could have been a set of tabs; instead the page always
 * carries the same four panels — the record, the assets, the timeline, the
 * payments — and adds exactly the modules this entry's state calls for, at the
 * top, where the thing that needs doing belongs.
 *
 * **Declared and verified tier are both shown, always.** A verification that
 * overwrote the declaration would erase the fact a correction happened, and
 * the correction is the participant's evidence for what they were charged.
 */
export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();
  // Somebody else's id is a 404, not a 403: a "not yours" page confirms it exists.
  const entry = await requireOwnEntry(id, participant.id);

  const [t, tTier, tStatus, tKind, format] = await Promise.all([
    getTranslations("entry"),
    getTranslations("tier"),
    getTranslations("paymentStatus"),
    getTranslations("paymentKind"),
    getFormatter(),
  ]);

  const [cycle, payments, subCategories, parents, published, credits] = await Promise.all([
    api.cycles.getById(entry.cycleId),
    api.payments.forEntry(entry.id),
    api.taxonomy.subCategories(),
    api.taxonomy.parentCategories(),
    api.results.published(entry.cycleId),
    api.pricing.allCreditsForParticipant(participant.id),
  ]);

  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const parentById = new Map(parents.map((p) => [p.id, p]));
  const groups = [entry.baseSubCategoryId, ...entry.additionalSubCategoryIds]
    .map((sid) => subById.get(sid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const tier = effectiveTier(entry);
  const correction = entry.verification?.corrections?.at(-1) ?? null;
  const settlement = entry.verification?.settlement ?? null;
  const cash = payments.find((p) => p.method === "cash" && p.status === "pending");
  const myResults = published.filter(
    (r) => r.entryId === entry.id && !r.withheld && r.level !== "did_not_place",
  );
  const votes = entry.state === "shortlisted" ? await api.votes.countForEntry(entry.id) : 0;
  const credit = settlement?.kind === "credit"
    ? credits.find((c) => c.code === settlement.creditCode)
    : undefined;

  const date = (v: string) => format.dateTime(new Date(v), { dateStyle: "medium" });
  const dateTime = (v: string) =>
    format.dateTime(new Date(v), { dateStyle: "medium", timeStyle: "short" });

  /**
   * A block at the head of the page: something this state needs said.
   *
   * **A named block on a ground, not a bordered white box.** §49 rejected the
   * repeated card; what survives is the one thing a coloured edge is genuinely
   * for - marking which of these is urgent - carried on a single start edge
   * rather than on four sides.
   */
  const stateBlock = (
    tone: "urgent" | "good" | "quiet",
    title: string,
    body: React.ReactNode,
  ) => (
    <section
      className={cn(
        "border-s-2 ps-5",
        tone === "urgent" && "border-campaign-orange",
        tone === "good" && "border-blue-700",
        tone === "quiet" && "border-navy-900/25",
      )}
    >
      <ItemTitle className={cn("mb-2", tone === "urgent" && "text-destructive-ink")}>{title}</ItemTitle>
      {body}
    </section>
  );

  const modules = [
    entry.state === "draft"
      ? stateBlock(
          "quiet",
          t("draftTitle"),
          <>
            <p className="max-w-[58ch] text-body-md text-navy-700">{t("draftBody")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/entries/${entry.id}/edit`} className={accountAction.primary}>
                {t("continueEditing")}
              </Link>
              <form action={discardDraftAction}>
                <input type="hidden" name="entryId" value={entry.id} />
                <button type="submit" className={accountAction.quiet}>
                  {t("discard")}
                </button>
              </form>
            </div>
          </>,
        )
      : null,

    cash
      ? stateBlock(
          "urgent",
          t("cashTitle"),
          <>
            <p className="max-w-[58ch] text-body-md text-navy-700">{t("cashBody")}</p>
            <AccountDataList className="mt-6" columns={3}>
              <AccountDatum label={t("cashRef")} figure>
                {cash.invoiceNumber}
              </AccountDatum>
              <AccountDatum label={t("cashAmount")} figure>
                <Money amount={cash.amountUsd} />
              </AccountDatum>
              <AccountDatum label={t("cashExpires")} figure>
                {cash.expiresAt ? dateTime(cash.expiresAt) : t("none")}
              </AccountDatum>
            </AccountDataList>
            <Meta className="mt-6 block">{t("mockNote")}</Meta>
          </>,
        )
      : null,

    settlement && settlement.kind === "payment_link" && settlement.status !== "settled"
      ? stateBlock(
          "urgent",
          t("settlementTitle"),
          <>
            <p className="max-w-[58ch] text-body-md text-navy-700">{t("upgradeBody")}</p>
            <AccountDataList className="mt-6" columns={2}>
              <AccountDatum label={t("upgradeAmount")} figure>
                <Money amount={settlement.amountUsd} />
              </AccountDatum>
              <AccountDatum label={t("upgradeDeadline")} figure>
                {dateTime(settlement.deadline)}
              </AccountDatum>
            </AccountDataList>
            {entry.state === "excluded" ? null : (
              <form action={settleUpgradeAction} className="mt-6">
                <input type="hidden" name="entryId" value={entry.id} />
                <button type="submit" className={accountAction.primary}>
                  {t("upgradePay")}
                </button>
              </form>
            )}
            <Meta className="mt-6 block">{t("mockNote")}</Meta>
          </>,
        )
      : null,

    settlement && settlement.kind === "credit"
      ? stateBlock(
          "good",
          t("settlementTitle"),
          <>
            <p className="max-w-[58ch] text-body-md text-navy-700">{t("downgradeBody")}</p>
            <AccountDataList className="mt-6" columns={3}>
              <AccountDatum label={t("downgradeAmount")} figure>
                <Money amount={settlement.amountUsd} />
              </AccountDatum>
              <AccountDatum label={t("downgradeCode")} figure>
                {settlement.creditCode}
              </AccountDatum>
              <AccountDatum label={t("downgradeCycle")} figure>
                {credit?.validForCycleId.replace("cycle-", "") ?? t("none")}
              </AccountDatum>
            </AccountDataList>
          </>,
        )
      : null,

    entry.state === "shortlisted"
      ? stateBlock(
          "good",
          t("shareTitle"),
          <>
            <p className="max-w-[58ch] text-body-md text-navy-700">{t("shareBody")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href={`/projects/${entry.slug}`} className={accountAction.primary}>
                {t("publicLink")}
                <ExternalLink aria-hidden className="size-4" />
              </Link>
              <CopyLink path={`/${locale}/projects/${entry.slug}`} />
              <span className="ms-auto flex flex-col gap-1">
                <Meta>{t("resVotes")}</Meta>
                <Figure size="md">{votes}</Figure>
              </span>
            </div>
          </>,
        )
      : null,

    (["excluded", "cancelled", "disqualified", "not_shortlisted"] as const).includes(
      entry.state as "excluded",
    )
      ? stateBlock(
          "quiet",
          t(`${entry.state === "not_shortlisted" ? "notShortlisted" : entry.state}Title`),
          <p className="max-w-[62ch] text-body-md text-navy-700">
            {t(`${entry.state === "not_shortlisted" ? "notShortlisted" : entry.state}Body`)}
          </p>,
        )
      : null,
  ].filter(Boolean);

  return (
    <AccountShell
      participantId={participant.id}
     
      locale={locale}
      action={
        <Link href="/entries" className={accountAction.secondary}>
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {t("back")}
        </Link>
      }
    >
      {/* ---- the subject. The work opens the page, at record scale: this is
             the entry's management screen, not its public page. ------------- */}
      <div className="account-shell pb-[var(--account-y)] pt-6">
      <AccountStack>
      <AccountPanel className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-7 sm:p-7">
        <EntryCover
          entry={entry}
          parentId={groups[0]?.parentId ?? ""}
          className="size-28 shrink-0 sm:size-32"
          sizes="128px"
          priority
        />

        <div className="min-w-0 flex-1">
          <Eyebrow tone="quiet">{cycle ? t("cycleEyebrow", { year: cycle.year }) : ""}</Eyebrow>
          <h1 className="mt-1.5 font-display text-account-title text-balance text-navy-900">
            {entry.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <EntryStatus state={entry.state} />
            <Meta>
              {t("entryId")} <span className="font-data text-navy-800">{entry.id}</span>
            </Meta>
            <Meta>
              {t("judgedTier")} <span className="text-navy-800">{tTier(tier)}</span>
            </Meta>
            {entry.declaredTier !== tier ? (
              <Meta>
                {t("declaredTier")}{" "}
                <span className="text-navy-800">{tTier(entry.declaredTier)}</span>
              </Meta>
            ) : null}
          </div>
        </div>
      </AccountPanel>

      {/* ---- what this entry needs, if anything -------------------------- */}
      {modules.length ? (
        <AccountPanel className="flex flex-col gap-7">{modules}</AccountPanel>
      ) : null}

      {/* ---- the record. The cover is above; this is what it says. ------- */}
      <AccountPanel title={t("recordTitle")}>
        <div className="grid gap-x-12 gap-y-9 lg:grid-cols-12">
          <div className="flex flex-col gap-7 lg:col-span-7">
            {/* The entrant's own words, in their own direction, inside a page
                that may be running the other way. */}
            <bdi
              lang={entry.contentLanguage}
              dir={entry.contentLanguage === "ar" ? "rtl" : "ltr"}
              className="block max-w-[62ch] whitespace-pre-line text-body-lg leading-relaxed text-navy-800"
            >
              {entry.description}
            </bdi>

            <AccountDataList columns={2}>
              <AccountDatum label={t("client")}>{entry.client ?? t("none")}</AccountDatum>
              <AccountDatum label={t("country")}>{countryName(entry.country, locale)}</AccountDatum>
              <AccountDatum label={t("language")}>
                {entry.contentLanguage.toUpperCase()}
              </AccountDatum>
              <AccountDatum label={t("credits")}>
                {entry.credits.length ? entry.credits.join(", ") : t("noCredits")}
              </AccountDatum>
              {entry.externalUrl ? (
                <AccountDatum label={t("projectUrl")}>
                  <a
                    href={entry.externalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    {entry.externalUrl}
                  </a>
                </AccountDatum>
              ) : null}
            </AccountDataList>
          </div>

          {/* The groups it stands in, and its assets: a supporting column
              rather than five empty ones. */}
          <div className="flex flex-col gap-10 lg:col-span-5">
            <div>
              <ItemTitle as="h3" className="mb-4">{t("groupsTitle")}</ItemTitle>
              <ul className="flex flex-col border-t-2 border-navy-900">
                {groups.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex flex-col gap-1 border-b border-navy-900/12 py-4"
                  >
                    <span className="text-body-md text-navy-900">{sub.name[locale]}</span>
                    <Meta>{parentById.get(sub.parentId)?.name[locale]}</Meta>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ItemTitle as="h3" className="mb-4">{t("assetsTitle")}</ItemTitle>
              <AccountDataList columns={2}>
                <AccountDatum label={t("cover")} figure>
                  {entry.media.coverUrl ? "1" : "0"}
                </AccountDatum>
                <AccountDatum label={t("gallery")} figure>
                  {String(entry.media.galleryUrls.length)}
                </AccountDatum>
                <AccountDatum label={t("documents")} figure>
                  {String(entry.media.documentUrls.length)}
                </AccountDatum>
                <AccountDatum label={t("video")} figure>
                  {entry.media.videoUrl ? "1" : "0"}
                </AccountDatum>
              </AccountDataList>
            </div>
          </div>
        </div>
      </AccountPanel>

      {/* ---- what this entry won ----------------------------------------- */}
      {myResults.length ? (
        <AccountPanel
          title={t("resultsTitle")}
          action={
            <Link href="/my-awards" className={accountAction.quiet}>
              {t("seeAwards")}
            </Link>
          }
        >
          <ul className="flex flex-col">
            {myResults.map((result) => {
              const sub = subById.get(result.subCategoryId);
              return (
                <li
                  key={result.id}
                  className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-navy-900/8 py-4 last:border-b-0"
                >
                  <MedalBadge level={result.level} />
                  <span className="min-w-0 flex-1">
                    <ItemTitle>{sub?.name[locale]}</ItemTitle>
                    <Meta>{tTier(result.tier)}</Meta>
                  </span>
                  <span className="flex flex-col gap-1">
                    <Meta>{t("resVotes")}</Meta>
                    <Figure size="md" className="text-navy-900">
                      {result.votes}
                    </Figure>
                  </span>
                  <span className="flex flex-col gap-1">
                    <Meta>{t("resRank")}</Meta>
                    <Figure size="md" className="text-navy-900">
                      {result.rank ?? t("none")}
                    </Figure>
                  </span>
                </li>
              );
            })}
          </ul>
        </AccountPanel>
      ) : null}

      {/* ---- the record of what happened ---------------------------------- */}
      <div className="grid gap-5 lg:grid-cols-2">
          <AccountPanel title={t("timelineTitle")}>
            <EntryTimeline entry={entry} cycle={cycle} results={myResults} locale={locale} />
            {correction ? (
              <div className="mt-9 border-t border-navy-900/12 pt-7">
                <ItemTitle className="mb-4">{t("correctionTitle")}</ItemTitle>
                <AccountDataList columns={3}>
                  <AccountDatum label={t("correctionFrom")}>{tTier(correction.from)}</AccountDatum>
                  <AccountDatum label={t("correctionTo")}>{tTier(correction.to)}</AccountDatum>
                  <AccountDatum label={t("correctionAt")} figure>
                    {date(correction.at)}
                  </AccountDatum>
                </AccountDataList>
                <p className="mt-6 max-w-[62ch] text-body-md text-navy-700">
                  <Meta className="me-1.5">{t("correctionNote")}</Meta>
                  {correction.note}
                </p>
              </div>
            ) : null}
          </AccountPanel>

          <AccountPanel
            title={t("paymentsTitle")}
            action={
              <Link href="/billing" className={accountAction.quiet}>
                {t("seeBilling")}
              </Link>
            }
          >
            {payments.length ? (
              <ul className="flex flex-col">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className={cn(
                      "flex flex-wrap items-baseline gap-x-6 gap-y-1.5 py-4",
                      accountRow,
                    )}
                  >
                    <span className="min-w-0 flex-1 text-body-md text-navy-900">
                      {tKind(payment.kind)}
                      <Meta className="ms-3">{tStatus(payment.status)}</Meta>
                    </span>
                    <Figure size="sm" className="text-navy-600">
                      {payment.id}
                    </Figure>
                    <Money amount={payment.amountUsd} className="text-navy-900" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-navy-600">{t("noPayments")}</p>
            )}
          </AccountPanel>
      </div>
      </AccountStack>
      </div>
    </AccountShell>
  );
}
