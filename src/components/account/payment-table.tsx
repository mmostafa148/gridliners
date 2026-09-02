import { Download } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { PaymentRow } from "@/components/account/payment-row";
import { SnapshotDetails } from "@/components/account/snapshot-details";
import {
  Figure,
  Meta,
  StatusChip,
  TABLE_CELL,
  TABLE_HEAD,
  TABLE_NUM,
  accountAction,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Payment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The financial record: the sitemap's own columns.
 *
 * *"List of all payments → Payment ID · Payment Date · Payment Description ·
 * Payment Amount · Payment Method · Download Invoice."* That is a table, and
 * this is one — a real `<table>` with a header row, `scope` on every heading,
 * and one row per payment, so a screen reader announces the column with the
 * cell and a sighted reader compares down a column.
 *
 * **Billing is where the portfolio direction stops.** Decorative bands would
 * make comparable numbers harder to compare, so the direction contributes its
 * typography and its identity, and nothing else.
 *
 * **The mobile form hides nothing.** Below `lg` each row becomes a block whose
 * cells carry their own labels; the amount leads, because that is what a
 * payment is. The status marker, the method, the reference and the invoice are
 * all still there.
 *
 * The frozen quote stays a `<details>` under its own row: it is supplementary,
 * it belongs beside what it explains, and the browser gives the disclosure
 * keyboard behaviour for nothing.
 */
/** Which chip tone each payment status belongs to. */
const TONE: Record<string, "progress" | "waiting" | "closed" | "adverse"> = {
  paid: "progress",
  pending: "waiting",
  expired: "closed",
  refunded: "closed",
  failed: "adverse",
};

export async function PaymentTable({
  payments,
  titleOf,
  locale,
}: {
  payments: Payment[];
  titleOf: Map<string, string>;
  locale: Locale;
}) {
  const [t, tStatus, tKind, tMethod, format] = await Promise.all([
    getTranslations("billing"),
    getTranslations("paymentStatus"),
    getTranslations("paymentKind"),
    getTranslations("paymentMethod"),
    getFormatter(),
  ]);

  const head = TABLE_HEAD;
  const cell = TABLE_CELL;
  // Cell-level insets: a table's own padding never reaches its cells.
  const EDGE_START = "ps-5 sm:ps-7";
  const EDGE_END = "pe-5 sm:pe-7";

  const status = (s: string) => <StatusChip label={tStatus(s)} tone={TONE[s] ?? "neutral"} />;

  const invoice = (id: string) => (
    <a
      href={`/${locale}/downloads/invoice/${id}`}
      className={cn(accountAction.quiet, "gap-2 whitespace-nowrap")}
    >
      <Download aria-hidden className="size-4" />
      {t("invoice")}
    </a>
  );

  const snapshot = (payment: Payment) => (
    <details className="group">
      <summary className="w-fit cursor-pointer list-none text-body-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700">
        <span className="group-open:hidden">{t("showSnapshot")}</span>
        <span className="hidden group-open:inline">{t("hideSnapshot")}</span>
      </summary>
      <div className="mt-5 border-s-2 border-navy-900/15 ps-6">
        <SnapshotDetails snapshot={payment.snapshot} paymentId={payment.id} locale={locale} />
      </div>
    </details>
  );

  return (
    <>
      {/* Desktop: a table, for comparison down a column. */}
      <table className="hidden w-full border-collapse text-start lg:table">
        <caption className="sr-only">{t("tableLabel")}</caption>
        <thead>
          <tr className="border-b border-navy-900/15">
            <th scope="col" className={cn(head, "w-28 whitespace-nowrap pe-4", EDGE_START)}>{t("colId")}</th>
            <th scope="col" className={cn(head, "w-32 pe-4")}>{t("colDate")}</th>
            <th scope="col" className={cn(head, "pe-6")}>{t("colDescription")}</th>
            <th scope="col" className={cn(head, "w-24 pe-4")}>{t("colMethod")}</th>
            <th scope="col" className={cn(head, "w-32 pe-4")}>{t("colStatus")}</th>
            <th scope="col" className={cn(head, "w-28 pe-8 text-end")}>{t("colAmount")}</th>
            <th scope="col" className={cn(head, "w-32")}>{t("colInvoice")}</th>
            <th scope="col" className={cn(head, "w-14", EDGE_END)}>
              <span className="sr-only">{t("snapshot")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              columns={8}
              edgeEnd={EDGE_END}
              snapshot={
                <SnapshotDetails
                  snapshot={payment.snapshot}
                  paymentId={payment.id}
                  locale={locale}
                />
              }
              cells={
                <>
                  <td className={cn(cell, "pe-4", EDGE_START)}>
                    <Figure size="sm" className="whitespace-nowrap text-navy-600">
                      {payment.id}
                    </Figure>
                  </td>
                  <td className={cn(cell, "pe-4")}>
                    <Figure size="sm" className="whitespace-nowrap text-navy-800">
                      {format.dateTime(new Date(payment.createdAt), { dateStyle: "medium" })}
                    </Figure>
                  </td>
                  <td className={cn(cell, "pe-6")}>
                    <Link
                      href={`/entries/${payment.entryId}`}
                      className="text-body-sm font-medium text-navy-900 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      {titleOf.get(payment.entryId) ?? payment.entryId}
                    </Link>
                    <Meta className="mt-0.5 block">{tKind(payment.kind)}</Meta>
                  </td>
                  <td className={cn(cell, "pe-4")}>
                    <span className="text-body-sm text-navy-800">{tMethod(payment.method)}</span>
                  </td>
                  <td className={cn(cell, "pe-4")}>{status(payment.status)}</td>
                  <td className={cn(cell, TABLE_NUM, "pe-8 text-end")}>
                    <span className="text-body-md font-semibold text-navy-900">
                      ${payment.amountUsd.toLocaleString("en-US")}
                    </span>
                  </td>
                  <td className={cell}>{invoice(payment.id)}</td>
                </>
              }
            />
          ))}
        </tbody>
      </table>

      {/* Phone and tablet: a block per payment. Every column survives. */}
      <ul className="flex flex-col lg:hidden">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className={cn("border-b border-navy-900/8 py-5 last:border-b-0", EDGE_START, EDGE_END)}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className={cn(TABLE_NUM, "text-data-md text-navy-900")}>
                ${payment.amountUsd.toLocaleString("en-US")}
              </span>
              {status(payment.status)}
            </div>

            <Link
              href={`/entries/${payment.entryId}`}
              className="mt-3 block text-body-lg text-navy-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {titleOf.get(payment.entryId) ?? payment.entryId}
            </Link>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-caption text-navy-600">{t("colDescription")}</dt>
                <dd className="mt-0.5 text-body-sm text-navy-800">{tKind(payment.kind)}</dd>
              </div>
              <div>
                <dt className="text-caption text-navy-600">{t("colMethod")}</dt>
                <dd className="mt-0.5 text-body-sm text-navy-800">{tMethod(payment.method)}</dd>
              </div>
              <div>
                <dt className="text-caption text-navy-600">{t("colDate")}</dt>
                <dd className="mt-0.5">
                  <Figure size="sm" className="text-navy-800">
                    {format.dateTime(new Date(payment.createdAt), { dateStyle: "medium" })}
                  </Figure>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-navy-600">{t("colId")}</dt>
                <dd className="mt-0.5">
                  <Figure size="sm" className="text-navy-600">{payment.id}</Figure>
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
              {invoice(payment.id)}
              {snapshot(payment)}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
