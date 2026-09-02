import type { LocalizedText, SubCategory, Tier } from "@/lib/api/types";

/**
 * Group keys, in words.
 *
 * A result in this platform is keyed `Cycle × Sub-category × Tier × Entry`
 * (Addendum §3.1) — an entry does not have "a rank", it holds a position in a
 * matrix, and can hold different outcomes in each group it entered. "Gold" on
 * its own is therefore not an award; "Gold in Packaging Design × Freelancers"
 * is. Naming the group is how the interface tells the truth about that.
 *
 * **This module used to encode those names.** `parentCategoryCode` returned
 * `VI`, `tierCode` returned `CORP`, and `groupCoordinate` composed them into
 * `VI·02 / CORP` — a compact key set in the display face, taught on Categories
 * and repeated across the winners, jury and finalists screens. It was retired
 * on 2026-08-25 (§1.3 `[map-update]`): **no abbreviation a reader has to decode
 * stands on a finished page.**
 *
 * What is left is the fact the codes were standing for. A group is its
 * sub-category and its tier, both named in full, and there is no third,
 * shorter spelling of either. The matrix is unchanged; only the shorthand is
 * gone.
 */

/** The tier's own name, from the `tier` namespace, so there is one spelling. */
export type TierName = (tier: Tier) => string;

/**
 * A group, named: "Packaging Design · Freelancers".
 *
 * Takes the tier's name rather than deriving it, because tier names are
 * translated copy and live in the message catalogue — deriving them here would
 * put a second spelling of "Companies / Agencies" in the codebase.
 *
 * The separator is a middot, not a slash: "Companies / Agencies" already
 * carries a slash inside its own name, and two of them in one line reads as
 * three things rather than two.
 */
export function groupName(
  sub: SubCategory,
  locale: keyof LocalizedText,
  tierName: string,
): string {
  return `${sub.name[locale]} · ${tierName}`;
}
