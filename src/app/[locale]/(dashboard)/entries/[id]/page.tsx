import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, FileText, ImageIcon, Images, Video } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Fragment } from "react";

import { CopyLink } from "@/components/account/copy-link";
import { AccountShell } from "@/components/account/account-shell";
import { CopyValue } from "@/components/account/copy-value";
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
  StatusChip,
  accountAction,
  accountRow,
} from "@/components/account/system";
import { EntryTimeline } from "@/components/account/entry-timeline";
import { MedalBadge } from "@/components/shared/medal-badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { effectiveTier, type PaymentStatus } from "@/lib/api/types";
import { discardDraftAction, settleUpgradeAction } from "@/lib/account/entry-actions-server";
import { requireOwnEntry, requireParticipant } from "@/lib/auth/guard";
import { countryName } from "@/lib/display-names";
import { cn } from "@/lib/utils";

const paymentTone: Record<
  PaymentStatus,
  "waiting" | "good" | "closed" | "adverse"
> = {
  pending: "waiting",
  paid: "good",
  expired: "closed",
  refunded: "closed",
  failed: "adverse",
};

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
  const assetCount =
    (entry.media.coverUrl ? 1 : 0) +
    entry.media.galleryUrls.length +
    entry.media.documentUrls.length +
    (entry.media.videoUrl ? 1 : 0);
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
   * Every state speaks through the same docket. Urgent work uses the dark
   * institutional ground; quieter states keep the same geometry on paper.
   * The repeated shape lets the content change without making the page feel
   * like a different product every time an entry advances.
   */
  const stateDocket = ({
    tone,
    eyebrow,
    title,
    body,
    actions,
    aside,
    note,
  }: {
    tone: "urgent" | "good" | "quiet";
    eyebrow: string;
    title: string;
    body: React.ReactNode;
    actions?: React.ReactNode;
    aside?: React.ReactNode;
    note?: React.ReactNode;
  }) => {
    const onNavy = tone === "urgent";

    return (
      <section
        className={cn(
          "relative overflow-hidden border",
          onNavy
            ? "border-navy-950 bg-navy-950 text-cream-50"
            : tone === "good"
              ? "border-blue-700/25 bg-white"
              : "border-navy-900/12 bg-white",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 start-0 w-1",
            tone === "urgent" && "bg-gold",
            tone === "good" && "bg-blue-700",
            tone === "quiet" && "bg-navy-400",
          )}
        />

        <div
          className={cn(
            "grid",
            aside && "lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]",
          )}
        >
          <div className="px-6 py-7 sm:px-8 lg:px-9 lg:py-8">
            <Eyebrow tone={onNavy ? "goldOnNavy" : tone === "good" ? "blue" : "quiet"}>
              {eyebrow}
            </Eyebrow>
            <h2
              className={cn(
                "mt-2 font-display text-account-section",
                onNavy ? "text-cream-50" : "text-navy-950",
              )}
            >
              {title}
            </h2>
            <div
              className={cn(
                "mt-2.5 max-w-[62ch] text-body-md leading-relaxed",
                onNavy ? "text-cream-200/85" : "text-navy-700",
              )}
            >
              {body}
            </div>
            {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>

          {aside ? (
            <aside
              className={cn(
                "border-t px-6 py-6 sm:px-8 lg:border-s lg:border-t-0 lg:px-8 lg:py-8",
                onNavy
                  ? "border-cream-100/15 bg-cream-50/[0.04]"
                  : "border-navy-900/10 bg-navy-50/65",
              )}
            >
              {aside}
            </aside>
          ) : null}
        </div>

        {note ? (
          <div
            className={cn(
              "border-t px-6 py-3.5 sm:px-8 lg:px-9",
              onNavy ? "border-cream-100/15" : "border-navy-900/10 bg-navy-50/45",
            )}
          >
            {note}
          </div>
        ) : null}
      </section>
    );
  };

  const cashPaymentPanel = cash
    ? stateDocket({
        tone: "urgent",
        eyebrow: t("paymentEyebrow"),
        title: t("cashTitle"),
        body: t("cashBody"),
        actions: (
          <>
            <CopyValue
              value={cash.invoiceNumber}
              label={t("copyReference")}
              copiedLabel={t("referenceCopied")}
            />
            <Link href="/billing" className={accountAction.onNavySecondary}>
              {t("seeBilling")}
            </Link>
          </>
        ),
        aside: (
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2 border-b border-cream-100/15 pb-5">
              <Eyebrow tone="onNavy">{t("cashAmount")}</Eyebrow>
              <Money
                amount={cash.amountUsd}
                className="mt-2 block font-data text-[clamp(2.75rem,5vw,4.25rem)] font-semibold leading-none text-gold"
              />
            </div>
            <div>
              <Meta className="block text-cream-200/65">{t("cashExpires")}</Meta>
              <Figure size="md" className="mt-1.5 block text-cream-50">
                {cash.expiresAt ? dateTime(cash.expiresAt) : t("none")}
              </Figure>
            </div>
            <div>
              <Meta className="block text-cream-200/65">{t("cashRef")}</Meta>
              <Figure size="md" className="mt-1.5 block text-cream-50">
                {cash.invoiceNumber}
              </Figure>
            </div>
          </div>
        ),
        note: <Meta className="block text-cream-200/65">{t("mockNote")}</Meta>,
      })
    : null;

  const modules = [
    entry.state === "draft"
      ? stateDocket({
          tone: "quiet",
          eyebrow: t("nextStep"),
          title: t("draftTitle"),
          body: t("draftBody"),
          actions: (
            <>
              <Link href={`/entries/${entry.id}/edit`} className={accountAction.primary}>
                {t("continueEditing")}
              </Link>
              <form action={discardDraftAction}>
                <input type="hidden" name="entryId" value={entry.id} />
                <button type="submit" className={accountAction.quiet}>
                  {t("discard")}
                </button>
              </form>
            </>
          ),
          aside: (
            <div className="flex h-full flex-col justify-center">
              <Meta>{t("assetsTitle")}</Meta>
              <Figure size="md" className="mt-2 text-navy-950">
                {t("assetSummary", { count: assetCount })}
              </Figure>
            </div>
          ),
        })
      : null,

    settlement && settlement.kind === "payment_link" && settlement.status !== "settled"
      ? stateDocket({
          tone: "urgent",
          eyebrow: t("paymentEyebrow"),
          title: t("settlementTitle"),
          body: t("upgradeBody"),
          actions:
            entry.state === "excluded" ? null : (
              <form action={settleUpgradeAction}>
                <input type="hidden" name="entryId" value={entry.id} />
                <button type="submit" className={accountAction.onNavy}>
                  {t("upgradePay")}
                </button>
              </form>
            ),
          aside: (
            <div className="grid gap-5">
              <div className="border-b border-cream-100/15 pb-5">
                <Eyebrow tone="onNavy">{t("upgradeAmount")}</Eyebrow>
                <Money
                  amount={settlement.amountUsd}
                  className="mt-2 block font-data text-[clamp(2.5rem,4.5vw,4rem)] font-semibold leading-none text-gold"
                />
              </div>
              <div>
                <Meta className="block text-cream-200/65">{t("upgradeDeadline")}</Meta>
                <Figure size="md" className="mt-1.5 block text-cream-50">
                  {dateTime(settlement.deadline)}
                </Figure>
              </div>
            </div>
          ),
          note: <Meta className="block text-cream-200/65">{t("mockNote")}</Meta>,
        })
      : null,

    settlement && settlement.kind === "credit"
      ? stateDocket({
          tone: "good",
          eyebrow: t("settlementComplete"),
          title: t("settlementTitle"),
          body: t("downgradeBody"),
          aside: (
            <AccountDataList columns={1}>
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
          ),
        })
      : null,

    entry.state === "shortlisted"
      ? stateDocket({
          tone: "good",
          eyebrow: t("publicProject"),
          title: t("shareTitle"),
          body: t("shareBody"),
          actions: (
            <>
              <Link href={`/projects/${entry.slug}`} className={accountAction.primary}>
                {t("publicLink")}
                <ExternalLink aria-hidden className="size-4" />
              </Link>
              <CopyLink path={`/${locale}/projects/${entry.slug}`} />
            </>
          ),
          aside: (
            <span className="flex flex-col gap-1">
              <Meta>{t("resVotes")}</Meta>
              <Figure size="lg" className="text-navy-950">{votes}</Figure>
            </span>
          ),
        })
      : null,

    (["excluded", "cancelled", "disqualified", "not_shortlisted"] as const).includes(
      entry.state as "excluded",
    )
      ? stateDocket({
          tone: "quiet",
          eyebrow: t("entryStatusEyebrow"),
          title: t(`${entry.state === "not_shortlisted" ? "notShortlisted" : entry.state}Title`),
          body: t(`${entry.state === "not_shortlisted" ? "notShortlisted" : entry.state}Body`),
        })
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
      {/* The entry reads as a project dossier, not a stretched table row. */}
      <div className="account-shell pb-[var(--account-y)] pt-6">
        <AccountStack>
          <AccountPanel padded={false} className="overflow-hidden">
            <div className="grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)]">
              <EntryCover
                entry={entry}
                parentId={groups[0]?.parentId ?? ""}
                className="aspect-[16/9] w-full md:aspect-auto md:h-full md:min-h-52"
                sizes="(min-width: 1024px) 272px, (min-width: 768px) 240px, 100vw"
                priority
              />

              <div className="relative flex min-w-0 flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-navy-950" />
                <div className="flex flex-1 flex-col justify-center">
                  <Eyebrow tone="quiet">
                    {cycle ? t("cycleEyebrow", { year: cycle.year }) : ""}
                  </Eyebrow>
                  <h1 className="mt-2 max-w-[24ch] text-balance font-display text-[clamp(1.75rem,2.5vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-navy-950">
                    {entry.title}
                  </h1>
                  <div className="mt-4">
                    <EntryStatus state={entry.state} />
                  </div>
                </div>

                <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-navy-900/10 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                  <AccountDatum label={t("entryId")} figure>{entry.id}</AccountDatum>
                  <AccountDatum label={t("judgedTier")}>{tTier(tier)}</AccountDatum>
                  {entry.declaredTier !== tier ? (
                    <AccountDatum label={t("declaredTier")}>{tTier(entry.declaredTier)}</AccountDatum>
                  ) : null}
                </dl>
              </div>
            </div>
          </AccountPanel>

          {/* A pending cash payment is the page's primary task, so it gets the
              strongest ground and the only oversized figure. */}
          {cashPaymentPanel}

          {/* ---- what this entry needs, if anything ---------------------- */}
          {modules.map((module, index) => (
            <Fragment key={`entry-state-${index}`}>{module}</Fragment>
          ))}

          {/* The record is deliberately compact: prose and facts on the page,
              classification and media on a supporting ground. */}
          <AccountPanel title={t("recordTitle")} padded={false}>
            <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
              <div className="px-5 py-6 sm:px-7 sm:py-7 lg:pe-10">
                <bdi
                  lang={entry.contentLanguage}
                  dir={entry.contentLanguage === "ar" ? "rtl" : "ltr"}
                  className="block max-w-[62ch] whitespace-pre-line text-body-lg leading-relaxed text-navy-800"
                >
                  {entry.description}
                </bdi>

                <AccountDataList className="mt-7 border-t border-navy-900/10 pt-6" columns={2}>
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

              <aside className="border-t border-navy-900/10 bg-navy-50/60 px-5 py-6 sm:px-7 sm:py-7 lg:border-s lg:border-t-0">
                <ItemTitle as="h3">{t("groupsTitle")}</ItemTitle>
                <ul className="mt-4 grid gap-2">
                  {groups.map((sub) => (
                    <li key={sub.id} className="border-s-2 border-blue-700 bg-white px-4 py-3">
                      <span className="block text-body-md font-medium text-navy-900">
                        {sub.name[locale]}
                      </span>
                      <Meta className="mt-0.5 block">{parentById.get(sub.parentId)?.name[locale]}</Meta>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-navy-900/10 pt-6">
                  <ItemTitle as="h3">{t("assetsTitle")}</ItemTitle>
                  <dl className="mt-4 grid grid-cols-2 gap-px bg-navy-900/10">
                    {[
                      { label: t("cover"), value: entry.media.coverUrl ? 1 : 0, Icon: ImageIcon },
                      { label: t("gallery"), value: entry.media.galleryUrls.length, Icon: Images },
                      { label: t("documents"), value: entry.media.documentUrls.length, Icon: FileText },
                      { label: t("video"), value: entry.media.videoUrl ? 1 : 0, Icon: Video },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="flex items-center gap-3 bg-white px-4 py-3.5">
                        <Icon aria-hidden className="size-4 shrink-0 text-blue-700" strokeWidth={1.75} />
                        <div className="min-w-0">
                          <dt className="text-caption text-navy-600">{label}</dt>
                          <dd className="mt-0.5 font-data text-body-md font-semibold tabular-nums text-navy-950">
                            {value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
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

          {/* A history reads in sequence. Payments follow it as a ledger strip,
              instead of forcing two sparse columns to pretend they are equal. */}
          <AccountPanel title={t("activityTitle")} lead={t("activityLead")} padded={false}>
            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <ItemTitle as="h3" className="mb-6">{t("timelineTitle")}</ItemTitle>
              <EntryTimeline
                entry={entry}
                cycle={cycle}
                results={myResults}
                locale={locale}
                layout="horizontal"
              />

              {correction ? (
                <div className="mt-7 border-t border-navy-900/12 pt-6">
                  <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
                    <ItemTitle>{t("correctionTitle")}</ItemTitle>
                    <div>
                      <AccountDataList columns={3}>
                        <AccountDatum label={t("correctionFrom")}>{tTier(correction.from)}</AccountDatum>
                        <AccountDatum label={t("correctionTo")}>{tTier(correction.to)}</AccountDatum>
                        <AccountDatum label={t("correctionAt")} figure>
                          {date(correction.at)}
                        </AccountDatum>
                      </AccountDataList>
                      <p className="mt-5 max-w-[72ch] text-body-md text-navy-700">
                        <Meta className="mb-1 block">{t("correctionNote")}</Meta>
                        {correction.note}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-navy-900/10 bg-navy-50/60 px-5 py-5 sm:px-7">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <ItemTitle as="h3">{t("paymentsTitle")}</ItemTitle>
                <Link href="/billing" className={accountAction.quiet}>
                  {t("seeBilling")}
                </Link>
              </div>

              {payments.length ? (
                <ul className="grid gap-x-10 lg:grid-cols-2">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className={cn(
                        "grid gap-3 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
                        accountRow,
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-navy-900">{tKind(payment.kind)}</p>
                        <Figure size="sm" className="mt-1 block text-navy-600">
                          {payment.id}
                        </Figure>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                        <StatusChip tone={paymentTone[payment.status]} label={tStatus(payment.status)} />
                        <Money
                          amount={payment.amountUsd}
                          className="min-w-16 text-end font-data text-body-md font-semibold text-navy-900"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-2 text-body-sm text-navy-600">{t("noPayments")}</p>
              )}
            </div>
          </AccountPanel>
        </AccountStack>
      </div>
    </AccountShell>
  );
}
