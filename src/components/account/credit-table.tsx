import { getFormatter, getTranslations } from "next-intl/server";

import { Money } from "@/components/account/docket";
import {
  Figure,
  StatusChip,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Credit } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Credits are future spending power, not another payment ledger. */

export async function CreditTable({
  credits,
  titleOf,
  yearOf,
}: {
  credits: Credit[];
  titleOf: Map<string, string>;
  yearOf: Map<string, number>;
}) {
  const [t, format] = await Promise.all([getTranslations("billing"), getFormatter()]);

  const status = (credit: Credit) => (
    <StatusChip
      tone={credit.redeemedAt ? "closed" : "progress"}
      label={credit.redeemedAt ? t("creditRedeemed") : t("creditOpen")}
    />
  );

  const entry = (credit: Credit) => (
    <Link
      href={`/entries/${credit.issuedForEntryId}`}
      className="text-body-sm font-medium text-navy-900 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      {titleOf.get(credit.issuedForEntryId) ?? credit.issuedForEntryId}
    </Link>
  );

  const when = (credit: Credit) =>
    format.dateTime(new Date(credit.redeemedAt ?? credit.issuedAt), { dateStyle: "medium" });

  const validFor = (credit: Credit) =>
    yearOf.get(credit.validForCycleId) ?? credit.validForCycleId.replace("cycle-", "");

  return (
    <ul className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
      {credits.map((credit) => {
        const redeemed = Boolean(credit.redeemedAt);
        return (
          <li
            key={credit.code}
            className={cn(
              "relative border p-5 sm:p-6",
              redeemed
                ? "border-navy-900/10 bg-mist/55"
                : "border-gold/70 bg-cream-50",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 top-0 h-1",
                redeemed ? "bg-navy-300" : "bg-gold",
              )}
            />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.06em] text-navy-600">
                  {t("creditAmount")}
                </p>
                <Money
                  amount={credit.amountUsd}
                  className={cn(
                    "mt-2 block font-data text-data-lg tabular-nums",
                    redeemed ? "text-navy-600" : "text-gold-deep",
                  )}
                />
              </div>
              {status(credit)}
            </div>

            <div className="mt-6 border-t border-navy-900/10 pt-5">
              <p className="text-caption text-navy-600">{t("creditFor")}</p>
              <div className="mt-1">{entry(credit)}</div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-caption text-navy-600">{t("creditCycle")}</dt>
                <dd className="mt-1">
                  <Figure size="sm" className="text-navy-900">{validFor(credit)}</Figure>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-navy-600">
                  {redeemed ? t("creditRedeemed") : t("creditIssued")}
                </dt>
                <dd className="mt-1">
                  <Figure size="sm" className="text-navy-900">{when(credit)}</Figure>
                </dd>
              </div>
              <div className="col-span-2 border-t border-navy-900/10 pt-4">
                <dt className="text-caption text-navy-600">{t("creditCode")}</dt>
                <dd className="mt-1">
                  <Figure size="sm" className="break-all text-navy-700">{credit.code}</Figure>
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
