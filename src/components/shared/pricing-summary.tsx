"use client";

import { Lock } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import type { Locale } from "@/i18n/routing";
import type { PricingSnapshot } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Pricing summary: base + Σ sub-category fees − loyalty − promo = total.
 *
 * Renders both a live quote and a frozen snapshot from the same shape, since
 * a snapshot is just a quote that was locked at checkout (§3.4). When `frozen`
 * is set the panel says so, because that quote can never be re-priced.
 */
export function PricingSummary({
  snapshot,
  frozen = false,
  className,
}: {
  snapshot: PricingSnapshot;
  frozen?: boolean;
  className?: string;
}) {
  const t = useTranslations("pricing");
  const tWindow = useTranslations("pricingWindow");
  const tTier = useTranslations("tier");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const money = (amount: number) =>
    format.number(amount, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className={cn("border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-navy-900 px-4 py-3 text-cream-100">
        <h3 className="font-display text-data-sm uppercase">{t("summary")}</h3>
        {frozen ? (
          <span className="inline-flex items-center gap-1.5 font-display text-coord uppercase text-cream-200/70">
            <Lock className="size-3" aria-hidden />
            {t("quotedAt", {
              date: format.dateTime(new Date(snapshot.quotedAt), { dateStyle: "medium" }),
            })}
          </span>
        ) : null}
      </div>
      <div className="p-4">

      <dl className="space-y-2 text-body-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">
            {t("basePrice", {
              tier: tTier(`short.${snapshot.tier}`),
              window: tWindow(snapshot.window),
            })}
          </dt>
          <dd className="font-data text-data-md">{money(snapshot.basePriceUsd)}</dd>
        </div>

        {snapshot.additionalSubCategories.length > 0 ? (
          <>
            <div className="pt-1 font-display text-coord uppercase text-navy-500">
              {t("additionalSubCategories")}
            </div>
            {snapshot.additionalSubCategories.map((line) => (
              <div
                key={line.subCategoryId}
                className="flex items-baseline justify-between gap-4 ps-3"
              >
                <dt className="text-muted-foreground">{line.label[locale]}</dt>
                <dd className="font-data text-data-md">{money(line.amountUsd)}</dd>
              </div>
            ))}
          </>
        ) : null}

        <Separator className="my-2" />

        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{t("subtotal")}</dt>
          <dd className="font-data text-data-md">{money(snapshot.subtotalUsd)}</dd>
        </div>

        {snapshot.loyalty ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">
              {t("loyaltyDiscount")}
              <span className="ms-1 text-caption">
                (
                {t("loyaltyHint", {
                  count: snapshot.submissionNumber,
                  percent: snapshot.loyalty.percentOff,
                })}
                )
              </span>
            </dt>
            <dd className="font-data text-data-md text-blue-700">−{money(snapshot.loyalty.amountUsd)}</dd>
          </div>
        ) : null}

        {snapshot.promo ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">
              {t("promoDiscount")}
              <span className="ms-1 font-mono text-caption">{snapshot.promo.code}</span>
            </dt>
            <dd className="font-data text-data-md text-blue-700">−{money(snapshot.promo.amountUsd)}</dd>
          </div>
        ) : null}

          <Separator className="my-3" />

          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-display text-data-sm uppercase">{t("total")}</dt>
            <dd className="font-data text-data-lg">{money(snapshot.totalUsd)}</dd>
          </div>
        </dl>

        {frozen ? (
          <p className="mt-3 border-t border-border pt-3 text-caption text-muted-foreground">
            {t("snapshotNote")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
