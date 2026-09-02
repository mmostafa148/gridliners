import {
  Camera,
  Film,
  Grid2x2,
  LayoutTemplate,
  MonitorSmartphone,
  Package,
  Shapes,
  Type as TypeMark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One mark per parent category.
 *
 * From `lucide-react` — already a dependency, ISC-licensed with no attribution
 * to carry. The same seven marks 1.3 Categories has carried since it was
 * approved: a Packaging mark means the same thing wherever a reader meets it,
 * which is what makes this a system rather than seven pictures. `TierMark`
 * exists for the same reason and follows the same rule.
 *
 * **They identify, they do not rank.** Seven peers; nothing in the set implies
 * an order, a size or a seniority, and everything else about a category's
 * presentation stays identical across all seven.
 *
 * Stroke 1.5 rather than lucide's default 2: the default reads heavy against
 * Presicav, which is a wide face with fine joins. `currentColor` throughout, so
 * a mark inverts with whatever surface it sits on.
 *
 * An unmapped parent falls back to the generic mark rather than crashing, so a
 * taxonomy the client extends renders rather than breaking.
 *
 * **`category-groups.tsx` still holds its own copy of this map.** 1.3 is
 * approved and closed, so it was left alone rather than pointed here; the two
 * must be kept in step until 1.3 is next open for a reason of its own. Logged
 * in build-state §9 alongside the same note about the tier marks.
 */
const PARENT_MARK: Record<string, LucideIcon> = {
  "visual-identity": Shapes,
  packaging: Package,
  type: TypeMark,
  photography: Camera,
  film: Film,
  digital: MonitorSmartphone,
  layout: LayoutTemplate,
};

/**
 * The mark for "every category".
 *
 * Not one of the seven and deliberately not `Shapes`, which is Visual
 * Identity's own mark and would say "all" and "visual identity" with the same
 * glyph. A grid of cells is the identity's own figure for a whole set.
 */
export const ALL_CATEGORIES_MARK: LucideIcon = Grid2x2;

export function ParentMark({
  parentId,
  className,
}: {
  /** `null` for the whole set. */
  parentId: string | null;
  className?: string;
}) {
  const Icon = parentId === null ? ALL_CATEGORIES_MARK : (PARENT_MARK[parentId] ?? Shapes);
  return <Icon aria-hidden strokeWidth={1.5} className={cn("shrink-0", className)} />;
}
