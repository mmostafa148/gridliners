import { cn } from "@/lib/utils";

/**
 * The tonal pixel mosaic the identity is built on.
 *
 * It is on the cover, the section dividers, the certificates, the report covers
 * and the event badges: a grid of large squares in one hue at a few strengths,
 * gathered toward a corner and thinning across the sheet, with the ground
 * showing through most of it. Not an even scatter, and never dense enough to
 * become a texture.
 *
 * Deterministic from `seed`, so a given surface always draws the same mosaic
 * and the server and the client agree on it.
 */

export type MosaicTone = "blue" | "navy" | "cream" | "gold" | "silver" | "bronze" | "lime";

const STEPS: Record<MosaicTone, string[]> = {
  blue: ["bg-blue-700/25", "bg-blue-700/45", "bg-blue-700/70", "bg-blue-700"],
  navy: ["bg-navy-900/25", "bg-navy-900/45", "bg-navy-900/70", "bg-navy-900"],
  cream: ["bg-cream-200/20", "bg-cream-200/40", "bg-cream-200/65", "bg-cream-200"],
  gold: ["bg-gold/25", "bg-gold/45", "bg-gold/70", "bg-gold"],
  silver: ["bg-silver/25", "bg-silver/45", "bg-silver/70", "bg-silver"],
  bronze: ["bg-bronze/30", "bg-bronze/50", "bg-bronze/75", "bg-bronze"],
  lime: ["bg-campaign-lime/25", "bg-campaign-lime/45", "bg-campaign-lime/70", "bg-campaign-lime"],
};

export function PixelMosaic({
  tone,
  seed,
  columns = 6,
  rows = 5,
  /** Which corner the cluster hangs off. */
  from = "end-top",
  /** 0..1. How much of the field lights at that corner. */
  density = 0.92,
  className,
}: {
  tone: MosaicTone;
  seed: string;
  columns?: number;
  rows?: number;
  from?: "start-top" | "end-top" | "start-bottom" | "end-bottom";
  density?: number;
  className?: string;
}) {
  let h = 2166136261;
  for (const ch of seed) h = ((h ^ ch.charCodeAt(0)) * 16777619) >>> 0;

  const atEnd = from === "end-top" || from === "end-bottom";
  const atTop = from === "start-top" || from === "end-top";

  return (
    <div
      aria-hidden
      className={cn("grid gap-px", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns * rows }, (_, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        // Distance from the chosen corner: 0 at it, 1 at the far side.
        const dx = atEnd ? (columns - 1 - col) / (columns - 1) : col / (columns - 1);
        const dy = atTop ? row / (rows - 1) : (rows - 1 - row) / (rows - 1);
        const away = (dx + dy) / 2;
        h = (h * 1664525 + 1013904223) >>> 0;
        const roll = ((h >>> 16) % 1000) / 1000;
        if (roll > density - away) return <span key={i} className="aspect-square" />;
        const step = Math.min(3, Math.max(0, Math.round((1 - away) * 3.4)));
        return <span key={i} className={cn("aspect-square", STEPS[tone][step])} />;
      })}
    </div>
  );
}
