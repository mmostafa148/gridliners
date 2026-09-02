import type { Metadata } from "next";
import { Check, Clock, XCircle } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { Money } from "@/components/account/docket";
import {
  AccountDataList,
  AccountDatum,
  AccountPanel,
  Meta,
  accountAction,
} from "@/components/account/system";
import { Countdown } from "@/components/shared/countdown";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { requireOwnEntry, requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("successTitle") };
}

/**
 * 2.5 — the checkout result.
 *
 * **The route decision, recorded.** `/entries/[id]/checkout`, one route for
 * every outcome. The alternative was a route per outcome — `/success`,
 * `/pending`, `/failed` — and it is wrong for one reason: the outcome is not a
 * fact about the request, it is the state of the entry, and a URL that names an
 * outcome can be visited when that outcome is no longer true. This reads the
 * entry and says what is actually the case.
 *
 * **That is also what makes it idempotent.** The page performs nothing. A
 * refresh, a back-button return, a shared link — all re-read the same entry and
 * render the same answer. Nothing is charged twice because nothing is charged
 * here at all; the charge happened in the action that redirected here, and that
 * action refuses an entry that has already left draft.
 */
export default async function CheckoutResultPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();
  const entry = await requireOwnEntry(id, participant.id);

  const [t, tMethod, format] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("paymentMethod"),
    getFormatter(),
  ]);

  const payments = await api.payments.forEntry(entry.id);
  // The entry-fee payment for this checkout: the newest one, because a
  // tier supplement is a different charge and must not be reported as this.
  const payment = [...payments]
    .filter((p) => p.kind === "entry_fee")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];

  const outcome: "success" | "pending" | "failed" | "expired" =
    !payment
      ? "failed"
      : payment.status === "paid"
        ? "success"
        : payment.status === "pending"
          ? "pending"
          : payment.status === "expired"
            ? "expired"
            : "failed";

  const tone = {
    success: { mark: "bg-blue-700 text-cream-50", Icon: Check },
    pending: { mark: "bg-campaign-yellow text-navy-950", Icon: Clock },
    expired: { mark: "bg-campaign-orange text-white", Icon: XCircle },
    failed: { mark: "bg-campaign-orange text-white", Icon: XCircle },
  }[outcome];

  const dateTime = (v: string) =>
    format.dateTime(new Date(v), { dateStyle: "medium", timeStyle: "short" });

  return (
    <AccountShell
      participantId={participant.id}
     
      locale={locale}
      action={
        <Link href={`/entries/${entry.id}`} className={accountAction.secondary}>
          {t("viewEntry")}
        </Link>
      }
    >
      {/* The outcome is the subject: the page opens on what happened. */}
      <div className="account-shell pt-7 md:pt-9">
        <span
          className={cn(
            "inline-flex items-center gap-3 px-5 py-2.5 text-body-md font-medium",
            tone.mark,
          )}
        >
          <tone.Icon aria-hidden className="size-5" strokeWidth={2.5} />
          {t(`${outcome}Title`)}
        </span>
        <h1 className="mt-6 max-w-[20ch] font-display text-account-title text-navy-900">
          {t(`${outcome}Title`)}
        </h1>
        <p className="mt-4 max-w-[58ch] text-body-lg leading-relaxed text-navy-700">
          {t(`${outcome}Lead`)}
        </p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        <div className="flex flex-col gap-5">
        <AccountPanel title={t("entry")}>
          <AccountDataList columns={3}>
            <AccountDatum label={t("entry")}>{entry.title}</AccountDatum>
            <AccountDatum label={t("entryId")} figure>{entry.id}</AccountDatum>
            {payment ? (
              <>
                <AccountDatum label={t("amount")} figure>
                  <Money amount={payment.amountUsd} />
                </AccountDatum>
                <AccountDatum label={t("method")}>{tMethod(payment.method)}</AccountDatum>
                <AccountDatum
                  label={outcome === "pending" ? t("cashRef") : t("reference")}
                  figure
                >
                  {payment.invoiceNumber}
                </AccountDatum>
                {payment.confirmedAt ? (
                  <AccountDatum label={t("paidAt")} figure>
                    {dateTime(payment.confirmedAt)}
                  </AccountDatum>
                ) : null}
                {payment.expiresAt ? (
                  <AccountDatum label={t("payBefore")} figure>
                    {dateTime(payment.expiresAt)}
                  </AccountDatum>
                ) : null}
              </>
            ) : null}
          </AccountDataList>
          <Meta className="mt-7 block">{t("mockNote")}</Meta>
        </AccountPanel>

        {outcome === "pending" && payment?.expiresAt ? (
          <AccountPanel title={t("timeLeft")}>
            <Countdown target={payment.expiresAt} />
          </AccountPanel>
        ) : null}

        {outcome === "success" || outcome === "pending" ? (
          <AccountPanel title={t("nextTitle")}>
            <p className="max-w-[68ch] text-body-md text-navy-700">
              {outcome === "success" ? t("nextSubmitted") : t("nextCash")}
            </p>
          </AccountPanel>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href={`/entries/${entry.id}`} className={accountAction.primary}>
            {t("viewEntry")}
          </Link>
          <Link href="/entries" className={accountAction.quiet}>
            {t("myEntries")}
          </Link>
          <Link href="/billing" className={accountAction.quiet}>
            {t("billing")}
          </Link>
          <Link href="/dashboard" className={accountAction.quiet}>
            {t("dashboard")}
          </Link>
        </div>
        </div>
      </div>
    </AccountShell>
  );
}
