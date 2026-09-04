"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * What the entry is, so far.
 *
 * **Persistent from step 1 to step 6.** The brief asks for "a persistent
 * understanding of the selected tier, categories, add-ons and running total as
 * the flow advances"; the previous wizard showed the total only on step 2 and
 * step 5, so between them the participant was choosing without knowing what it
 * cost.
 *
 * A strip, not a sidebar: the wizard's steps already use the full measure, and
 * a permanent aside would take a third of the width from a form that needs it.
 * Slots that are not yet filled say so rather than being hidden, so the strip
 * does not change shape as it fills.
 */
export function EntrySoFar({
  tier,
  base,
  addOns,
  total,
  className,
}: {
  tier: string | null;
  base: string | null;
  addOns: number;
  total: number | null;
  className?: string;
}) {
  const t = useTranslations("wizard.soFar");

  const slot = (label: string, value: string | null) => (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-caption text-cream-200/65">{label}</span>
      <span
        className={cn(
          "truncate text-body-md",
          value ? "font-medium text-cream-50" : "text-cream-200/65",
        )}
      >
        {value ?? t("notYet")}
      </span>
    </span>
  );

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-x-10 gap-y-4 overflow-hidden bg-navy-950 px-5 py-4 text-cream-50 sm:px-6",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
      {slot(t("tier"), tier)}
      {slot(t("category"), base)}
      {slot(t("addOns"), addOns ? String(addOns) : null)}
      <span className="flex items-baseline gap-3 md:ms-auto">
        <span className="text-caption text-cream-200/65">{t("total")}</span>
        <span
          aria-live="polite"
          className={cn(
            "font-data text-data-md tabular-nums",
            total === null ? "text-cream-200/65" : "text-gold",
          )}
        >
          {total === null ? t("notYet") : `$${total.toLocaleString("en-US")}`}
        </span>
      </span>
    </div>
  );
}
