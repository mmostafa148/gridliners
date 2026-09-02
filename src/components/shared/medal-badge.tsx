"use client";

import { useTranslations } from "next-intl";

import type { AwardLevel } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Award level.
 *
 * Metal fills carry navy text: gold (2.2:1) and silver (2.6:1) fail AA as text
 * colours on white, so they are only ever used as fills with dark text on top.
 * Bronze passes at 4.6:1 either way.
 *
 * `bare` drops the fill for use inside an already-metal surface, such as the
 * award bar on a winning project card.
 */
const LEVEL_STYLES: Record<AwardLevel | "finalist" | "honorary", string> = {
  gold: "bg-gold text-navy-900",
  silver: "bg-silver text-navy-900",
  bronze: "bg-bronze text-white",
  did_not_place: "bg-navy-50 text-navy-600",
  finalist: "bg-finalist text-white",
  honorary: "bg-honorary text-white",
};

export function MedalBadge({
  level,
  withheld = false,
  bare = false,
  className,
}: {
  level: AwardLevel | "finalist" | "honorary";
  /** Thin-group case: the medal was withheld at Admin review (§3.1). */
  withheld?: boolean;
  /** Omit the fill — for use on a surface already carrying the metal. */
  bare?: boolean;
  className?: string;
}) {
  const t = useTranslations("awardLevel");

  return (
    <span
      data-level={level}
      className={cn(
        "inline-flex items-center px-2 py-1 font-display text-coord uppercase",
        bare ? "px-0 py-0" : LEVEL_STYLES[level],
        withheld && "line-through opacity-70",
        className,
      )}
    >
      {t(level)}
    </span>
  );
}
