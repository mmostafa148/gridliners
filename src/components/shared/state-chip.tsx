"use client";

import { useTranslations } from "next-intl";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EntryState } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * State chip for all nine entry states, plus the derived "Winner".
 *
 * `winner` is deliberately not an EntryState — it is derived from group results
 * (§3.7) — so it is a separate variant here rather than a tenth state.
 *
 * Each chip is marked by a single filled square rather than an icon. Ten states
 * meant ten icons competing for attention, and a lone pixel is both quieter and
 * closer to the identity: the status reads as one cell of the grid.
 */
export type StateChipValue = EntryState | "winner";

/** [chip surface, marker fill] */
const STATE_STYLES: Record<StateChipValue, [string, string]> = {
  draft: ["border-navy-200 text-navy-600", "bg-navy-300"],
  pending_payment: ["border-campaign-yellow text-navy-900", "bg-campaign-yellow"],
  submitted: ["border-blue-200 text-blue-800", "bg-blue-400"],
  verified: ["border-blue-300 text-blue-900", "bg-blue-700"],
  shortlisted: ["border-finalist text-blue-900", "bg-finalist"],
  not_shortlisted: ["border-navy-200 text-navy-600", "bg-navy-200"],
  excluded: ["border-campaign-orange text-navy-900", "bg-campaign-orange"],
  cancelled: ["border-navy-200 text-navy-600", "bg-navy-400"],
  disqualified: ["border-destructive/50 text-destructive", "bg-destructive"],
  winner: ["border-gold bg-gold-soft text-navy-900", "bg-gold"],
};

export function StateChip({
  state,
  showDescription = true,
  className,
}: {
  state: StateChipValue;
  /** Wraps the chip in a tooltip explaining what the state means. */
  showDescription?: boolean;
  className?: string;
}) {
  const t = useTranslations("entryState");
  const [surface, marker] = STATE_STYLES[state];

  const chip = (
    <span
      data-state={state}
      className={cn(
        "inline-flex items-center gap-2 border px-2 py-1 font-display text-coord uppercase",
        surface,
        className,
      )}
    >
      <span className={cn("size-2 shrink-0", marker)} aria-hidden />
      {t(state)}
    </span>
  );

  if (!showDescription) return chip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{chip}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{t(`description.${state}`)}</TooltipContent>
    </Tooltip>
  );
}

export const STATE_CHIP_VALUES: StateChipValue[] = [
  "draft",
  "pending_payment",
  "submitted",
  "verified",
  "shortlisted",
  "not_shortlisted",
  "excluded",
  "cancelled",
  "disqualified",
  "winner",
];
