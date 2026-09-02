import { getFormatter, getTranslations } from "next-intl/server";

import { Money } from "@/components/account/docket";
import {
  Figure,
  Meta,
  StatusChip,
  TABLE_CELL,
  TABLE_HEAD,
  TABLE_NUM,
  TABLE_ROW,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Credit } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Next-cycle credits, as a table.
 *
 * **Because the payments table is directly above it.** Credits were a row list
 * that led with a right-aligned amount, so every figure sat 112px in from the
 * panel's own left edge while the heading, the payments table and everything
 * else started at the inset — the misalignment was structural, not a stray
 * class. Two lists stacked in the same column should not be built two ways.
 *
 * Same columns-then-blocks shape as `PaymentTable`: a real table from `lg` with
 * `scope` on every heading, and a labelled block per credit below it. The
 * amount is the last column and right-aligned, which is where a figure that is
 * compared down a column belongs.
 */
const EDGE_START = "ps-5 sm:ps-7";
const EDGE_END = "pe-5 sm:pe-7";

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

  const head = TABLE_HEAD;
  const cell = TABLE_CELL;

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
    <>
      <table className="hidden w-full border-collapse text-start lg:table">
        <caption className="sr-only">{t("creditsTitle")}</caption>
        <thead>
          <tr className="border-b border-navy-900/15">
            <th scope="col" className={cn(head, "w-40 pe-4", EDGE_START)}>{t("creditCode")}</th>
            <th scope="col" className={cn(head, "pe-6")}>{t("creditFor")}</th>
            <th scope="col" className={cn(head, "w-36 pe-4")}>{t("colStatus")}</th>
            <th scope="col" className={cn(head, "w-28 pe-4")}>{t("creditCycle")}</th>
            <th scope="col" className={cn(head, "w-32 pe-4")}>{t("colDate")}</th>
            <th scope="col" className={cn(head, "w-28 text-end", EDGE_END)}>
              {t("creditAmount")}
            </th>
          </tr>
        </thead>
        <tbody>
          {credits.map((credit) => (
            <tr key={credit.code} className={TABLE_ROW}>
              <td className={cn(cell, "pe-4", EDGE_START)}>
                <Figure size="sm" className="whitespace-nowrap text-navy-600">
                  {credit.code}
                </Figure>
              </td>
              <td className={cn(cell, "pe-6")}>{entry(credit)}</td>
              <td className={cn(cell, "pe-4")}>{status(credit)}</td>
              <td className={cn(cell, "pe-4")}>
                <Figure size="sm" className="text-navy-800">
                  {validFor(credit)}
                </Figure>
              </td>
              <td className={cn(cell, "pe-4")}>
                <Figure size="sm" className="whitespace-nowrap text-navy-800">
                  {when(credit)}
                </Figure>
              </td>
              <td className={cn(cell, TABLE_NUM, "text-end", EDGE_END)}>
                <Money
                  amount={credit.amountUsd}
                  className={cn(
                    "text-body-md font-semibold",
                    credit.redeemedAt ? "text-navy-600" : "text-navy-900",
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phone and tablet: a block per credit. Every column survives. */}
      <ul className="flex flex-col lg:hidden">
        {credits.map((credit) => (
          <li
            key={credit.code}
            className={cn("border-b border-navy-900/8 py-5 last:border-b-0", EDGE_START, EDGE_END)}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Money
                amount={credit.amountUsd}
                className={cn(
                  "font-data text-data-md tabular-nums",
                  credit.redeemedAt ? "text-navy-600" : "text-navy-900",
                )}
              />
              {status(credit)}
            </div>
            <div className="mt-3">{entry(credit)}</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-caption text-navy-600">{t("creditCycle")}</dt>
                <dd className="mt-0.5">
                  <Figure size="sm" className="text-navy-800">{validFor(credit)}</Figure>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-navy-600">{t("colDate")}</dt>
                <dd className="mt-0.5">
                  <Figure size="sm" className="text-navy-800">{when(credit)}</Figure>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-caption text-navy-600">{t("creditCode")}</dt>
                <dd className="mt-0.5">
                  <Figure size="sm" className="text-navy-600">{credit.code}</Figure>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <Meta className="sr-only">{t("creditsTitle")}</Meta>
    </>
  );
}
