import { getFormatter, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Meta } from "@/components/account/system";
import type { PricingSnapshot } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The frozen quote behind one payment.
 *
 * **Displayed, never recalculated.** The snapshot is what was agreed at
 * checkout; running today's config over an old payment is how a receipt stops
 * matching what was charged. Every line here is read out of the stored object,
 * including the discounts, and the note says so.
 *
 * **Contained, and narrow.** Opened inside a table it used to inherit the
 * table's full width, so its lines ran three thousand pixels from label to
 * figure and read as *more payments* rather than as the breakdown of one. With
 * two open at once there was no way to tell where a quote ended and the next
 * payment began.
 *
 * What fixes it: the quote sits in its own bordered card, inset from the start
 * edge so it reads as subordinate to the row above it; its lines are held to a
 * reading measure; it names the payment it belongs to; and its total is a
 * figure inside a quote, not the biggest number on the page.
 *
 * The "never recalculated" sentence is said **once**, in the Payments panel's
 * own header, rather than repeated under every open quote.
 */
export async function SnapshotDetails({
  snapshot,
  paymentId,
  locale,
}: {
  snapshot: PricingSnapshot | null;
  /** Which payment this quote belongs to. Shown, so several open at once
   *  stay attributable without scrolling back to the row. */
  paymentId?: string;
  locale: Locale;
}) {
  const [t, format] = await Promise.all([getTranslations("billing"), getFormatter()]);

  if (!snapshot) {
    return (
      <div className="border-s-2 border-navy-900/20 ps-5">
        <p className="max-w-[32rem] border border-navy-900/12 bg-white p-5 text-body-sm text-navy-600">
          {t("noSnapshot")}
        </p>
      </div>
    );
  }

  const row = (label: string, amount: number, tone?: "credit") => (
    <div className="flex items-baseline justify-between gap-6 border-b border-navy-900/8 py-2 last:border-b-0">
      <dt className={cn("text-body-sm", tone ? "text-blue-700" : "text-navy-700")}>{label}</dt>
      <dd
        className={cn(
          "shrink-0 font-data text-body-sm tabular-nums",
          tone ? "text-blue-700" : "text-navy-900",
        )}
      >
        {tone ? "−" : ""}
        {`$${amount.toLocaleString("en-US")}`}
      </dd>
    </div>
  );

  return (
    /* Inset from the start edge: this belongs to the row above it. */
    <div className="border-s-2 border-navy-900/20 ps-5">
      <div className="max-w-[32rem] border border-navy-900/12 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-navy-900/12 pb-3">
          <p className="text-body-sm font-semibold text-navy-900">
            {t("snapshot")}
            {paymentId ? (
              <span className="ms-2 font-data text-[0.8125rem] font-normal text-navy-600">
                {paymentId}
              </span>
            ) : null}
          </p>
          <Meta>
            {t("quotedAt")}{" "}
            {format.dateTime(new Date(snapshot.quotedAt), { dateStyle: "medium" })}
          </Meta>
        </div>

        <dl className="mt-3 flex flex-col">
          {row(`${t("basePrice")} · ${snapshot.tier} · ${snapshot.window}`, snapshot.basePriceUsd)}
          {snapshot.additionalSubCategories.map((line) => (
            <div key={line.subCategoryId} className="contents">
              {row(`${t("addOn")} · ${line.label[locale]}`, line.amountUsd)}
            </div>
          ))}
          {row(t("subtotal"), snapshot.subtotalUsd)}
          {snapshot.loyalty
            ? row(
                `${t("loyalty")} −${snapshot.loyalty.percentOff}%`,
                snapshot.loyalty.amountUsd,
                "credit",
              )
            : null}
          {snapshot.promo
            ? row(`${t("promo")} · ${snapshot.promo.code}`, snapshot.promo.amountUsd, "credit")
            : null}
          {snapshot.credit
            ? row(`${t("credit")} · ${snapshot.credit.code}`, snapshot.credit.amountUsd, "credit")
            : null}

          {/* The total of this quote — not the biggest number on the page. */}
          <div className="mt-2 flex items-baseline justify-between gap-6 border-t-2 border-navy-900 pt-3">
            <dt className="text-body-md font-semibold text-navy-900">{t("total")}</dt>
            <dd className="shrink-0 font-data text-data-md tabular-nums text-navy-900">
              {`$${snapshot.totalUsd.toLocaleString("en-US")}`}
            </dd>
          </div>
        </dl>

        <Meta className="mt-4 block">
          {t("submissionNumber")}: {snapshot.submissionNumber}
        </Meta>
      </div>
    </div>
  );
}
