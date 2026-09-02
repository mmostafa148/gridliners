import { Building2, GraduationCap, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Tier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * One mark per tier.
 *
 * From `lucide-react` — already a dependency, so no new package, and
 * ISC-licensed with no attribution to carry. The same three marks 1.4 How to
 * Enter has carried since it was approved: a Students mark means the same thing
 * wherever a reader meets it, which is what makes this a system rather than
 * three pictures.
 *
 * **They identify, they do not rank.** A student, a person working alone, an
 * organisation — that is the actual distinction between the three, and it is
 * the only thing a mark here may say. The tiers are peers, and anything
 * implying seniority or scale would be a lie dressed as decoration. Everything
 * else about a tier's presentation stays identical across all three: same size,
 * same weight, same colour, same placement. Only the glyph differs, because
 * only identity differs.
 *
 * Stroke 1.5 rather than lucide's default 2: the default reads heavy against
 * Presicav, which is a wide face with fine joins.
 *
 * `currentColor` throughout, so a mark inverts with whatever surface it sits on
 * — these appear on cream over navy, and on navy over a cell that turns navy on
 * hover.
 *
 * **`entry-cost.tsx` still holds its own copy of this map.** 1.4 is approved
 * and closed, so it was left alone rather than pointed here; the two must be
 * kept in step until 1.4 is next open for a reason of its own. Logged in
 * build-state §9.
 */
const TIER_ICON: Record<Tier, LucideIcon> = {
  students: GraduationCap,
  freelancers: UserRound,
  corporate: Building2,
};

export function TierMark({ tier, className }: { tier: Tier; className?: string }) {
  const Icon = TIER_ICON[tier];
  return <Icon aria-hidden strokeWidth={1.5} className={cn("shrink-0", className)} />;
}
